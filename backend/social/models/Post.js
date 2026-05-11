const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' }
}, { _id: false });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  caption: { type: String, trim: true },
  media: [mediaSchema],
  tags: [{ type: String, index: true }],
  location: {
    city: String,
    country: String
  },
  visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
  likeCount: { type: Number, default: 0, min: 0 },
  commentCount: { type: Number, default: 0, min: 0 },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1, createdAt: -1 });

module.exports = mongoose.model('SocialPost', postSchema);
