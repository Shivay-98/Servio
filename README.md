# Servio — Service Provider Onboarding Platform

A modern, full-stack platform for service providers to register, build profiles, upload verification documents, and submit applications for admin approval. Built with React 19, Node.js, Express, and MongoDB.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Redux Toolkit, React Query, React Hook Form, Zod, Chart.js

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT Auth, Cloudinary, Multer, Nodemailer, Zod

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP credentials (optional for emails)

### 1. Clone & Install

```bash
git clone <repo-url> servio
cd servio

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

### 3. Seed Database

```bash
cd server
node -e "require('./utils/seed.js')()"
```

Seeds 12 service categories and an admin user:
- **Email:** admin@servio.com
- **Password:** Admin@123

### 4. Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

App runs at `http://localhost:5173` with API proxy to `http://localhost:5000`.

## Docker

```bash
docker compose up --build
```

## Project Structure

```
servio/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI + layout + common components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API service layer
│   │   ├── redux/             # State management
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # Theme context
│   │   ├── constants/         # App constants
│   │   └── utils/             # Helper functions
│   └── ...
├── server/                    # Express backend
│   ├── config/                # DB, Cloudinary, env config
│   ├── controllers/           # Route handlers
│   ├── middlewares/           # Auth, validation, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── validators/            # Zod schemas
│   └── utils/                 # Helpers, seed, email
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register provider |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| GET | `/api/v1/provider/profile` | Get provider profile |
| PUT | `/api/v1/provider/profile` | Update profile |
| POST | `/api/v1/provider/photo` | Upload profile photo |
| POST | `/api/v1/provider/submit` | Submit application |
| POST | `/api/v1/documents` | Upload document |
| GET | `/api/v1/documents` | List documents |
| DELETE | `/api/v1/documents/:id` | Delete document |
| GET | `/api/v1/admin/dashboard` | Admin dashboard stats |
| GET | `/api/v1/admin/providers` | List all providers |
| GET | `/api/v1/admin/providers/:id` | Get provider detail |
| PUT | `/api/v1/admin/providers/:id/review` | Approve/reject |
| PUT | `/api/v1/admin/providers/:id/suspend` | Suspend/unsuspend |
| DELETE | `/api/v1/admin/providers/:id` | Delete provider |
| GET | `/api/v1/admin/analytics` | Analytics data |
| GET | `/api/v1/categories` | List categories |

## Features

- Role-based authentication (provider, admin, superadmin)
- Document upload with Cloudinary storage
- Profile completion tracking with weighted scoring
- Application status workflow (draft → pending → review → approved/rejected)
- Admin dashboard with Chart.js analytics
- Dark mode support
- Responsive design
- Rate limiting, input sanitization, secure cookies
- Audit logging

## License

MIT
