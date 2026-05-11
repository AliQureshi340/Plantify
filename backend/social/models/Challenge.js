const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  type: { type: String, enum: ['solo', 'team'], default: 'solo' },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

challengeSchema.index({ startAt: 1 });
challengeSchema.index({ endAt: 1 });
challengeSchema.index({ status: 1 });

module.exports = mongoose.model('SocialChallenge', challengeSchema);
