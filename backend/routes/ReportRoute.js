const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

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

module.exports = router;
