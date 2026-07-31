const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../authToken');

// Create a new notification & emit WebSockets real-time event
router.post('/', async (req, res) => {
  try {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const newNotification = new Notification({
      title,
      message,
    });

    await newNotification.save();

    // Real-Time Socket.io emission
    const io = req.app.get("io");
    if (io) {
      io.emit("notification:new", newNotification);
    }

    res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: 'Server error while creating notification' });
  }
});

// Get notifications (supports ?activeOnly=true)
router.get('/', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === 'true' ? { isActive: true } : {};
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// Toggle active status
router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isActive = !notification.isActive;
    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("notification:updated", notification);
    }

    res.status(200).json({ message: 'Notification toggled status', notification });
  } catch (error) {
    console.error("Error toggling notification:", error);
    res.status(500).json({ message: 'Server error while toggling notification' });
  }
});

// Mark a notification as read for a specific user
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id; // Extract user ID from token payload

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user has already read it
    const hasRead = notification.readBy.some(
      (entry) => entry.userId.toString() === userId
    );

    if (!hasRead) {
      notification.readBy.push({ userId, readAt: new Date() });
      await notification.save();
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: 'Server error while marking notification as read' });
  }
});

// Delete a notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("notification:deleted", req.params.id);
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
});

module.exports = router;
