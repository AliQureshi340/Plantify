const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialPost', index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SocialLike', likeSchema);
