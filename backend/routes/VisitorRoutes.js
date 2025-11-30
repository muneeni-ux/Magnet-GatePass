const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

// CREATE - POST /api/visitors
// router.post("/", async (req, res) => {
//   try {
//     const visitor = new Visitor(req.body);
//     const savedVisitor = await visitor.save();
//     res.status(201).json(savedVisitor);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
// CREATE - POST /api/visitors
router.post("/", async (req, res) => {
  try {
    const visitor = new Visitor(req.body); // formData already includes gate & nature
    const savedVisitor = await visitor.save();
    res.status(201).json(savedVisitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE - PUT /api/visitors/:id
router.put("/:id", async (req, res) => {
  try {
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedVisitor)
      return res.status(404).json({ error: "Visitor not found" });
    res.json(updatedVisitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL - GET /api/visitors
router.get("/", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });

    const visitorsWithDuration = visitors.map((visitor) => {
      const visitorObj = visitor.toObject(); // Convert Mongoose doc to plain object

      if (!visitorObj.duration && visitorObj.timeOut) {
        const start = new Date(visitorObj.createdAt);
        const end = new Date(visitorObj.timeOut);
        const ms = end - start;
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        visitorObj.duration = `${hours}h ${minutes}m`;
      }

      return visitorObj;
    });

    res.json(visitorsWithDuration);
  } catch (err) {
    console.error("Error fetching visitors:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// READ ONE - GET /api/visitors/:id
router.get("/:id", async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ error: "Visitor not found" });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - PUT /api/visitors/:id
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedVisitor = await Visitor.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedVisitor)
//       return res.status(404).json({ error: "Visitor not found" });
//     res.json(updatedVisitor);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


router.put("/visitors/:id/timeout", async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    const timeOut = new Date();
    const durationInMs = timeOut - visitor.createdAt;
    const totalMinutes = Math.floor(durationInMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = `${hours}h ${minutes}m`;

    visitor.timeOut = timeOut;
    visitor.duration = duration;
    await visitor.save();

    res.json(visitor);
  } catch (err) {
    console.error("Time out error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE - DELETE /api/visitors/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedVisitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!deletedVisitor)
      return res.status(404).json({ error: "Visitor not found" });
    res.json({ message: "Visitor deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
