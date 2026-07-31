const express = require("express");
const router = express.Router();
const Gate = require("../models/Gate");
const Department = require("../models/Department");
const authenticateToken = require("../authToken");

// ======================= GATES =======================

// Create a Gate
router.post("/gates", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ message: "Gate name is required" });

    const existingGate = await Gate.findOne({ name });
    if (existingGate) return res.status(400).json({ message: "Gate already exists" });

    const newGate = new Gate({ name, phone });
    await newGate.save();
    res.status(201).json({ message: "Gate created successfully", gate: newGate });
  } catch (error) {
    res.status(500).json({ message: "Error creating gate", error: error.message });
  }
});

// Get all Gates
router.get("/gates", async (req, res) => {
  try {
    const gates = await Gate.find().sort({ name: 1 });
    res.status(200).json(gates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gates", error: error.message });
  }
});

// Update a Gate
router.put("/gates/:id", async (req, res) => {
  try {
    const { name, phone } = req.body;
    const gate = await Gate.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true }
    );
    if (!gate) return res.status(404).json({ message: "Gate not found" });
    res.status(200).json({ message: "Gate updated", gate });
  } catch (error) {
    res.status(500).json({ message: "Error updating gate", error: error.message });
  }
});

// Delete a Gate
router.delete("/gates/:id", async (req, res) => {
  try {
    const gate = await Gate.findByIdAndDelete(req.params.id);
    if (!gate) return res.status(404).json({ message: "Gate not found" });
    
    // Unlink or delete associated departments
    await Department.deleteMany({
      $or: [
        { gateId: req.params.id },
        { gates: req.params.id }
      ]
    });

    res.status(200).json({ message: "Gate and associated departments unlinked" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting gate", error: error.message });
  }
});

// ======================= DEPARTMENTS =======================

// Create a Department (Supports multi-gate assignment)
router.post("/departments", async (req, res) => {
  try {
    const { name, gates, gateId, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Department name and phone are required" });
    }

    let gatesArray = Array.isArray(gates) && gates.length > 0 ? gates : (gateId ? [gateId] : []);

    const newDept = new Department({
      name,
      gates: gatesArray,
      gateId: gatesArray[0] || null,
      phone
    });

    await newDept.save();
    const populated = await Department.findById(newDept._id).populate("gates gateId", "name");
    res.status(201).json({ message: "Department created", department: populated });
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error: error.message });
  }
});

// Get all Departments (Optionally filtered by gateId)
router.get("/departments", async (req, res) => {
  try {
    const { gateId } = req.query;
    let query = {};
    if (gateId) {
      query = {
        $or: [
          { gateId: gateId },
          { gates: gateId },
          { gates: { $size: 0 } } // Available for all gates
        ]
      };
    }
    
    const departments = await Department.find(query)
      .populate("gates gateId", "name")
      .sort({ name: 1 });
      
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments", error: error.message });
  }
});

// Update a Department
router.put("/departments/:id", async (req, res) => {
  try {
    const { name, gates, gateId, phone } = req.body;
    let gatesArray = Array.isArray(gates) && gates.length > 0 ? gates : (gateId ? [gateId] : []);

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name,
        gates: gatesArray,
        gateId: gatesArray[0] || null,
        phone
      },
      { new: true }
    ).populate("gates gateId", "name");
    
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department updated", department: dept });
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error: error.message });
  }
});

// Delete a Department
router.delete("/departments/:id", async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error: error.message });
  }
});

module.exports = router;
