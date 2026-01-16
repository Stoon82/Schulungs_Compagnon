import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import eventBus from './eventBus.js';
import authRoutes from './routes/auth.js';
import moduleRoutes from './routes/modules.js';
import moodRoutes from './routes/mood.js';
import sandboxRoutes from './routes/sandbox.js';
import chatRoutes from './routes/chat.js';
import materialsRoutes from './routes/materials.js';
import adminRoutes from './routes/admin.js';
import gdprRoutes from './routes/gdpr.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import sessionManager from './services/sessionManager.js';
import monitoring from './middleware/monitoring.js';
import backupManager from './utils/backup.js';
import debugTools from './utils/debugTools.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'The Compagnon API'
  });
});

app.get('/api/admin/monitoring/stats', (req, res) => {
  const stats = monitoring.getStats();
  res.json({ success: true, data: stats });
});

app.use(monitoring.errorHandler());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to The Compagnon API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      api: '/api/*',
      admin: '/admin/*'
    }
  });
});

eventBus.on('admin:broadcast', (data) => {
  io.emit('admin:broadcast', data);
});

eventBus.on('admin:kick', (data) => {
  io.emit('admin:kick', data);
});

eventBus.on('admin:system_pause', (data) => {
  io.emit('admin:system_pause', data);
});

eventBus.on('admin:system_resume', (data) => {
  io.emit('admin:system_resume', data);
});

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
  
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

httpServer.listen(PORT, () => {
  debugTools.success(`Server running on port ${PORT}`);
  
  // Schedule auto-backup every 24 hours
  if (process.env.AUTO_BACKUP === 'true') {
    backupManager.scheduleAutoBackup(24);
  }
  
  // Log stats every hour
  if (process.env.STATS_LOGGING === 'true') {
    monitoring.scheduleStatsLogging(60);
  }
  
  debugTools.info('The Compagnon API is ready! 🚀');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`⏰ Started at ${new Date().toISOString()}`);
});

export { app, io, eventBus };
