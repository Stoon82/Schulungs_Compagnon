# The Compagnon

**Immersives KI-Schulungssystem für das Ambulant Betreute Wohnen (ABW)**

Version 2.0 | Status: In Development

---

## 🎯 Project Overview

"The Compagnon" is a local, story-driven training system that introduces social care workers to the possibilities of Local-First AI and No-Code development. The system demonstrates modern web technologies in a protected environment and transforms technical training content into an interactive hero's journey.

**Core Promise:** "Experience AI not as an abstract concept, but as a magical companion that learns with you."

---

## 🏗️ Architecture

### Technology Stack

- **Backend:** Node.js + Express + Socket.io
- **Frontend:** React + Tailwind CSS + Vite
- **Database:** SQLite (ACID-compliant)
- **Local AI:** Ollama (gemma2:4b model)
- **Real-time:** WebSocket communication
- **Deployment:** Local server + ngrok tunneling

### Project Structure

```
Compagnon/
├── server/                 # Backend server
│   └── src/
│       ├── routes/         # API endpoints
│       ├── middleware/     # Express middleware
│       ├── models/         # Database models
│       └── services/       # Business logic
├── client/                 # Frontend React app
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       └── utils/          # Utility functions
├── database/               # SQLite database & migrations
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── public/                 # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Ollama installed locally
- ngrok (optional, for external access)

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies:
   ```bash
   npm run setup
   ```
4. Initialize database:
   ```bash
   npm run db:init
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start both server and client in development mode
- `npm run server:dev` - Start only the backend server
- `npm run client:dev` - Start only the frontend client
- `npm run build` - Build client for production
- `npm start` - Start production server
- `npm run tunnel` - Start ngrok tunnel
- `npm run full-demo` - Start everything (server + client + tunnel)
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Seed database with sample data

---

## 📚 Features

### For Participants (Client App)

- **Dynamic Module System** - Story-driven learning journey
- **Live Mood Tracking** - Real-time feedback system
- **Sandbox Playground** - Safe code experimentation
- **Local AI Chat** - Interact with Ollama-powered assistant
- **App Gallery** - Share and vote on created apps
- **Material Hub** - Access resources and documentation
- **PWA Support** - Install on mobile devices

### For Trainers (Admin Dashboard)

- **Control Center** - Orchestrate the training flow
- **Live Analytics** - Monitor participant engagement
- **Module Management** - Unlock content dynamically
- **Emergency Controls** - Pause, reset, or intervene
- **Code Management** - Generate secret codes for Easter eggs
- **Sandbox Oversight** - Manage participant-created apps

---

## 🔒 Security

- **Sandbox Isolation** - User code runs in isolated iframes
- **Content Security Policy** - Strict CSP headers
- **Input Sanitization** - DOMPurify for code sanitization
- **Rate Limiting** - Protect against abuse
- **GDPR Compliance** - Privacy-first data handling
- **Local-First** - No external data transmission

---

## 📖 The Hero's Journey

The training follows a dramatic structure:

1. **Prolog: "Der Ruf"** - Introduction to AI concepts
2. **Module 1: "Schwelle überschreiten"** - Local vs Cloud AI
3. **Module 2: "Verbündete finden"** - Prompt engineering
4. **Module 3: "Die Prüfung"** - Building your first app
5. **Module 4: "Rückkehr mit dem Elixier"** - Integration into daily work
6. **Epilog: Material Hub** - Ongoing resources

---

## 🎯 Success Metrics (KPIs)

- **Stability:** 0 system crashes with 20+ concurrent connections
- **Latency:** <200ms for mood updates
- **Engagement:** 15+ interactions per participant
- **Output:** 3+ functional mini-apps per session

---

## 🛠️ Development

### Database Schema

See `database/schema.sql` for the complete database structure including:
- Participants and sessions
- Module progress tracking
- Mood analytics
- Sandbox apps and voting
- Secret codes system

### API Endpoints

**Public Endpoints:**
- `POST /api/join` - Create participant session
- `GET /api/modules` - Get available modules
- `POST /api/sandbox/create` - Upload code
- `POST /api/chat` - Interact with Ollama
- `POST /api/codes/redeem` - Redeem secret code

**Admin Endpoints:**
- `POST /admin/login` - Admin authentication
- `POST /admin/unlock` - Unlock module
- `GET /admin/analytics` - Get live statistics
- `POST /admin/codes/generate` - Generate secret code

### Socket Events

**Client → Server:**
- `mood:update` - Send mood feedback
- `chat:message` - Send chat message
- `ping` - Heartbeat

**Server → Client:**
- `module:unlock` - Module unlocked
- `gallery:new` - New app in gallery
- `gallery:vote` - Vote update
- `admin:message` - Admin broadcast

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Team

Compagnon Team - Building the future of AI training

---

## 📞 Support

For questions or issues, please refer to the documentation in the `docs/` folder or contact the project lead.
