const mongoose = require("mongoose");

const occurrenceSchema = new mongoose.Schema({
  gate: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // premise: String,
  // disarmedBy: String,
  // disarmTime: String,
  // phonesLeftWith: String,
  // armedBy: String,
  // armTime: String,
  unusualOccurrence: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  unusualDescription: String,
  remarks: String,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Occurrence", occurrenceSchema);

// parkingOpeningTime: String,
// parkingClosingTime: String,