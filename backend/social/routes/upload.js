const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure storage (mirror of server.js)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

const router = express.Router();

// Upload images for social posts
router.post('/upload', auth, upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files || [];
    const urls = files.map(f => ({ url: `/uploads/${f.filename}`, type: 'image' }));
    res.status(201).json({ success: true, media: urls });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(400).json({ error: 'Upload failed' });
  }
});

module.exports = router;
