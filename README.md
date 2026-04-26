# Course Request Manager

A working prototype for school counselors and assistant principals to assign and edit student course requests for the upcoming school year. Landing page is a list of students, selecting a row opens a drawer where counselors can quickly add/edit a student's courses and student info. Navigating to the Course Catalog tab in the top right allows counselors to add/edit course catalog. There's also a new student button for adding new students

<img width="1189" height="1074" alt="Screenshot 2026-04-26 at 1 13 56 PM" src="https://github.com/user-attachments/assets/40d9a8d9-bcdf-4ba9-9b6c-30522f974a2b" />

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/trevorjung/course-request-manager
cd course-request-manager

# Ensure DOCKER DESKTOP and NODE are installed (see prerequisites portion above)

# 2. First-time setup (installs deps, starts Postgres, runs migrations + seed)
npm run setup

# 3. Start both servers
npm run dev
```

Open **http://localhost:5173** in your browser.

> `npm run setup` is safe to re-run. Migrations are idempotent and the seeders use `ignoreDuplicates` to avoid creating duplicate data.

### Available Scripts (root)

| Command | Description |
|---|---|
| `npm run setup` | Full first-time setup |
| `npm run dev` | Start backend (:3001) + frontend (:5173) concurrently |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed all data |

### Backend Scripts (`cd backend`)

| Command | Description |
|---|---|
| `npm run migrate:undo` | Roll back all migrations |
| `npm run seed:undo` | Remove all seeded data |

---

## Written Extensions

https://docs.google.com/document/d/1UaA5dnS_P4HUZAUEYkvzFTz34aSPzefqwuFa11BYeTY/edit?tab=t.0

---

## Architecture

### Project Structure

```
course-request-manager/
├── docker-compose.yml        # Postgres 16 on port 5432
├── package.json              # Root scripts (setup, dev)
├── backend/
│   ├── src/
│   │   ├── config/           # Sequelize DB config (reads from .env)
│   │   ├── models/           # Sequelize models + associations
│   │   ├── migrations/       # Schema migrations
│   │   ├── seeders/          # Seed data (courses, students, requests)
│   │   ├── services/
│   │   │   ├── dataService.js        # Single import used by all routes
│   │   │   └── sequelizeDataService.js  # Sequelize implementation
│   │   ├── routes/
│   │   │   ├── students.js
│   │   │   └── courses.js
│   │   └── index.js          # Express entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── services/api.js   # All fetch calls — single swap point for real API
    │   ├── pages/
    │   │   ├── StudentList.jsx
    │   │   └── StudentDetail.jsx
    │   └── components/
    │       └── AddCourseModal.jsx
    └── vite.config.js        # Proxies /api → backend :3001
```

### Key Architectural Decisions

**Data layer abstraction via `dataService.js`**
All Express routes import from `src/services/dataService.js`, which re-exports the Sequelize implementation. To swap the data source — say, replacing Sequelize with an HTTP API client — you create a new module that exports the same six functions (`getStudents`, `getStudent`, `getCourses`, `addRequest`, `updateRequest`, `deleteRequest`) and update the single import in `dataService.js`. No route files need to change.

**Sequelize with explicit migrations**
Rather than using `sync({ force: true })`, the schema is managed with migration files. This mirrors production practice and makes the schema history auditable. The seed data arrives as Sequelize seeders, reflecting the assumption in the brief that it will eventually come from an API.

**Database-level uniqueness constraint**
A `UNIQUE(studentId, courseCode)` constraint on `CourseRequests` prevents a student from being assigned the same course twice, regardless of application logic. The API surfaces this as a `409 Conflict` response.

**Frontend API service layer**
`frontend/src/services/api.js` contains every `fetch` call in one place. Swapping to a real API (different base URL, auth headers, etc.) is a single-file change. Vite's dev proxy handles the `/api` path so the frontend never hardcodes `localhost:3001`.

---

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/students` | List all students with request count |
| GET | `/api/students/:id` | Student detail with full request + course data |
| GET | `/api/courses` | Full course catalog |
| POST | `/api/students/:id/requests` | Add a course request |
| PATCH | `/api/students/:id/requests/:reqId` | Update request type or note |
| DELETE | `/api/students/:id/requests/:reqId` | Remove a request |

---

