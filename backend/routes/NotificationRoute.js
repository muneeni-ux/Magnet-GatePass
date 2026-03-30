const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../authToken');

// Create a new notification (Admin only ideally, but keeping it open for now based on context, or we can use authenticateToken if we want only admins)
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
    const userId = req.user.id; // From authenticateToken middleware

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Add user to readBy array if not already present
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: 'Server error while updating notification' });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error while deleting notification" });
    }
});

module.exports = router;
