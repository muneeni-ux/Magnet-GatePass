const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');

// GET all faq with a limit (e.g., GET /api/faq?limit=3)
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    const faq = await FAQ.find()
      .sort({ date: -1 })
      .limit(limit ? parseInt(limit) : 0);  // Apply limit if provided
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST a new FAQ
router.post('/', async (req, res) => {
  try {
    const { question, answer, isVerified } = req.body;
    const newFAQ = new FAQ({ question, answer, isVerified });
    const saved = await newFAQ.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Update a FAQ by ID
router.put('/:id', async (req, res) => {
  try {
    const { question, answer, isVerified } = req.body;
    const updated = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, isVerified },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a FAQ by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FAQ.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
