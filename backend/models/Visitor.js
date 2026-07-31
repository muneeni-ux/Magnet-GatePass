const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    idNumber: { type: String, required: false }, // Made optional for underage visitors
    isUnderage: { type: Boolean, default: false },
    phone: { type: String, required: true },
    vehicleReg: { type: String },
    department: { type: String, required: true }, // allow any string
    gate: { type: String, required: true },
    nature: { type: String, enum: ["official", "personal", "staff"], required: true },
    countryCode: { type: String, default: "+254" },
    hostStaff: { type: String },
    isGroup: { type: Boolean, default: false },
    groupSize: { type: Number, default: 1 },
    isDisabled: { type: Boolean, default: false },
    timeOut: { type: Date },
    duration: { type: String }, // e.g., "1h 25m"
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isAcknowledged: { type: Boolean, default: false },
    acknowledgmentToken: { type: String },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
