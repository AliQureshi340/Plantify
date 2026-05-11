const express = require('express');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

const router = express.Router();

// Personalized feed: posts from followed users (and own), fallback to trending if empty
router.get('/feed', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 50);
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ followerId: req.user.userId }).select('followingId');
    const followingIds = follows.map(f => f.followingId.toString());
    followingIds.push(req.user.userId); // include self

    const posts = await Post.find({ userId: { $in: followingIds }, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (posts.length > 0 || page > 1) {
      return res.json({ page, limit, items: posts });
    }

    // fallback: trending public posts
    const trending = await Post.find({ visibility: 'public', deletedAt: { $exists: false } })
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit);

    res.json({ page, limit, items: trending });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(400).json({ error: 'Failed to load feed' });
  }
});

module.exports = router;
