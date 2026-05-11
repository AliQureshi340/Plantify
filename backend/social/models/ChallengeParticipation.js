const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialChallenge', index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  joinedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  completed: { type: Boolean, default: false },
  proofNotes: { type: String, trim: true },
  proofMedia: [{
    url: { type: String },
    type: { type: String, enum: ['image', 'video'], default: 'image' }
  }]
});

participationSchema.index({ challengeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SocialChallengeParticipation', participationSchema);
