const express = require('express');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

const router = express.Router();

// Follow a user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.userId) return res.status(400).json({ error: 'Cannot follow yourself' });
    await Follow.create({ followerId: req.user.userId, followingId: targetId });
    res.json({ success: true });
  } catch (err) {
    if (err && err.code === 11000) return res.status(200).json({ success: true });
    res.status(400).json({ error: 'Failed to follow' });
  }
});

// Unfollow
router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    await Follow.deleteOne({ followerId: req.user.userId, followingId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to unfollow' });
  }
});

// Followers list
router.get('/users/:userId/followers', async (req, res) => {
  try {
    const followers = await Follow.find({ followingId: req.params.userId }).limit(200);
    res.json(followers);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch followers' });
  }
});

// Following list
router.get('/users/:userId/following', async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.params.userId }).limit(200);
    res.json(following);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch following' });
  }
});

module.exports = router;
