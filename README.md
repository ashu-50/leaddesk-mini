# LeadDesk Mini — Modern Lead Management CRM

A lightweight CRM for capturing, managing, and tracking customer enquiries.

LeadDesk Mini provides a simple workflow for businesses that don't need a complex sales pipeline. Visitors submit enquiries through a public website, and administrators manage those leads from a secure dashboard with authentication, search, filtering, and analytics.

**Live Demo:** https://leaddesk-mini-frontend.vercel.app/

---

## Features

### Public Website

- Responsive landing page
- Server-side rendered marketing page
- Lead capture form
- Client and server-side validation
- Budget selection using predefined INR ranges
- Secure API integration

### Admin Dashboard

- JWT-based authentication
- Dashboard overview
- Lead management
- Search leads
- Filter by status
- Sorting
- Pagination
- Status updates
- Optimistic UI updates
- Secure logout

### Backend

- RESTful API
- Prisma ORM
- PostgreSQL
- JWT authentication
- Role-based authorization
- Rate limiting
- Structured logging
- Request correlation IDs
- Swagger documentation
- Global error handling
- Health monitoring

---

# Tech Stack

## Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Backend

- NestJS 11
- Prisma 6
- PostgreSQL
- Passport JWT

## Deployment

- Vercel
- Railway / Render
- Neon PostgreSQL

---

# Architecture

```
                Public Website
                       │
                       ▼
              Lead Capture Form
                       │
                       ▼
               NestJS REST API
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
 Authentication              Lead Service
          │                         │
          └────────────┬────────────┘
                       ▼
                    Prisma ORM
                       │
                       ▼
                  PostgreSQL
                       │
                       ▼
               Admin Dashboard
```

---

# Workflow

```
Visitor

   │

   ▼

Submit Lead

   │

   ▼

Stored in Database

   │

   ▼

Admin Login

   │

   ▼

Dashboard

   │

   ▼

Update Status

NEW

↓

CONTACTED

↓

CLOSED
```

Leads can move forward through the workflow and may also move back one step to correct accidental updates.

---

# Lead Lifecycle

```
NEW
 │
 ▼
CONTACTED
 │
 ▼
CLOSED
```

Business rules:

- A lead cannot skip states.
- Re-applying the current status is treated as a no-op.
- Only SUPER_ADMIN users can permanently delete leads.

---

# Budget Categories

Instead of storing arbitrary text values, LeadDesk stores one of five predefined budget ranges.

| Database Value | Display |
|----------------|---------|
| UNDER_50K | Under ₹50,000 |
| FROM_50K_TO_2L | ₹50,000 – ₹2,00,000 |
| FROM_2L_TO_5L | ₹2,00,000 – ₹5,00,000 |
| FROM_5L_TO_10L | ₹5,00,000 – ₹10,00,000 |
| ABOVE_10L | ₹10,00,000+ |

The database stores only enum values, allowing the UI to change labels without affecting stored data.

---

# Authentication

LeadDesk uses JWT authentication with secure HTTP-only cookies.

```
Admin Login

↓

JWT Generated

↓

Stored in HTTP-only Cookie

↓

Authenticated Requests

↓

Authorization Guards

↓

Protected Resources
```

Two roles are supported.

| Role | Permissions |
|------|-------------|
| ADMIN | Manage leads |
| SUPER_ADMIN | Manage leads + delete records |

---

# API

All endpoints return a consistent response envelope.

### Success

```json
{
  "success": true,
  "message": "Lead created",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [],
  "path": "/leads"
}
```

---

## REST Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current session |
| POST | `/auth/logout` | Logout |
| POST | `/leads` | Create lead |
| GET | `/leads` | List leads |
| GET | `/leads/:id` | Lead details |
| PATCH | `/leads/:id/status` | Update status |
| DELETE | `/leads/:id` | Delete lead |
| GET | `/dashboard` | Dashboard metrics |
| GET | `/health` | Health check |

Interactive API documentation is available at:

```
/docs
```

---

# Security

The backend includes several production-ready security features.

- JWT authentication
- Role-based authorization
- Password hashing with bcrypt
- HTTP-only cookies
- Rate limiting
- Helmet
- CORS configuration
- Request validation
- Structured error responses
- Correlation IDs

---

# Engineering Decisions

### Server Components First

The public website uses Server Components wherever possible to minimize JavaScript sent to the browser.

Only interactive components such as the enquiry form require client-side rendering.

---

### Enum-Based Budgets

Budget ranges are stored as enums rather than free text.

Benefits:

- Easier filtering
- Consistent analytics
- Safer validation
- Localization without database changes

---

### Optimistic UI

Status changes update immediately in the interface.

If the backend rejects the request, the UI automatically rolls back.

---

### Standard Response Envelope

Every API response follows the same structure.

Benefits:

- Predictable frontend handling
- Simpler error management
- Consistent logging

---

### Request Correlation

Each request receives a unique correlation ID that appears in logs and error responses, making production debugging significantly easier.

---

# Running Locally

## Backend

```bash
cd backend

cp .env.example .env

npm install

npx prisma migrate deploy

npm run db:seed

npm run start:dev
```

Swagger

```
http://localhost:4000/docs
```

---

## Frontend

```bash
cd frontend

cp .env.example .env.local

npm install

npm run dev
```

Open

```
http://localhost:3000
```

---

# Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@leaddesk.dev | Admin@12345 |
| SUPER_ADMIN | owner@leaddesk.dev | Owner@12345 |

---

# Testing

Backend

```bash
npm test

npm run test:e2e
```

Frontend

```bash
npm run typecheck

npm run lint

npm run build
```

Current test status:

- 29 Unit Tests
- 34 End-to-End Tests
- TypeScript checks passing
- ESLint passing
- Production build passing

---

# Project Structure

```
frontend/
    app/
    components/
    lib/
    hooks/
    types/

backend/
    src/
        modules/
        auth/
        leads/
        dashboard/
        common/
        prisma/

docs/
    ARCHITECTURE.md
```

---

# Deployment

| Component | Platform |
|------------|----------|
| Frontend | Vercel |
| Backend | Railway / Render |
| Database | Neon PostgreSQL |

Environment variables:

Backend

```
DATABASE_URL
JWT_SECRET
CORS_ORIGINS
```

Frontend

```
API_BASE_URL
NEXT_PUBLIC_SITE_URL
```

---

# Known Limitations

- Single organization only
- No email notifications
- No file attachments
- No lead assignment
- No activity timeline
- No audit history for lead edits
- No bulk actions

---

# Future Improvements

- Email notifications
- Lead assignment
- Notes & comments
- File uploads
- Activity timeline
- Audit logs
- CSV export
- Advanced dashboard analytics
- Multi-tenant support
- Email integrations

---

# License

MIT License
