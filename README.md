# 📚 Learning Management System (LMS)

A full-stack, production-ready Learning Management System built with **Next.js** and **Express.js**. Features include secure JWT authentication, structured course content delivery, YouTube-based video playback, sequential video locking, progress tracking with resume capability, and a sleek dark-themed UI.

---

## 🧱 Tech Stack

| Layer        | Technology                                                                 |
|--------------|---------------------------------------------------------------------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, react-youtube  |
| **Backend**  | Node.js, Express 5, TypeScript, PostgreSQL (Supabase), JWT, bcrypt        |
| **Database** | PostgreSQL (hosted on Supabase)                                           |
| **Auth**     | JWT access + refresh tokens, httpOnly cookies                             |

---

## 📁 Project Structure

```
Learning-management-system/
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── config/             # Database pool configuration
│   │   ├── middleware/         # Auth middleware (requireAuth, optionalAuth)
│   │   ├── modules/
│   │   │   ├── auth/           # Signup, login, logout, token refresh
│   │   │   ├── users/          # User profile (GET /me)
│   │   │   ├── subjects/       # Subject listing
│   │   │   ├── sections/       # Subject content with sections & videos
│   │   │   ├── videos/         # Video details with navigation & locking
│   │   │   └── progress/       # Video progress save/resume
│   │   ├── routes/             # Centralized route registration
│   │   ├── types/              # Express type augmentation
│   │   └── utils/              # JWT signing/verification, hashing
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/      # Login page
│   │   │   │   └── register/   # Registration page
│   │   │   ├── subjects/
│   │   │   │   ├── [slug]/     # Course detail + curriculum
│   │   │   │   │   └── video/
│   │   │   │   │       └── [id]/ # Video player page
│   │   │   │   └── page.tsx    # Subject listing
│   │   │   ├── layout.tsx      # Root layout with providers
│   │   │   └── page.tsx        # Landing / home page
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # API client, types
│   │   └── store/              # Zustand stores (auth, video)
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                   # ← You are here
```

---

## ✨ Features

### 🔐 Authentication
- Secure signup & login with bcrypt password hashing
- Short-lived **access tokens** (15 min) stored in memory
- Long-lived **refresh tokens** (7 days) stored in httpOnly cookies
- Automatic silent token refresh on app load and 401 responses
- Route protection via `AuthGuard` component

### 📖 Course Management
- Browse all available courses on `/subjects`
- View course details with full curriculum on `/subjects/[slug]`
- Sections → Videos hierarchy with ordered content

### 🎬 Video Player
- YouTube-based video playback via `react-youtube`
- Auto-resume from last saved position
- Progress saved every **5 seconds** with smart debouncing (only sends if position changed > 3s)
- Final progress saved on pause, video end, or page unmount
- Completed badge and auto-advance to next video after 1.5s

### 🔒 Sequential Video Locking
- Videos are locked until the previous video is completed
- First video in a course is always unlocked
- Locking spans **across sections** within the same subject
- Sidebar shows 🔒 lock icons for locked videos with disabled navigation
- Direct URL access to locked videos shows a "Video Locked" placeholder instead of the player
- Backend enforces locking logic — not just a frontend restriction

### 📊 Progress Tracking
- Per-video progress: position, completion status, timestamps
- Per-course progress: visual percentage bar on the subject detail page
- Smart "Start / Resume / Review" button that finds the exact next uncompleted video
- Cross-section navigation with `previous_video_id` and `next_video_id`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** database (e.g., [Supabase](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Learning-management-system.git
cd Learning-management-system
```

### 2. Setup the Database

Create the following tables in your PostgreSQL database:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  last_position_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 4. Configure the Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint              | Auth     | Description                      |
|--------|-----------------------|----------|----------------------------------|
| POST   | `/api/auth/signup`    | Public   | Register a new user              |
| POST   | `/api/auth/login`     | Public   | Login and receive tokens         |
| POST   | `/api/auth/logout`    | Public   | Revoke refresh token, clear cookie |
| POST   | `/api/auth/refresh`   | Cookie   | Get a new access token           |

### Users

| Method | Endpoint           | Auth     | Description            |
|--------|--------------------|----------|------------------------|
| GET    | `/api/users/me`    | Required | Get current user profile |

### Subjects

| Method | Endpoint                          | Auth     | Description                              |
|--------|-----------------------------------|----------|------------------------------------------|
| GET    | `/api/subjects`                   | Optional | List all subjects                        |
| GET    | `/api/subjects/:slug`             | Optional | Get subject by slug                      |
| GET    | `/api/subjects/:slug/content`     | Optional | Get full curriculum with lock/completion status |

### Videos

| Method | Endpoint             | Auth     | Description                                      |
|--------|----------------------|----------|--------------------------------------------------|
| GET    | `/api/videos/:id`    | Optional | Get video details with navigation and lock status |

### Progress

| Method | Endpoint                  | Auth     | Description                |
|--------|---------------------------|----------|----------------------------|
| GET    | `/api/progress/:videoId`  | Required | Get progress for a video   |
| POST   | `/api/progress`           | Required | Save/update video progress |

**POST `/api/progress` body:**

```json
{
  "video_id": "uuid-string",
  "last_position_seconds": 120,
  "is_completed": false
}
```

---

## 🏗️ Architecture

### Backend (Controller → Service → Repository)

```
Request → Middleware (auth) → Controller → Service (business logic) → Repository (SQL) → PostgreSQL
```

- **Middleware**: `requireAuth` for protected routes, `optionalAuth` for personalized but publicly accessible routes
- **Controllers**: Handle HTTP request/response, validate input
- **Services**: Business logic, locking calculations, progress aggregation
- **Repositories**: Raw SQL queries using `pg` Pool

### Frontend (Next.js App Router)

```
Page Component → API Layer (lib/api.ts) → Backend REST API
                → Zustand Store (auth, video state)
                → UI Components (Sidebar, VideoPlayer, etc.)
```

- **API Layer**: Centralized HTTP client with automatic 401 → refresh → retry logic
- **Auth Store**: Persisted user data + in-memory access token
- **Video Store**: Current video, playback state, progress tracking

---

## 🎨 UI / UX Highlights

- **Dark theme** with glassmorphism-inspired design
- **Responsive layout** with collapsible sidebar on mobile
- **Animated progress indicators** and pulse effects for active videos
- **Lock/unlock visual states** with tooltips
- **Smooth transitions** between videos with auto-advance

---

## 🧪 Scripts

### Backend

| Script          | Command           | Description                        |
|-----------------|-------------------|------------------------------------|
| Development     | `npm run dev`     | Start with ts-node-dev (hot reload)|
| Build           | `npm run build`   | Compile TypeScript to `dist/`      |
| Production      | `npm start`       | Run compiled JS from `dist/`       |

### Frontend

| Script          | Command           | Description                        |
|-----------------|-------------------|------------------------------------|
| Development     | `npm run dev`     | Start Next.js dev server           |
| Build           | `npm run build`   | Create production build            |
| Production      | `npm start`       | Serve production build             |
| Lint            | `npm run lint`    | Run ESLint                         |

---

## 🌐 Deployment

### Backend (e.g., Render)

1. Set the **build command** to `npm install && npm run build`
2. Set the **start command** to `npm start`
3. Add all `.env` variables as environment variables
4. Set `CORS_ORIGIN` to your frontend URL
5. Set `COOKIE_DOMAIN` to your domain

### Frontend (e.g., Vercel)

1. Connect your GitHub repository
2. Set the **root directory** to `frontend`
3. Add `NEXT_PUBLIC_API_URL` as an environment variable pointing to your backend URL

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
