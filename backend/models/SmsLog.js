const mongoose = require("mongoose");

const smsLogSchema = new mongoose.Schema(
  {
    recipientPhone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["delivered", "failed", "disabled_skipped"],
      default: "delivered",
    },
    source: {
      type: String,
      enum: ["visitor_checkin", "admin_notification", "sos_emergency", "general"],
      default: "general",
    },
    error: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SmsLog", smsLogSchema);
