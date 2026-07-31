const express = require("express");
const axios = require("axios");
const router = express.Router();
const Settings = require("../models/Settings");
const SmsLog = require("../models/SmsLog");

const TEXTSMS_API_KEY = process.env.TEXTSMS_API_KEY;
const PARTNER_ID = process.env.PARTNER_ID || "14661";
const SENDER_ID = process.env.SENDER_ID || "TextSMS";

// Reusable helper to send SMS with Global Toggle Check and Logging
const sendSmsHelper = async ({ phone, message, source = "general" }) => {
  try {
    if (!phone || !message) {
      return { success: false, error: "Missing phone or message" };
    }

    // Check system settings for global SMS switch
    let settings = await Settings.findOne();
    if (settings && settings.smsEnabled === false) {
      console.log(`[SMS SKIPPED] Global SMS is disabled. Recipient: ${phone}`);
      await SmsLog.create({
        recipientPhone: phone,
        message,
        status: "disabled_skipped",
        source,
        error: "SMS disabled globally by Admin in System Settings",
      });
      return { success: false, skipped: true, message: "Global SMS is turned OFF" };
    }

    // Format phone number to clean Kenyan international format if needed
    let cleanPhone = phone.toString().replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.slice(1);
    }

    const params = new URLSearchParams({
      apikey: TEXTSMS_API_KEY || "",
      partnerID: PARTNER_ID,
      shortcode: SENDER_ID,
      mobile: cleanPhone,
      message,
    });

    const response = await axios.post(
      "https://sms.textsms.co.ke/api/services/sendsms/",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Save success log
    await SmsLog.create({
      recipientPhone: phone,
      message,
      status: "delivered",
      source,
      error: "",
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("SMS Sending Failed:", errorMsg);

    await SmsLog.create({
      recipientPhone: phone,
      message,
      status: "failed",
      source,
      error: errorMsg,
    });

    return { success: false, error: errorMsg };
  }
};

// POST /api/sms/send-sms
router.post("/send-sms", async (req, res) => {
  const { phone, message, source } = req.body;
  const result = await sendSmsHelper({ phone, message, source: source || "general" });
  if (result.success) {
    return res.status(200).json(result);
  } else if (result.skipped) {
    return res.status(200).json({ success: false, skipped: true, message: result.message });
  } else {
    return res.status(500).json(result);
  }
});

// GET /api/sms/logs - Fetch SMS logs for Admin Monitoring Dashboard
router.get("/logs", async (req, res) => {
  try {
    const logs = await SmsLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.sendSmsHelper = sendSmsHelper;