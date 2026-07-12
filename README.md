# PulseChat — Interview-Ready Real-Time Chat

Production-grade WhatsApp-style chat with **MongoDB**, **JWT auth**, **Socket.io**, private & group conversations, and live notifications.

## Level 1 Features (Interview Ready)

| Feature | Status |
|---------|--------|
| Real-time messaging (Socket.io) | ✅ |
| JWT Authentication | ✅ |
| User registration / login | ✅ |
| MongoDB message storage | ✅ |
| Previous chat history | ✅ |
| Timestamps | ✅ |
| Responsive UI | ✅ |
| Online / Offline status | ✅ |
| Typing indicator | ✅ |
| Read receipts | ✅ |
| Delivered status | ✅ |
| Auto-scroll to latest message | ✅ |
| Loading skeletons | ✅ |
| Error handling | ✅ |
| Input validation | ✅ |
| Private chats (1-to-1) | ✅ |
| Group chats | ✅ |
| In-app + browser notifications | ✅ |

## Quick Start

### 1. MongoDB

**Option A — Docker (recommended)**
```bash
docker compose up -d
```

**Option B — MongoDB Atlas**
Set `MONGODB_URI` in `backend/.env` to your Atlas connection string.

**Option C — Dev fallback**
If local MongoDB isn't running, the backend auto-starts an in-memory MongoDB (data resets on restart).

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## How to Use

1. **Register** two accounts (use incognito for the second)
2. Click **+** (New Chat) to start a **private chat**
3. Click **👥** to create a **group chat** with multiple members
4. Messages show **sent → delivered → read** checkmarks
5. **Notifications** appear when you receive messages in other conversations
6. Allow browser notifications for desktop alerts

## Tech Stack

- **Frontend:** React, Vite, Socket.io Client
- **Backend:** Node.js, Express, Socket.io, Mongoose
- **Database:** MongoDB
- **Auth:** JWT + bcrypt

## Environment Variables

```env
# backend/.env
PORT=3001
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/pulsechat
JWT_SECRET=your-secret-here
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/rooms` | List conversations |
| POST | `/api/rooms/dm/:userId` | Start private chat |
| POST | `/api/rooms/group` | Create group chat |
| GET | `/api/messages/:roomId` | Chat history |

## License

MIT
