const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: { type: Boolean, default: true },
  failedRecoveryAttempts: { type: Number, default: 0 }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
