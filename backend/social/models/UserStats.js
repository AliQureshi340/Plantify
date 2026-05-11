const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  totalPoints: { type: Number, default: 0 },
  weeklyPoints: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  likesReceived: { type: Number, default: 0 },
  commentsReceived: { type: Number, default: 0 },
  challengesWon: { type: Number, default: 0 },
  city: { type: String }
}, { timestamps: true });

userStatsSchema.index({ totalPoints: -1 });
userStatsSchema.index({ weeklyPoints: -1 });
userStatsSchema.index({ city: 1, weeklyPoints: -1 });

module.exports = mongoose.model('SocialUserStats', userStatsSchema);
