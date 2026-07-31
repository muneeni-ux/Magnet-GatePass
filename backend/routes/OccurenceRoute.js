const express = require("express");
const router = express.Router();
const Occurrence = require("../models/Occurence");
const Settings = require("../models/Settings");
const { sendSmsHelper } = require("./SmsRoute");

router.get("/", async (req, res) => {
  try {
    const occurrences = await Occurrence.find().populate("submittedBy").sort({ createdAt: -1 });
    res.json(occurrences);
  } catch (err) {
    res.status(500).json({ message: "Error fetching occurrences" });
  }
});

// POST new occurrence / SOS emergency alert
router.post("/", async (req, res) => {
  try {
    const newOccurrence = new Occurrence(req.body);
    await newOccurrence.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("occurrence:new", newOccurrence);
    }

    // Send SMS ONLY if explicitly requested via checkbox/incident trigger
    const sendEmergencySms = req.body.sendEmergencySms || req.body.isEmergency || req.body.isIncident;

    if (sendEmergencySms) {
      if (io) {
        io.emit("sos:alert", newOccurrence);
      }

      // Check SOS Emergency SMS settings
      let settings = await Settings.findOne();
      if (settings && settings.sosSmsEnabled && settings.sosPhone) {
        const emergencyMsg = `🚨 [EMERGENCY INCIDENT ALERT] ${newOccurrence.unusualDescription || newOccurrence.title || newOccurrence.type || 'Security Incident'} at Gate: ${newOccurrence.gateLocation || newOccurrence.gate || 'Main Gate'} at ${new Date().toLocaleTimeString()}`;
        
        sendSmsHelper({
          phone: settings.sosPhone,
          message: emergencyMsg,
          source: "sos_emergency",
        }).catch((e) => console.error("Auto SOS SMS Failed:", e));
      }
    }

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
