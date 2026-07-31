const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    staffId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, default: "Staff Member" },
    gate: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
