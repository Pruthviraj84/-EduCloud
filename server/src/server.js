import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { applySecurityMiddlewares } from './middlewares/security.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import collegeRoutes from './routes/college.routes.js';
import studentRoutes from './routes/student.routes.js';
import materialRoutes from './routes/material.routes.js';
import testRoutes from './routes/test.routes.js';
import resultRoutes from './routes/result.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Models & Services for cron tasks
import { College } from './models/College.js';
import { updateCollegeLeaderboard } from './services/leaderboard.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Express Security Middlewares (Helmet, Rate Limiter, Mongo Sanitize)
applySecurityMiddlewares(app);

// CORS Policy
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Register API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/colleges', collegeRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'EduCloud AI LMS Server is healthy', timestamp: new Date() });
});

// Global Error Middleware
app.use(errorHandler);

// Scheduled Node-Cron Task: Hourly Leaderboard Recalculation across all active college tenants
cron.schedule('0 * * * *', async () => {
  console.log('[Cron Job] Running automated hourly leaderboard recalculation...');
  try {
    const colleges = await College.find({ isActive: true });
    for (const c of colleges) {
      await updateCollegeLeaderboard(c._id);
    }
  } catch (err) {
    console.error('[Cron Job Error]', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 EduCloud AI Multi-Tenant LMS Backend running on port ${PORT}`);
});
