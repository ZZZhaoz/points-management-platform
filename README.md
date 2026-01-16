# Loyalty Rewards Web Application (points-management-platform)

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://inspiring-expression-production.up.railway.app/)
[![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/ZZZhaoz/points-management-platform)

---

## Demo Accounts

To explore the application without registration, you may use the following pre-seeded accounts:

| Role     | Username        | Password  |
|----------|-----------------|-----------|
| User     | demo_user       | Demo123! |
| Cashier  | demo_cashier    | Demo123! |
| Manager  | demo_manager    | Demo123! |


## Overview

This application models a real-world loyalty program where users can earn, transfer, and redeem points. It supports multiple user roles with complex permission logic and enforces strict business rules at the API level.

The project emphasizes:
- **Clean Architecture:** High separation of concerns between business logic and infrastructure.
- **Maintainable Backend:** Service-oriented logic for complex transactions.
- **Scalable Data Modeling:** Relational schema designed for auditing and consistency.
- **Full-Stack Engineering:** Practical implementation of end-to-end security and UX.

---

## Tech Stack

### Frontend
- **React 18** (Functional components, Hooks)
- **React Router** (Client-side routing)
- **CSS Modules** (Scoped styling)
- **REST API Integration** (Standardized fetch/error handling)

### Backend
- **Node.js & Express.js** (Server framework)
- **Prisma ORM** (Type-safe database access)
- **SQLite** (Development database - PostgreSQL ready)
- **JWT** (Stateless authentication)
- **RBAC** (Role-based access control middleware)

---

## System Architecture
```text
       [ React Client ]
              │
              ▼
      [ HTTP (REST API) ]
              │
              ▼
      [ Express Server ]
      (Auth & Middleware)
              │
              ▼
      [ Service Layer ]
     (Business Logic/RBAC)
              │
              ▼
      [ Prisma ORM ]
              │
              ▼
    [ Relational Database ]
```

**Key Design Principles:**
- **Stateless Authentication:** Secure communication via JSON Web Tokens.
- **Server-Enforced Authorization:** Every endpoint validates user role permissions.
- **Transactional Integrity:** Complex operations (like P2P transfers) handled within DB transactions.
- **Predictable API Contracts:** Standardized JSON response structures.

---

## Core Features

### Authentication & Authorization
- Secure login with JWT.
- **Role-Based Permissions:** Granular control for regular user, cashier, manager, event organizer, and superuser.

### Transactions Engine
- **Automatic Calculation:** Purchase-to-point conversion logic.
- **Redemption Workflow:** Customer-initiated requests with required Cashier approval.
- **Peer-to-Peer (P2P):** Secure point transfers between users.
- **Auditing:** Adjustment transactions for manual corrections and logging.

### Events & Promotions
- **Event Management:** RSVP systems with capacity and time constraints.
- **Rewards Distribution:** Organizer-controlled point distribution for participation.
- **Promotions:** Handling of automatic validation, one-time use cases, and expiration.

### UX & Data Handling
- **QR Code System:** Real-time generation and processing for user identification/redemption.
- **Advanced Filtering:** Server-side pagination and filtering for transaction logs.
- **Responsive Navigation:** Smooth URL-driven UI flow via React Router.

---

## Project Structure
```
.
├── backend/                # Express API & Server logic
│   ├── prisma/             # Schema definition & seed scripts
│   ├── routes/             # API endpoint definitions
│   ├── services/           # Business logic & transaction handling
│   └── index.js            # Server entry point
├── frontend/               # React client
│   ├── src/                # Components, hooks, and pages
│   └── package.json        # Frontend dependencies
└── README.md
```

---

## Local Setup

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
JWT_SECRET=your_secret_here
DATABASE_URL="file:./dev.db"
```

Initialize the database and seed demo data:
```bash
npx prisma migrate dev
node prisma/seed.js
```

Start the server:
```bash
node index.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## Deployment

- **Infrastructure:** Frontend and backend are architected for cloud deployment (e.g., Vercel, Render, or AWS).
- **Environment:** Production-ready configuration for PostgreSQL and Docker with minimal changes.

