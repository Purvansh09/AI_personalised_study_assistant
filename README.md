# AI-Powered Personalized Study Assistant

A production-ready study assistant chatbot with voice input, AI chat, and adaptive learning style personalization.

![StudyAI](https://img.shields.io/badge/StudyAI-v1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)

## ✨ Features

- **🎤 Voice Input** - Speak your questions using Web Speech API
- **🎓 Learning Style Adaptation** - VARK-based personalization (Visual, Auditory, Kinesthetic, Reading/Writing)
- **💬 AI-Powered Chat** - OpenAI GPT-4 integration with context-aware responses
- **📊 Progress Tracking** - Visualize your learning journey with charts
- **📝 Flashcard Generation** - Auto-generate flashcards from topics
- **🌓 Dark/Light Mode** - Beautiful UI with theme support

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Query (server state)
- Zustand (client state)
- Framer Motion (animations)
- Recharts (visualizations)

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- OpenAI API

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (optional - mock mode available)

### 1. Clone and Install

```bash
# Navigate to project
cd study-assistant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (create `backend/.env`):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/study_assistant
JWT_SECRET=your-secret-key-change-this
OPENAI_API_KEY=sk-your-openai-key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend** (create `frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser (Chrome recommended for voice).

## 📁 Project Structure

```
study-assistant/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── server.ts          # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── VoiceInput.tsx
│   │   │   ├── LearningStyleQuiz.tsx
│   │   │   └── ProgressDashboard.tsx
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user

### Chat
- `GET /api/chat/sessions` - List chat sessions
- `POST /api/chat/sessions` - Create new session
- `POST /api/chat/message` - Send message
- `GET /api/chat/sessions/:id/messages` - Get session messages

### User
- `GET /api/user/quiz` - Get quiz questions
- `POST /api/user/quiz` - Submit quiz answers
- `GET /api/user/profile` - Get learning profile
- `GET /api/user/progress` - Get study progress

## 🎯 Learning Styles

The app adapts content based on VARK learning styles:

| Style | Adaptation |
|-------|------------|
| 👁️ Visual | Diagrams, charts, color-coded explanations |
| 🎧 Auditory | Conversational tone, analogies, mnemonics |
| 🤸 Kinesthetic | Hands-on activities, step-by-step exercises |
| 📚 Reading/Writing | Detailed text, lists, note formats |

## 🎤 Voice Input

Voice input uses the Web Speech API:
- **Chrome** - Full support ✅
- **Edge** - Full support ✅
- **Firefox** - Limited support ⚠️
- **Safari** - Limited support ⚠️

## 🔧 Development

```bash
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📝 License

MIT License - feel free to use this project for learning!

---

Built with ❤️ for students everywhere
