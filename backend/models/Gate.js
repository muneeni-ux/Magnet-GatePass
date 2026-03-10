const mongoose = require("mongoose");

const gateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String, // Phone for the gate itself if applicable
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gate", gateSchema);
