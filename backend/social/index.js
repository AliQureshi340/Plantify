const express = require('express');

const posts = require('./routes/posts');
const follows = require('./routes/follows');
const feed = require('./routes/feed');
const leaderboards = require('./routes/leaderboards');
const achievements = require('./routes/achievements');
const challenges = require('./routes/challenges');
const upload = require('./routes/upload');

const router = express.Router();

router.use(posts);
router.use(follows);
router.use(feed);
router.use(leaderboards);
router.use(achievements);
router.use(challenges);
router.use(upload);

module.exports = router;
