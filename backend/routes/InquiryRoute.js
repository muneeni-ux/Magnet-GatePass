const express = require("express");
const router = express.Router();
const InquiryStaff = require("../models/Inquiry");

// Create a new staff member
router.post("/", async (req, res) => {
  try {
    const newStaff = new InquiryStaff(req.body);
    const saved = await newStaff.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all staff
router.get("/", async (req, res) => {
  try {
    const staffList = await InquiryStaff.find();
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a staff member by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await InquiryStaff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
