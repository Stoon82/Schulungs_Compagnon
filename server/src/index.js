import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import eventBus from './eventBus.js';
import authRoutes from './routes/auth.js';
import moduleRoutes from './routes/modules.js';
import moduleCreatorRoutes from './routes/moduleCreator.js';
import sessionManagementRoutes from './routes/sessionManagement.js';
import publicSessionRoutes from './routes/publicSession.js';
import moodRoutes from './routes/mood.js';
import sandboxRoutes from './routes/sandbox.js';
import chatRoutes from './routes/chat.js';
import materialsRoutes from './routes/materials.js';
import adminRoutes from './routes/admin.js';
import gdprRoutes from './routes/gdpr.js';
import themesRoutes from './routes/themes.js';
import mediaRoutes from './routes/media.js';
import versionRoutes from './routes/version.js';
import analyticsRoutes from './routes/analytics.js';
import gamificationRoutes from './routes/gamification.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import sessionManager from './services/sessionManager.js';
import monitoring from './middleware/monitoring.js';
import backupManager from './utils/backup.js';
import debugTools from './utils/debugTools.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow localhost and all ngrok domains
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      const isNgrok = origin && (
        origin.includes('.ngrok-free.dev') ||
        origin.includes('.ngrok.io') ||
        origin.includes('.ngrok.app')
      );
      
      if (!origin || allowedOrigins.includes(origin) || isNgrok) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost and all ngrok domains
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    const isNgrok = origin && (
      origin.includes('.ngrok-free.dev') ||
      origin.includes('.ngrok.io') ||
      origin.includes('.ngrok.app')
    );
    
    if (!origin || allowedOrigins.includes(origin) || isNgrok) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/module-creator', moduleCreatorRoutes);
app.use('/api/session-management', sessionManagementRoutes);
app.use('/api/public-session', publicSessionRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/version', versionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);

// Ngrok tunnel detection endpoint (bypasses CORS)
app.get('/api/ngrok/tunnel', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ 
      error: 'Ngrok not available',
      message: error.message 
    });
  }
});

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

// Make io accessible to routes via app.get('io')
app.set('io', io);

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

eventBus.on('feedback:pause', (data) => {
  console.log('📡 Broadcasting feedback:pause to all clients:', data);
  io.emit('feedback:pause', data);
});

eventBus.on('feedback:overwhelmed', (data) => {
  console.log('📡 Broadcasting feedback:overwhelmed to all clients:', data);
  io.emit('feedback:overwhelmed', data);
});

// Store current global theme in memory for quick access
let currentGlobalTheme = null;

// Load global theme from database on startup
const loadGlobalTheme = async () => {
  try {
    const db = (await import('./services/database.js')).default;
    const theme = await db.get(
      'SELECT * FROM themes WHERE is_global = 1 ORDER BY updated_at DESC LIMIT 1'
    );
    if (theme) {
      currentGlobalTheme = JSON.parse(theme.theme_data);
      console.log('🎨 Global theme loaded from database');
    }
  } catch (error) {
    console.log('🎨 No global theme found, using defaults');
  }
};
loadGlobalTheme();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
  
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
  
  socket.on('design:update', (data) => {
    console.log(`🎨 Design update received - Scope: ${data.scope}`);
    // Broadcast design changes to all connected clients
    io.emit('design:update', data);
  });

  // Theme-related socket events
  socket.on('theme:getCurrent', () => {
    console.log(`🎨 Client ${socket.id} requested current theme`);
    socket.emit('theme:current', { 
      theme: currentGlobalTheme,
      timestamp: Date.now()
    });
  });

  socket.on('theme:update', (data) => {
    console.log(`🎨 Theme update received from ${socket.id}`);
    // Broadcast theme changes to ALL connected clients (including sender for consistency)
    io.emit('theme:update', {
      theme: data.theme,
      timestamp: data.timestamp || Date.now(),
      source: socket.id
    });
  });

  socket.on('theme:setGlobal', async (data) => {
    console.log(`🎨 Setting global theme from ${socket.id}`);
    currentGlobalTheme = data.theme;
    
    // Broadcast to all clients
    io.emit('theme:update', {
      theme: data.theme,
      timestamp: Date.now(),
      isGlobal: true,
      source: socket.id
    });
    
    // Save to database
    try {
      const db = (await import('./services/database.js')).default;
      const themeId = 'global-theme';
      const themeData = JSON.stringify(data.theme);
      const now = new Date().toISOString();
      
      const existing = await db.get('SELECT id FROM themes WHERE id = ?', [themeId]);
      if (existing) {
        await db.run(
          'UPDATE themes SET theme_data = ?, updated_at = ? WHERE id = ?',
          [themeData, now, themeId]
        );
      } else {
        await db.run(
          'INSERT INTO themes (id, name, theme_data, is_global, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [themeId, 'Global Theme', themeData, 1, now, now]
        );
      }
      console.log('🎨 Global theme saved to database');
    } catch (error) {
      console.error('🎨 Error saving global theme:', error);
    }
  });

  // Session/Module navigation events - broadcast to all clients
  socket.on('submodule:advance', (data) => {
    console.log(`📍 Submodule advance from admin - Module: ${data.moduleId}, AllowedIndex: ${data.allowedIndex}`);
    // Broadcast to ALL clients so participants can continue
    io.emit('submodule:advance', data);
  });

  socket.on('module:navigate', (data) => {
    console.log(`📍 Module navigate - Module: ${data.moduleId}, Index: ${data.submoduleIndex}`);
    // Broadcast to ALL clients
    io.emit('module:navigate', data);
  });

  socket.on('module:sync', (data) => {
    console.log(`📍 Module sync - Module: ${data.moduleId}, Index: ${data.submoduleIndex}`);
    // Broadcast to ALL clients
    io.emit('module:sync', data);
  });

  socket.on('session:navigate', (data) => {
    console.log(`📍 Session navigate - Session: ${data.sessionId}, Index: ${data.submoduleIndex}`);
    // Broadcast to ALL clients
    io.emit('session:navigate', data);
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
