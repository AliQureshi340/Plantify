const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialPost', index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  text: { type: String, required: true, trim: true },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model('SocialComment', commentSchema);
