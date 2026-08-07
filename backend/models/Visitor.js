const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isUnderage: { type: Boolean, default: false },
    idNumber: { type: String, default: "N/A" },
    phone: { type: String, required: true },
    vehicleReg: { type: String },
    department: { type: String, required: true }, // allow any string
    gate: { type: String, enum: ["Gate A", "Gate B-mauzo"], required: true },
    nature: { type: String, enum: ["official", "personal"], required: true },
    timeOut: { type: Date },
    duration: { type: String }, // e.g., "1h 25m"
    checkedInBy: { type: String, required: true },
    checkedOutBy: { type: String },
    groupSize: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
