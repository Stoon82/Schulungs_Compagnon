import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import eventBus from './eventBus.js';
import authRoutes from './routes/auth.js';
import moduleRoutes from './routes/modules.js';

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

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'The Compagnon API'
  });
});

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
  console.log('🚀 The Compagnon Server Started');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`⏰ Started at ${new Date().toISOString()}`);
});

export { app, io, eventBus };
