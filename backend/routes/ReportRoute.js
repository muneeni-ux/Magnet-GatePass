const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Occurrence = require('../models/Occurence');

// GET /api/reports/analytics
// Fast MongoDB aggregation to compute heatmap data
router.get('/analytics', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // 1. Visits by Department (Last 30 days)
        const departmentTraffic = await Visitor.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 2. Peak Entry Hours (All time or last X days)
        // Extract the hour from the ISO string or use MongoDB's date extractor
        const hourlyTraffic = await Visitor.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { 
                $group: { 
                    _id: { $hour: "$createdAt" }, 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } } // Sort by hour 0 - 23
        ]);

        // Format hour for frontend (e.g. 8 AM, 14 PM)
        const formattedHourly = hourlyTraffic.map(h => {
            const hourNumber = h._id;
            const ampm = hourNumber >= 12 ? 'PM' : 'AM';
            const displayHour = hourNumber % 12 || 12;
            return {
                time: `${displayHour} ${ampm}`,
                visitors: h.count
            }
        });

        // 3. Simple Summary Stats
        const totalVisitsThisMonth = departmentTraffic.reduce((acc, curr) => acc + curr.count, 0);

        res.status(200).json({
            success: true,
            data: {
                departments: departmentTraffic.map(d => ({ name: d._id || 'Unknown', count: d.count })),
                hourly: formattedHourly,
                totalVisits: totalVisitsThisMonth
            }
        });
    } catch (error) {
        console.error("Aggregation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate analytics data" });
    }
});

// GET /api/reports/compliance
// Visitor Compliance & Overstay Report
router.get('/compliance', async (req, res) => {
    try {
        const complianceData = await Visitor.aggregate([
            {
                $facet: {
                    "byNature": [
                        { $group: { _id: "$nature", count: { $sum: 1 } } }
                    ],
                    "overstays": [
                        { $match: { timeOut: null } },
                        { $group: { _id: "$department", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: complianceData[0] // $facet returns an array with one object
        });
    } catch (error) {
        console.error("Compliance Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate compliance report" });
    }
});

// GET /api/reports/occurrences
// Security Occurrences & Incident Report
router.get('/occurrences', async (req, res) => {
    try {
        const occurrenceData = await Occurrence.aggregate([
            {
                $group: {
                    _id: "$gate",
                    totalLogs: { $sum: 1 },
                    unusualEvents: {
                        $sum: { $cond: [{ $eq: ["$unusualOccurrence", "Yes"] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: occurrenceData
        });
    } catch (error) {
        console.error("Occurrence Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate occurrences report" });
    }
});

// GET /api/reports/staff-activity
// Staff Efficiency & Activity Report
router.get('/staff-activity', async (req, res) => {
    try {
        const staffData = await Visitor.aggregate([
            {
                $group: {
                    _id: "$recordedBy",
                    totalRegistered: { $sum: 1 },
                    missingCheckouts: {
                        $sum: { $cond: [{ $eq: ["$timeOut", null] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staffDetails"
                }
            },
            {
                $unwind: {
                    path: "$staffDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    staffName: { $ifNull: ["$staffDetails.name", "Unknown Staff"] },
                    role: { $ifNull: ["$staffDetails.role", "Unknown Role"] },
                    totalRegistered: 1,
                    missingCheckouts: 1,
                    complianceRate: {
                        $multiply: [
                            { $divide: [
                                { $subtract: ["$totalRegistered", "$missingCheckouts"] },
                                "$totalRegistered"
                            ]},
                            100
                        ]
                    }
                }
            },
            { $sort: { totalRegistered: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: staffData
        });
    } catch (error) {
        console.error("Staff Activity Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate staff activity report" });
    }
});

module.exports = router;
