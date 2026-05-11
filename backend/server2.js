// server-sponsorship.js - Separate Sponsorship Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();


const app = express();
const PORT = process.env.SPONSORSHIP_PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MongoDB Connection (same database as main server)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plantify-backend', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((error) => {
  console.error('❌ Initial MongoDB connection failed (sponsorship server):', error.message);
  console.error('⚠️ Sponsorship server will keep running, but DB-dependent routes may fail until MongoDB is available.');
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Sponsorship Server Connected to MongoDB');
});

// ==================== SCHEMAS ====================

// User Schema (reference only - already exists in main DB)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isActive: Boolean
});
const User = mongoose.model('User', userSchema);

// Notification Schema (reference only)
const notificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  message: String,
  type: String,
  link: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// Sponsorship Drive Schema
const sponsorshipDriveSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  goal: { type: Number, required: true, min: 0 },
  raised: { type: Number, default: 0, min: 0 },
  participants: { type: Number, default: 0, min: 0 },
  date: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  approved: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participantsList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sponsors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SponsorshipDrive = mongoose.model('SponsorshipDrive', sponsorshipDriveSchema);

// ==================== MIDDLEWARE ====================

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid user or account deactivated' });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!Array.isArray(roles)) roles = [roles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role 
      });
    }
    next();
  };
};

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Corporate Sponsorship API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get all approved drives (Public)
app.get('/api/sponsorship/drives/approved', async (req, res) => {
  try {
    const drives = await SponsorshipDrive.find({ approved: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(drives);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch drives' });
  }
});

// Get pending drives (Admin)
app.get('/api/sponsorship/drives/pending', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const drives = await SponsorshipDrive.find({ approved: false })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(drives);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch pending drives' });
  }
});

// Create drive (Admin)
app.post('/api/sponsorship/drives/create', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { title, description, goal, date } = req.body;
    
    if (!title || !description || !goal || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const drive = new SponsorshipDrive({
      title: title.trim(),
      description: description.trim(),
      goal: Number(goal),
      date,
      approved: true,
      createdBy: req.user.userId
    });

    await drive.save();

    try {
      const users = await User.find({ role: 'user', isActive: true }).select('_id');
      if (users.length > 0) {
        const notifs = users.map(u => ({
          userId: u._id,
          title: 'New Sponsorship Drive',
          message: `${drive.title} - Goal: Rs ${drive.goal}. Support now!`,
          type: 'drive',
          link: '/sponsorship'
        }));
        await Notification.insertMany(notifs);
      }
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    console.log(`✅ Drive created: ${drive.title}`);
    
    res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      drive
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create drive' });
  }
});

