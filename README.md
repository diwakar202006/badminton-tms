# 🏸 ShuttleCourt — Badminton Tournament Management System (MVP)

A full-stack, real-time badminton tournament manager: six courts, live scoring,
and instant updates everywhere via Socket.IO. No login required to watch.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · MongoDB Atlas (Mongoose) · JWT · Socket.IO

---

## 1. What's included

| Area | Details |
|---|---|
| **Viewer (public, no login)** | Home, Live Courts, Fixtures, Results — all update instantly over Socket.IO |
| **Central Scorer** | Create singles/doubles matches, assign a match to any of the 6 courts, queue a "next match" on a busy court, monitor all courts on one dashboard |
| **Court Scorer** | Locked to their own assigned court only. Set player positions on a tappable 2×2 court layout, pick the first server, start, +1 Team A / +1 Team B, undo, pause/resume, finish |
| **Realtime** | Every score/status change is broadcast over Socket.IO to all connected clients — dashboard and viewer pages never need a refresh |

---

## 2. Folder structure

```
badminton-tms/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, Match, Court (Mongoose schemas)
│   ├── middleware/auth.js        JWT auth, role guard, court-ownership guard
│   ├── controllers/               auth / court / match business logic
│   ├── routes/                    Express routers
│   ├── socket/socketHandler.js    Socket.IO connection + initial snapshot
│   ├── utils/seed.js              Creates the 6 courts + 1 admin account
│   ├── server.js                  App entrypoint
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js            Axios instance w/ JWT interceptor
    │   ├── context/                AuthContext, SocketContext
    │   ├── components/             Navbar, ProtectedRoute, CourtCard,
    │   │                           ScoreBoard, StatusBadge, CourtLayout2x2,
    │   │                           MatchForm, AssignMatchRow
    │   ├── pages/                  Home, Login, ViewerLive, Fixtures,
    │   │                           Results, CentralDashboard, CourtScorerPage
    │   ├── App.jsx / main.jsx / index.css
    ├── tailwind.config.js
    ├── vercel.json                 SPA rewrite rule for Vercel
    └── .env.example
```

---

## 3. Data model summary

- **User**: `name`, `email`, hashed `password`, `role` (`central_scorer` | `court_scorer`), `assignedCourt` (1–6, court scorers only)
- **Court**: `number` (1–6), `currentMatch`, `nextMatch`, `status` (`idle` | `occupied`)
- **Match**: `type` (`singles` | `doubles`), `teamA`/`teamB` player names, `court`, `status`
  (`scheduled` → `assigned` → `live` ⇄ `paused` → `finished`), `positions` (`A1/A2/B1/B2` slots
  for the 2×2 layout), `firstServer`, `score`, `history` (for undo), `winner`

---

## 4. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine) — grab your connection string

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: paste your MONGO_URI, set a real JWT_SECRET, etc.
npm run seed     # creates courts 1-6 + one central_scorer admin account
npm run dev      # starts the API + Socket.IO server on http://localhost:5000
```

The seed script prints the admin login (default `admin@tournament.com` /
`ChangeMe123!` unless you changed `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

**Create Court Scorer accounts** once the backend is running, using the admin
token from `/api/auth/login`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Court 1 Scorer","email":"court1@tournament.com","password":"Court1Pass!","role":"court_scorer","assignedCourt":1}'
```

Repeat for courts 2–6 with different emails/`assignedCourt` values.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# defaults already point at http://localhost:5000 — adjust if needed
npm run dev      # starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173`. Viewer pages work immediately with no login.
Log in as the central scorer admin to create and assign matches, or as a
court scorer to run a specific court.

---

## 5. Key API endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | public | Get a JWT |
| POST | `/api/auth/register` | public* | Create a scorer account |
| GET | `/api/courts` | public | All 6 courts w/ current + next match |
| GET | `/api/matches?status=` | public | Fixtures / results / live lists |
| POST | `/api/matches` | central_scorer | Create a match (optionally assign a court) |
| PATCH | `/api/matches/:id/assign` | central_scorer | Assign match to a court (`slot: current|next`) |
| PATCH | `/api/matches/:id/positions` | own court scorer | Set the 2×2 position layout |
| PATCH | `/api/matches/:id/server` | own court scorer | Set first server |
| PATCH | `/api/matches/:id/start` | own court scorer | Start the match |
| PATCH | `/api/matches/:id/score` | own court scorer | `{ team: 'A'|'B' }` +1 point |
| PATCH | `/api/matches/:id/undo` | own court scorer | Undo last point |
| PATCH | `/api/matches/:id/pause` \| `/resume` | own court scorer | Pause / resume |
| PATCH | `/api/matches/:id/finish` | own court scorer | Finish, record winner, free the court, auto-promote the queued next match |

\* In production, gate `/register` behind the central scorer role so random
people can't self-register — it's left open here for MVP setup convenience.

Every mutating match/court endpoint re-broadcasts a fresh `courts:update`
Socket.IO event to all connected clients, so the frontend never has to poll.

---

## 6. Deployment

Socket.IO needs a **long-running server process** (persistent WebSocket
connections), which Vercel's serverless functions don't support well. The
recommended split:

### Backend → Render / Railway / Fly.io (any Node host that runs a persistent process)
1. Push this repo to GitHub.
2. Create a new Web Service pointing at `backend/`.
3. Build command: `npm install` · Start command: `npm start`.
4. Set environment variables from `backend/.env.example` (`MONGO_URI`,
   `JWT_SECRET`, `CLIENT_ORIGIN` = your deployed frontend URL, etc.).
5. After first deploy, run `npm run seed` once (Render/Railway both support a
   one-off "Shell"/"Run command" against the deployed service).

### Frontend → Vercel
1. Import the repo in Vercel, set **Root Directory** to `frontend/`.
2. Framework preset: Vite. Build command `npm run build`, output `dist`.
3. Environment variables: `VITE_API_URL=https://<your-backend>/api`,
   `VITE_SOCKET_URL=https://<your-backend>`.
4. `vercel.json` already includes the SPA rewrite so client-side routes
   (`/court/3`, `/central`, etc.) don't 404 on refresh.

### CORS / Socket.IO origin
Update `CLIENT_ORIGIN` in the backend `.env` to your Vercel URL (comma-separate
multiple origins if you keep a staging + prod frontend) — this value is used
for both the Express CORS middleware and the Socket.IO CORS config.

---

## 7. MVP scope notes / natural next steps

- Scoring is a single game to whatever point the scorers agree on manually
  (no built-in "win by 2, cap at 30" enforcement or best-of-3 sets yet) —
  straightforward to layer on top of the existing `score`/`history` fields.
- `/api/auth/register` is open; wrap it in `authorize('central_scorer')` once
  you have a real admin logged in, and drop the bootstrap seed step.
- Court positions currently reset only when you explicitly re-tap them —
  consider auto-clearing `positions`/`firstServer` when a new match is
  assigned to a court, if you want a stricter reset-per-match flow.
