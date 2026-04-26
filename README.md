# Course Request Manager

A working prototype for school counselors and assistant principals to assign and edit student course requests for the upcoming school year.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

---

## Getting Started

```bash
# 1. Clone the repo
git clone <repo-url>
cd course-request-manager

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

**Testing strategy (not implemented, but planned)**
- *Unit tests*: `sequelizeDataService.js` functions using a test database or mocking Sequelize models with `sinon`/`jest.mock`.
- *Integration tests*: Supertest against the Express app with a dedicated test DB seeded before each suite.
- *Frontend*: React Testing Library for component behavior (add course modal interactions, request toggle, error states). No snapshot tests — they're brittle and don't test behavior.

**Scaling trade-offs**
For a pilot with one school (~300–500 students), this architecture is appropriate. At scale (multi-school district, concurrent counselors), the main pressure points would be: database connection pooling (Sequelize supports this), optimistic UI updates instead of full reloads after `addRequest`, and adding pagination to the student list endpoint.

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

## Written Extensions

### 1. Co-requisite Courses

Co-requisites would be modeled as a many-to-many self-referencing relationship on the `Courses` table — a `CourseCoRequisites` join table with `courseCode` and `coReqCode` columns (with a `UNIQUE` constraint on the ordered pair to avoid duplicates). This keeps the catalog data self-contained and allows a course to have multiple co-requisites.

In the UI, the most useful touchpoint is at assignment time: when a counselor selects a course that has co-requisites, the Add Course modal would surface a warning — "This course requires Biology (SCI101) to be taken in the same year. Would you like to add both?" — with a one-click option to add both simultaneously. A secondary safeguard would be a visual indicator on the student's request list when a co-requisite is present in the catalog but missing from the student's requests, similar to how a linter underlines a problem without blocking you.

Key questions I'd want to answer before building: Are co-requisites enforced (block save) or advisory (warn but allow)? Can a co-requisite relationship be directional (A requires B, but B doesn't require A)? Who can modify co-requisite relationships — is that a counselor concern or an admin/registrar concern?

### 2. Integration with an External Scheduling Platform

I'd expose a read-only REST endpoint (`GET /api/export/requests`) that returns the current state of all finalized course requests in a normalized JSON format the scheduling platform can consume. Access would be gated behind an API key (passed as a bearer token), stored as an environment variable on the server — no student-facing auth is needed since this is an internal staff tool.

The harder problem is change management after sharing. The scheduling platform needs to know when requests change post-export. I'd address this with two mechanisms: a `lastExportedAt` timestamp on each `CourseRequest` row, so the export endpoint can return a diff since the last pull; and optionally a webhook endpoint the scheduling platform can register to receive push notifications when requests are created, updated, or deleted. The webhook payload would include the student ID, course code, change type, and a timestamp. For security, payloads would be signed with an HMAC-SHA256 signature using a shared secret, so the receiving platform can verify authenticity.

Key questions: Does the scheduling platform pull or do we push? Is there a defined "freeze date" after which requests are locked and changes require an explicit override? Should deleted requests hard-delete or soft-delete (tombstone), so the scheduler knows to remove them rather than treating them as missing data?

### 3. Changing Student Population

Transfers in are straightforward to handle at the data level — the student record is created with no requests, and the counselor is responsible for filling them in. The UX challenge is surfacing these students before they get lost. I'd add a `enrolledAt` timestamp to the `Students` table and a `status` field (`active`, `transferred_out`). The student list would then support a "Needs Attention" filter that surfaces: (a) students enrolled in the last 30 days with zero requests, and (b) students whose enrollment status recently changed.

For transfers out, I'd soft-delete rather than hard-delete: set `status = 'transferred_out'` and hide them from the default view, but retain their request history. This preserves data for any downstream systems (the scheduling platform, audit logs) that may have already received their requests. A counselor could filter to see transferred students and explicitly archive or reassign their requests as needed.

Key questions: Is student data managed here or synced from an external SIS (Student Information System)? If it's a sync, we need a reconciliation job that detects new/departing students and updates status accordingly. How quickly does a counselor need to act on a new transfer — is a daily digest sufficient, or does it need to be a real-time alert?
