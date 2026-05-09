const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    passwordHash: { type: String },
    googleId: { type: String, index: true },
    avatarUrl: { type: String, default: '', maxlength: 500 },
    role: { type: String, default: 'member', enum: ['member', 'admin'] },
    bio: { type: String, default: '', maxlength: 280 },
    theme: { type: String, default: 'system', enum: ['light', 'dark', 'system'] },
    streak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    preferences: {
      focusMinutes: { type: Number, default: 25 },
      breakMinutes: { type: Number, default: 5 },
      remindersEnabled: { type: Boolean, default: true },
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
