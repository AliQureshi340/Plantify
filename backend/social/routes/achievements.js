const express = require('express');
const auth = require('../middleware/auth');
const AchievementUnlock = require('../models/AchievementUnlock');
const service = require('../services/achievementService');

const router = express.Router();

// List achievement definitions
router.get('/achievements', (req, res) => {
  res.json(service.getDefinitions());
});

// List my unlocked achievements
router.get('/me/achievements', auth, async (req, res) => {
  try {
    const list = await AchievementUnlock.find({ userId: req.user.userId }).sort({ unlockedAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: 'Failed to load achievements' });
  }
});

// Manually trigger stats-based checks (optional)
router.post('/achievements/check', auth, async (req, res) => {
  try {
    await service.checkOnStats(req.user.userId);
    const list = await AchievementUnlock.find({ userId: req.user.userId }).sort({ unlockedAt: -1 });
    res.json({ success: true, achievements: list });
  } catch (e) {
    res.status(400).json({ error: 'Failed to check achievements' });
  }
});

module.exports = router;