// Propose drive (User)
app.post('/api/sponsorship/drives/propose', authenticateToken, async (req, res) => {
  try {
    const { title, description, goal, date } = req.body;
    
    if (!title || !description || !goal || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const drive = new SponsorshipDrive({
      title: title.trim(),
      description: description.trim(),
      goal: Number(goal),
      date,
      approved: false,
      status: 'pending',
      createdBy: req.user.userId
    });

    await drive.save();

    try {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      if (admins.length > 0) {
        const notifs = admins.map(a => ({
          userId: a._id,
          title: 'New Drive Proposal',
          message: `${req.user.name} proposed: "${drive.title}"`,
          type: 'drive',
          link: '/admin/sponsorship'
        }));
        await Notification.insertMany(notifs);
      }
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    console.log(`✅ Drive proposed: ${drive.title}`);
    
    res.status(201).json({
      success: true,
      message: 'Drive proposal submitted',
      drive
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to propose drive' });
  }
});

// Approve/Reject drive (Admin)
app.patch('/api/sponsorship/drives/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { approved } = req.body;
    const drive = await SponsorshipDrive.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    if (approved) {
      drive.approved = true;
      drive.status = 'active';
      drive.updatedAt = new Date();
      await drive.save();

      try {
        if (drive.createdBy) {
          await Notification.create({
            userId: drive.createdBy._id,
            title: 'Drive Approved',
            message: `Your drive "${drive.title}" has been approved!`,
            type: 'drive',
            link: '/user/my-sponsorships'
          });
        }
      } catch (e) {
        console.error('Notification error:', e.message);
      }

      res.json({
        success: true,
        message: 'Drive approved',
        drive
      });
    } else {
      await SponsorshipDrive.findByIdAndDelete(req.params.id);

      try {
        if (drive.createdBy) {
          await Notification.create({
            userId: drive.createdBy._id,
            title: 'Drive Rejected',
            message: `Your drive "${drive.title}" was not approved.`,
            type: 'drive'
          });
        }
      } catch (e) {
        console.error('Notification error:', e.message);
      }

      res.json({
        success: true,
        message: 'Drive rejected'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Failed to process drive' });
  }
});

// Join drive (User)
app.post('/api/sponsorship/drives/:id/join', authenticateToken, async (req, res) => {
  try {
    const drive = await SponsorshipDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    if (!drive.approved) {
      return res.status(400).json({ error: 'Drive not approved' });
    }
    
    if (drive.participantsList.includes(req.user.userId)) {
      return res.status(400).json({ error: 'Already joined' });
    }
    
    drive.participantsList.push(req.user.userId);
    drive.participants += 1;
    drive.updatedAt = new Date();
    await drive.save();

    console.log(`✅ User joined: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Successfully joined',
      drive
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Failed to join' });
  }
});

// Sponsor drive (User)
app.post('/api/sponsorship/drives/:id/sponsor', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const drive = await SponsorshipDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    if (!drive.approved) {
      return res.status(400).json({ error: 'Drive not approved' });
    }
    
    const user = await User.findById(req.user.userId);
    
    drive.sponsors.push({ 
      userId: req.user.userId,
      name: user.name,
      email: user.email,
      amount: Number(amount)
    });
    drive.raised += Number(amount);
    drive.updatedAt = new Date();
    await drive.save();

    try {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      if (admins.length > 0) {
        const notifs = admins.map(a => ({
          userId: a._id,
          title: 'New Sponsorship',
          message: `${user.name} sponsored Rs ${amount} to "${drive.title}"`,
          type: 'drive',
          link: '/admin/sponsorship'
        }));
        await Notification.insertMany(notifs);
      }
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    console.log(`✅ Sponsored Rs ${amount}: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Thank you for sponsoring!',
      drive
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Failed to sponsor' });
  }
});

// Get my joined drives
app.get('/api/sponsorship/drives/my-joined', authenticateToken, async (req, res) => {
  try {
    const drives = await SponsorshipDrive.find({ 
      participantsList: req.user.userId 
    }).sort({ createdAt: -1 });
    
    res.json(drives);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Get my sponsored drives
app.get('/api/sponsorship/drives/my-sponsored', authenticateToken, async (req, res) => {
  try {
    const drives = await SponsorshipDrive.find({ 
      'sponsors.userId': req.user.userId 
    }).sort({ createdAt: -1 });
    
    res.json(drives);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Delete drive (Admin)
app.delete('/api/sponsorship/drives/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const drive = await SponsorshipDrive.findByIdAndDelete(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    console.log(`✅ Drive deleted: ${drive.title}`);
    
    res.json({
      success: true,
      message: 'Drive deleted'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Failed to delete' });
  }
});

// Get statistics (Admin)
app.get('/api/sponsorship/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalDrives = await SponsorshipDrive.countDocuments({ approved: true });
    const pendingDrives = await SponsorshipDrive.countDocuments({ approved: false });
    
    const revenueData = await SponsorshipDrive.aggregate([
      { $match: { approved: true } },
      { $group: { _id: null, totalRaised: { $sum: '$raised' }, totalGoal: { $sum: '$goal' } } }
    ]);

    const totalParticipants = await SponsorshipDrive.aggregate([
      { $match: { approved: true } },
      { $group: { _id: null, total: { $sum: '$participants' } } }
    ]);

    const totalSponsors = await SponsorshipDrive.aggregate([
      { $match: { approved: true } },
      { $unwind: '$sponsors' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    const topDrives = await SponsorshipDrive.find({ approved: true })
      .sort({ raised: -1 })
      .limit(5)
      .select('title raised goal participants');

    res.json({
      stats: {
        totalDrives,
        pendingDrives,
        totalRaised: revenueData[0]?.totalRaised || 0,
        totalGoal: revenueData[0]?.totalGoal || 0,
        totalParticipants: totalParticipants[0]?.total || 0,
        totalSponsors: totalSponsors[0]?.total || 0
      },
      topDrives
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with automatic port fallback
const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
  console.log('🚀 =================================');
  console.log('💰 Corporate Sponsorship API');
  console.log(`📍 Port: ${portToTry}`);
  console.log(`🔗 Health: http://localhost:${portToTry}/health`);
  console.log('🚀 =================================');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = Number(portToTry) + 1;
      console.warn(`⚠️ Port ${portToTry} is already in use. Retrying on ${nextPort}...`);
      setTimeout(() => startServer(nextPort), 300);
      return;
    }
    console.error('❌ Failed to start sponsorship server:', error);
    process.exit(1);
  });
};

startServer(Number(PORT));

// USAGE:
// 1. Run both servers: node server.js & node server-sponsorship.js
// 2. Main API: http://localhost:5001
// 3. Sponsorship API: http://localhost:5002