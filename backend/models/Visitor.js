const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    idNumber: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleReg: { type: String },
    department: { type: String, required: true }, // allow any string
    gate: { type: String, enum: ["Gate A-official", "Gate B-mauzo"], required: true },
    nature: { type: String, enum: ["official", "personal"], required: true },
    timeOut: { type: Date },
    duration: { type: String }, // e.g., "1h 25m"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
