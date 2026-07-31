const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gate",
      },
    ],
    gateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gate",
      required: false,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
