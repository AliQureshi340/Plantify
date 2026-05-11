const UserStats = require('../models/UserStats');
const AchievementUnlock = require('../models/AchievementUnlock');

// Simple built-in definitions for MVP
const defs = [
  { key: 'first_post', name: 'First Post', description: 'Created your first community post', icon: '🌱' },
  { key: 'popular_post_10_likes', name: 'Getting Popular', description: 'A post reached 10 likes', icon: '🔥' },
  { key: 'weekly_100_points', name: 'Weekly Warrior', description: 'Earned 100 points this week', icon: '🏆' },
  { key: 'total_500_points', name: 'Rising Star', description: 'Accumulated 500 total points', icon: '⭐' }
];

function getDefinitions() { return defs; }

async function unlock(userId, key) {
  const def = defs.find(d => d.key === key);
  if (!def) return null;
  try {
    const u = await AchievementUnlock.findOneAndUpdate(
      { userId, key },
      { $setOnInsert: { name: def.name, description: def.description, icon: def.icon, unlockedAt: new Date() } },
      { upsert: true, new: true }
    );
    return u;
  } catch (e) {
    return null;
  }
}

async function checkOnPostCreated(userId) {
  // first_post
  return unlock(userId, 'first_post');
}

async function checkOnLikeReceived(postOwnerId, postDoc) {
  if (postDoc.likeCount >= 10) {
    await unlock(postOwnerId, 'popular_post_10_likes');
  }
}

async function checkOnStats(userId) {
  const stats = await UserStats.findOne({ userId });
  if (!stats) return;
  if (stats.weeklyPoints >= 100) await unlock(userId, 'weekly_100_points');
  if (stats.totalPoints >= 500) await unlock(userId, 'total_500_points');
}

module.exports = {
  getDefinitions,
  unlock,
  checkOnPostCreated,
  checkOnLikeReceived,
  checkOnStats
};
