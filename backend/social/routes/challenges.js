const express = require('express');
const auth = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const Participation = require('../models/ChallengeParticipation');
const UserStats = require('../models/UserStats');

const router = express.Router();

// List active challenges
router.get('/challenges/active', async (req, res) => {
  try {
    const now = new Date();
    const list = await Challenge.find({ startAt: { $lte: now }, endAt: { $gte: now } })
      .sort({ startAt: 1 })
      .limit(50);
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: 'Failed to load challenges' });
  }
});

// Scheduled (future) challenges
router.get('/challenges/scheduled', async (req, res) => {
  try {
    const now = new Date();
    const list = await Challenge.find({ startAt: { $gt: now } })
      .sort({ startAt: 1 })
      .limit(50);
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: 'Failed to load scheduled challenges' });
  }
});

// Past challenges
router.get('/challenges/past', async (req, res) => {
  try {
    const now = new Date();
    const list = await Challenge.find({ endAt: { $lt: now } })
      .sort({ endAt: -1 })
      .limit(50);
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: 'Failed to load past challenges' });
  }
});

// Create a challenge (admin-only suggested; here check via role)
router.post('/challenges', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { title, description, startAt, endAt, type = 'solo', tags = [] } = req.body;
    const c = await Challenge.create({ title, description, startAt, endAt, type, tags, createdBy: req.user.userId, status: 'scheduled' });
    res.status(201).json({ success: true, challenge: c });
  } catch (e) {
    res.status(400).json({ error: 'Failed to create challenge' });
  }
});

// Join a challenge
router.post('/challenges/:id/join', auth, async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id);
    if (!ch) return res.status(404).json({ error: 'Challenge not found' });
    const now = new Date();
    if (now < ch.startAt || now > ch.endAt) return res.status(400).json({ error: 'Challenge not active' });
    await Participation.create({ challengeId: ch._id, userId: req.user.userId });
    res.json({ success: true });
  } catch (e) {
    if (e && e.code === 11000) return res.json({ success: true });
    res.status(400).json({ error: 'Failed to join challenge' });
  }
});

// List my participations
router.get('/me/challenges', auth, async (req, res) => {
  try {
    const my = await Participation.find({ userId: req.user.userId }).sort({ joinedAt: -1 });
    res.json(my);
  } catch (e) {
    res.status(400).json({ error: 'Failed to load participations' });
  }
});

// Complete a challenge (user marks as completed) -> awards points
router.post('/challenges/:id/complete', auth, async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id);
    if (!ch) return res.status(404).json({ error: 'Challenge not found' });

    const part = await Participation.findOne({ challengeId: ch._id, userId: req.user.userId });
    if (!part) return res.status(400).json({ error: 'Join the challenge first' });
    if (part.completed) return res.json({ success: true, alreadyCompleted: true });

    // For MVP, allow completion if within timeframe
    const now = new Date();
    if (now < ch.startAt || now > ch.endAt) return res.status(400).json({ error: 'Challenge not active' });

    // Proof (optional but recommended): accept notes and media
    const { proofNotes, proofMedia = [] } = req.body || {};
    if ((!proofNotes || proofNotes.trim().length === 0) && (!Array.isArray(proofMedia) || proofMedia.length === 0)) {
      return res.status(400).json({ error: 'Provide proof notes or at least one photo' });
    }

    part.proofNotes = proofNotes;
    if (Array.isArray(proofMedia)) part.proofMedia = proofMedia.slice(0, 5);
    part.completed = true;
    part.completedAt = new Date();
    await part.save();

    // Award points (configurable; MVP: 20 points)
    await UserStats.updateOne(
      { userId: req.user.userId },
      { $inc: { totalPoints: 20, weeklyPoints: 20, challengesWon: 1 } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Failed to complete challenge' });
  }
});

module.exports = router;
