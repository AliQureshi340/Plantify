const express = require('express');
const UserStats = require('../models/UserStats');

const router = express.Router();

// Global leaderboard by total points
router.get('/leaderboards/global', async (req, res) => {
  try {
    const top = await UserStats.find({}).sort({ totalPoints: -1 }).limit(50).select('userId totalPoints city');
    res.json(top);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Weekly leaderboard
router.get('/leaderboards/weekly', async (req, res) => {
  try {
    const top = await UserStats.find({}).sort({ weeklyPoints: -1 }).limit(50).select('userId weeklyPoints city');
    res.json(top);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

// City leaderboard
router.get('/leaderboards/city/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const top = await UserStats.find({ city }).sort({ weeklyPoints: -1 }).limit(50).select('userId weeklyPoints city');
    res.json(top);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch city leaderboard' });
  }
});

module.exports = router;
