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
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, isAdmin } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, isAdmin },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated', user: updatedUser });
  } catch (error) {
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
