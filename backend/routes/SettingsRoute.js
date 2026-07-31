const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const upload = require("../middleware/cloudinaryUpload");

// Helper to get or create default settings
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({
      logoUrl: "",
      smsEnabled: true,
      sosPhone: "0700000000",
      sosSmsEnabled: true,
    });
    await settings.save();
  }
  return settings;
};

// GET /api/settings - Fetch current settings
router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings - Update settings (SMS switch, SOS phone, SOS SMS toggle, logo URL)
router.put("/", async (req, res) => {
  try {
    let settings = await getOrCreateSettings();
    const { logoUrl, smsEnabled, sosPhone, sosSmsEnabled } = req.body;

    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (smsEnabled !== undefined) settings.smsEnabled = smsEnabled;
    if (sosPhone !== undefined) settings.sosPhone = sosPhone;
    if (sosSmsEnabled !== undefined) settings.sosSmsEnabled = sosSmsEnabled;

    await settings.save();

    // Emit socket event if io is available
    const io = req.app.get("io");
    if (io) {
      io.emit("settings:updated", settings);
    }

    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/settings/logo - Upload logo to Cloudinary
router.post("/logo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "No logo image file uploaded" });
    }

    let settings = await getOrCreateSettings();
    settings.logoUrl = req.file.path;
    await settings.save();

    // Emit socket update
    const io = req.app.get("io");
    if (io) {
      io.emit("settings:updated", settings);
    }

    res.json({
      message: "Logo uploaded successfully",
      logoUrl: settings.logoUrl,
      settings,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload logo" });
  }
});

module.exports = router;
