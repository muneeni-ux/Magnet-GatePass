const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const Visitor = require("../models/Visitor");

// CREATE Staff Member
router.post("/", async (req, res) => {
  try {
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();
    res.status(201).json(savedStaff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL Staff Members
router.get("/", async (req, res) => {
  try {
    const staffList = await Staff.find({ isActive: true }).sort({ name: 1 });
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ Staff Check-in Logs (Combined logs from Visitor collection with nature='staff')
router.get("/logs/all", async (req, res) => {
  try {
    const logs = await Visitor.find({ nature: "staff" })
      .populate("recordedBy timedOutBy", "username")
      .sort({ createdAt: -1 });

    const logsWithDuration = logs.map((log) => {
      const logObj = log.toObject();
      if (!logObj.duration && logObj.timeOut) {
        const start = new Date(logObj.createdAt);
        const end = new Date(logObj.timeOut);
        const ms = end - start;
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        logObj.duration = `${hours}h ${minutes}m`;
      }
      return logObj;
    });

    res.json(logsWithDuration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Staff Member
router.put("/:id", async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Staff not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Staff Member (Soft Delete)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ error: "Staff not found" });
    res.json({ message: "Staff member deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
