const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    logoUrl: {
      type: String,
      default: "",
    },
    smsEnabled: {
      type: Boolean,
      default: true,
    },
    sosPhone: {
      type: String,
      default: "0700000000",
    },
    sosSmsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
