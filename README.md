# Smart Task & Project Management System

A full-stack MERN application for students and small dev teams to plan projects, assign tasks and track progress in one place.

## Problem statement
Small teams often juggle tasks across chats and spreadsheets, with no shared view of who owns what or what's overdue. This app gives a team a shared, access-controlled space for projects and tasks, with a dashboard for an at-a-glance status check.

## Who it's for
Students working on group projects, and small development teams who want lightweight project/task tracking without the overhead of a large PM tool.

## Features
- **Auth:** register/login/logout, JWT auth, bcrypt-hashed passwords, protected routes and middleware
- **Projects:** create, edit (name, description, deadline, status, members), delete, with computed progress
- **Tasks:** create, edit (via modal), delete, priority (low/medium/high), status (to do/in progress/completed), due date, assignee (must be a project member), search, filter by status, sort
- **Dashboard:** total/active projects, total/completed/pending/overdue tasks, status and priority distribution
- **Project detail page:** progress bar, team list, task list with inline status change, recent activity feed
- **Recent activity:** every project create/update, task create/status-change/update/delete is logged and shown per project
- **Profile:** update name, change password
- **UI:** responsive sidebar/topbar layout, cards, modals, toast notifications for every success/error action, loading/empty/error states, confirmation dialogs before destructive actions
- **Authorization:** only project members can view a project or its tasks; only the owner can edit or delete a project; assigning a task to a non-member is rejected

## Tech stack
**Frontend:** React 18, Vite, Tailwind CSS v4, React Router, Axios, Lucide icons
**Backend:** Node.js, Express, Mongoose/MongoDB, JWT, bcryptjs, helmet, CORS
**Testing:** Jest, Supertest, mongodb-memory-server (in-memory DB, no external database needed for tests)
**Tooling:** ESLint (flat config), dotenv, nodemon

## Architecture
```
React SPA  --axios-->  Express REST API  --Mongoose-->  MongoDB
 (Vite)                routes → controllers → models
                        auth middleware (JWT) + centralized error middleware
```
`User` (owns/joins projects) ← `Project` (owner + members) ← `Task` (belongs to a project, optionally assigned to a member) ← `Activity` (log entries per project, powers the recent-activity feed).

## Project structure
```
smart-project-management/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, users, projects, tasks
│   ├── middleware/         # auth (JWT), error handling
│   ├── models/             # User, Project, Task, Activity
│   ├── routes/index.js
│   ├── tests/              # jest + supertest + mongodb-memory-server
│   ├── seed.js             # demo data
│   ├── app.js / server.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/     # Layout, ui primitives, Modal, TaskModal, ProjectModal, ActivityFeed
│       ├── context/         # AuthContext, ToastContext
│       ├── pages/            # Auth, Dashboard, Projects, ProjectDetail, Profile
│       └── services/api.js
├── docs/screenshots/
├── .gitignore
├── LICENSE
└── README.md
```

## Setup (from a fresh clone)
```bash
# 1. Backend
cd backend
cp .env.example .env         # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                 # creates the demo account + sample data
npm run dev                  # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```

## Environment variables
**backend/.env** — `PORT`, `MONGO_URI` (MongoDB connection string), `JWT_SECRET` (long random string), `CLIENT_URL` (frontend origin, for CORS)
**frontend/.env** — `VITE_API_URL` (backend API base URL, e.g. `http://localhost:5000/api`)

Neither `.env` file is committed; only the `.env.example` templates are.

## Demo credentials
Created by `npm run seed` in the backend:
```
Email:    demo@example.com
Password: Demo@123
```
This is a demo account for evaluation only.

## API reference
All responses are JSON: `{ success, data | user | token, message }`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | – | name, email, password |
| POST | `/api/auth/login` | – | email, password |
| GET | `/api/auth/me` | ✅ | current user |
| GET/PUT | `/api/users/profile` | ✅ | update name/avatar, change password |
| GET/POST | `/api/projects` | ✅ | list own projects / create |
| GET/PUT/DELETE | `/api/projects/:id` | ✅ | view (members), edit/delete (owner only); GET includes `tasks` and `activity` |
| GET | `/api/tasks/stats` | ✅ | dashboard counts + distributions |
| GET/POST | `/api/tasks` | ✅ | filters: `project`, `status`, `priority`, `search`, `sort`, `assignedTo=me` |
| GET/PUT/DELETE | `/api/tasks/:id` | ✅ | project members only |

HTTP status codes used: `200` success, `201` created, `400` bad request/validation, `401` unauthenticated, `403` forbidden, `404` not found, `500` server error.

## Testing
Backend tests use Jest + Supertest against an in-memory MongoDB (`mongodb-memory-server`), so no real database is needed to run them.
```bash
cd backend
npm install
npm test
```
Coverage: registration (success/duplicate/missing fields/short password), login (success/wrong password), protected-route access with/without/invalid token, project CRUD and ownership authorization, task CRUD, assignee-must-be-member validation, cross-user access denial, and dashboard stats.

> These tests were written and syntax-checked in this environment but could not actually be executed here — the sandbox used to build this project has no network access, so `npm install` could not run. Run `npm test` after installing dependencies to confirm; expect green on a normal machine, and please report any failure.

## Screenshots
See `docs/screenshots/`. Real screenshots of the running app could not be captured in this build environment (no browser/network available); add them after running the app locally, using the filenames noted in that folder.

## Verification performed on this build
Because this project was built in a network-isolated sandbox, `npm install`, the Vite build, and the Jest suite could not actually be executed here. What was verified instead:
- Every backend `.js` file passed `node --check` (syntax validity).
- Every frontend `.jsx`/`.js` file was syntax-checked with esbuild, and the full component/page/context import graph was bundled successfully from the app entry point (catches broken imports/exports and typos across files).
- `package.json` files were validated as well-formed JSON.
- Manual review of auth/authorization logic, CRUD flows and responsive Tailwind classes.

Please run `npm install && npm run dev` (both folders) and `npm test` (backend) after cloning to get an authoritative pass/fail.

## Future improvements
Pagination for large task lists, file attachments on tasks, a proper drag-and-drop board view, email notifications for due dates, Docker Compose for one-command local setup, CI (GitHub Actions) to run tests automatically.

## Author
Shubh — B.Tech CSE, Dr. A.P.J. Abdul Kalam Technical University
