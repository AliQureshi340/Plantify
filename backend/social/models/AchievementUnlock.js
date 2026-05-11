const mongoose = require('mongoose');

const unlockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  key: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  unlockedAt: { type: Date, default: Date.now }
});

unlockSchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('SocialAchievementUnlock', unlockSchema);
