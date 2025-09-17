const express = require("express");
const router = express.Router();
const Occurrence = require("../models/Occurence");

router.get("/", async (req, res) => {
  try {
    const occurrences = await Occurrence.find().populate("submittedBy");
    res.json(occurrences);
  } catch (err) {
    res.status(500).json({ message: "Error fetching occurrences" });
  }
});


// POST new occurrence
router.post("/", async (req, res) => {
  try {
    const newOccurrence = new Occurrence(req.body);
    await newOccurrence.save();
    res.status(201).json(newOccurrence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving occurrence" });
  }
});

// DELETE an occurrence
router.delete("/:id", async (req, res) => {
  try {
    await Occurrence.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting occurrence" });
  }
});

module.exports = router;
