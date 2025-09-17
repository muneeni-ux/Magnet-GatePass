const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    idNumber: { type: String, required: true },
    vehicleReg: { type: String },
    company: { type: String },
    visitorType: { type: String, required: true },
    phone: { type: String, required: true },
    officer: { type: String, required: true },
    department: {
      type: String,
      enum: [
        "Logistics",
        "Human Resource",
        "Production",
        "Finance",
        "Sales and Marketing",
        "BDS",
        "Directors Office",
      ],
      required: true,
    },
    purpose: { type: String, required: true },
    timeOut: { type: Date }, // <-- Add this line
    duration: { type: String }, // e.g., "1h 25m"

  },
  { timestamps: true } // This adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Visitor", visitorSchema);
