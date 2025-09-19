const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  type: { type: String, default: "faq" },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

faqSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('FAQ', faqSchema);
