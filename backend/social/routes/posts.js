const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const UserStats = require('../models/UserStats');
const auth = require('../middleware/auth');

const router = express.Router();
const achievementService = require('../services/achievementService');

// Helpers
async function ensureUserStats(userId) {
  let stats = await UserStats.findOne({ userId });
  if (!stats) stats = await UserStats.create({ userId });
  return stats;
}

// Create post
router.post('/posts', auth, async (req, res) => {
  try {
    const { caption, media = [], tags = [], location, visibility = 'public' } = req.body;
    const post = await Post.create({
      userId: req.user.userId,
      caption,
      media,
      tags,
      location,
      visibility
    });

    await UserStats.updateOne(
      { userId: req.user.userId },
      { $inc: { postsCount: 1, totalPoints: 5, weeklyPoints: 5 } },
      { upsert: true }
    );

    // Achievements: first post, stats-based
    await achievementService.checkOnPostCreated(req.user.userId);
    await achievementService.checkOnStats(req.user.userId);

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(400).json({ error: 'Failed to create post' });
  }
});

// Get post by id
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Delete post (soft)
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    post.deletedAt = new Date();
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete' });
  }
});

// Update post (owner only)
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { caption, tags, visibility } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    if (typeof caption === 'string') post.caption = caption;
    if (Array.isArray(tags)) post.tags = tags;
    if (visibility && ['public', 'followers'].includes(visibility)) post.visibility = visibility;

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(400).json({ error: 'Failed to update post' });
  }
});

// Comments list
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const post = await Post.findById(req.params.id);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({
      postId: post._id,
      userId: req.user.userId,
      text
    });

    await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
    if (post.userId.toString() !== req.user.userId) {
      await UserStats.updateOne(
        { userId: post.userId },
        { $inc: { commentsReceived: 1, totalPoints: 1, weeklyPoints: 1 } },
        { upsert: true }
      );
    }

    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add comment' });
  }
});

// Delete comment (owner)
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const c = await Comment.findById(req.params.commentId);
    if (!c || c.deletedAt) return res.status(404).json({ error: 'Comment not found' });
    if (c.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    c.deletedAt = new Date();
    await c.save();
    await Post.updateOne({ _id: c.postId }, { $inc: { commentCount: -1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete comment' });
  }
});

// Like
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });

    await Like.create({ postId: post._id, userId: req.user.userId });
    await Post.updateOne({ _id: post._id }, { $inc: { likeCount: 1 } });
    const updated = await Post.findById(post._id).select('userId likeCount');

    if (post.userId.toString() !== req.user.userId) {
      await UserStats.updateOne(
        { userId: post.userId },
        { $inc: { likesReceived: 1, totalPoints: 1, weeklyPoints: 1 } },
        { upsert: true }
      );
      await achievementService.checkOnLikeReceived(post.userId, updated);
      await achievementService.checkOnStats(post.userId);
    }

    res.json({ success: true });
  } catch (err) {
    if (err && err.code === 11000) return res.status(200).json({ success: true }); // already liked
    res.status(400).json({ error: 'Failed to like' });
  }
});

// Unlike
router.delete('/posts/:id/like', auth, async (req, res) => {
  try {
    const del = await Like.deleteOne({ postId: req.params.id, userId: req.user.userId });
    if (del.deletedCount > 0) {
      await Post.updateOne({ _id: req.params.id }, { $inc: { likeCount: -1 } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to unlike' });
  }
});

// Trending
router.get('/posts/trending', async (req, res) => {
  try {
    const { tag } = req.query;
    const filter = { deletedAt: { $exists: false } };
    if (tag) filter.tags = tag;
    const posts = await Post.find(filter).sort({ likeCount: -1, createdAt: -1 }).limit(50);
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch trending' });
  }
});

// User profile posts
router.get('/users/:userId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = router;
