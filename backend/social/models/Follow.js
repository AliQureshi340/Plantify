const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('SocialFollow', followSchema);
