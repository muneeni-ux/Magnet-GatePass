const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/AuthMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;

// 🟢 Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const isAdminFlag = role === 'admin';

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      username,
      email,
      password,
      isAdmin: isAdminFlag
    });

    await newUser.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account deactivated. Contact system administrator.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// ✏️ Update User (PUT /users/:id)
router.put('/users/:id', authenticate, async (req, res) => {
  try {
    const { username, email, isAdmin, password } = req.body;

    // 1. Authorization Check
    // Allow if user is admin OR if user is updating their own profile
    if (!req.user.isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 2. Find user first to manipulate the document directly
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Update fields
    user.email = email || user.email; // Functionality: Everyone can update email

    if (req.user.isAdmin) {
      // Only Admin can update username and role
      user.username = username || user.username;
      // Explicitly check boolean, as 'false' is falsy
      if (typeof isAdmin !== 'undefined') {
        user.isAdmin = isAdmin;
      }
    }

    // 4. Update password ONLY if provided and not empty
    if (password && password.trim() !== "") {
      user.password = password; // This triggers the pre('save') hook to hash it
    }

    // 5. Save document (Running validations)
    await user.save();

    // 6. Return updated user without password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: 'User updated', user: userObj });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// 🗑️ Delete User (DELETE /users/:id)
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// 🔄 Reset User Password (Admin Only) -> PUT /users/:id/reset-password
router.put('/users/:id/reset-password', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = 'VisiTrack@123'; // Temporary password
    await user.save(); // Hashing hook is triggered

    res.status(200).json({ message: 'Password reset to VisiTrack@123' });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// 🔒 Toggle User Status (Admin Only) -> PATCH /users/:id/toggle-status
router.patch('/users/:id/toggle-status', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user status' });
  }
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 📧 Forgot Password (Email Token Generation with Persistent Throttling)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, username } = req.body;
    
    // First, find user by username to track attempts
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'No matching record found.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ 
        message: 'Identity block active. Please report to the Chief Security Officer or the Duty Administrator to verify your identity and restore access.',
        isLocked: true 
      });
    }

    // Now validate both email and username match the exact database record
    if (user.email !== email) {
      user.failedRecoveryAttempts = (user.failedRecoveryAttempts || 0) + 1;
      
      if (user.failedRecoveryAttempts >= 3) {
        user.isActive = false;
        await user.save();
        return res.status(403).json({ 
          message: 'Security lockout triggered. Maximum identity verification attempts exceeded. Physical identification required.',
          isLocked: true
        });
      }

      await user.save();
      return res.status(404).json({ 
        message: `Identity mismatch. ${3 - user.failedRecoveryAttempts} security attempts remaining before account suspension.`, 
        attemptsRemaining: 3 - user.failedRecoveryAttempts 
      });
    }

    // Success: Match found
    user.failedRecoveryAttempts = 0; // Reset on successful match
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `VisiTrack Password Reset Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #047857;">VisiTrack Terminal</h2>
          <p>You requested a password reset for your account (${user.username}).</p>
          <p>Please click the button below to set a new password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email and contact an Administrator.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'A secure reset link was dispatched to your email.' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// 🔑 Verify & Reset Password via Token
router.put('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    user.password = password; // Pre-save hook hashes it automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been successfully updated!' });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;

// // routes/auth.js
// const express = require('express');
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const User = require('../models/User');
// const { authenticate, isAdmin } = require('../middleware/AuthMiddleware');

// const USER_SECRET = process.env.USER_JWT_SECRET || "user-secret";
// const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret";

// // Signup
// router.post('/signup', async (req, res) => {
//   try {
//     const { username, email, password, role } = req.body;
//     const isAdmin = role === 'admin';

//     const existing = await User.findOne({ $or: [{ email }, { username }] });
//     if (existing) return res.status(400).json({ message: 'User already exists' });

//     const newUser = new User({ username, email, password, isAdmin });
//     await newUser.save();

//     res.status(201).json({ message: 'Signup successful' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const secret = user.isAdmin ? ADMIN_SECRET : USER_SECRET;
//     const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         isAdmin: user.isAdmin,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Admin-only route
// router.get('/users', authenticate, isAdmin, async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching users' });
//   }
// });

// module.exports = router;
