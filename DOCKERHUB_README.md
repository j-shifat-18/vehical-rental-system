# 📦 Docker Hub Repository Guide & Descriptions

This document contains everything you need to paste into Docker Hub when creating or updating your repository (`shifat18/vehicle-rental-system-app`).

---

## 1. Short Description (One-Liner)
> Copy and paste this into the **"Short Description"** field (under 100 characters):

```text
Production ready Vehicle Rental System REST API built with Node.js, TypeScript, and PostgreSQL.
```

---

## 2. Full Description / Overview (README)
> Copy and paste everything below this line into the **"Overview"** (Markdown editor) on Docker Hub:

# 🚗 Vehicle Rental System API

[![Node Version](https://img.shields.io/badge/Node.js-20--alpine-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

A robust, production-ready backend API for managing vehicle rentals. Built with TypeScript, Express, and raw PostgreSQL queries via `pg`. It features role-based access control, dynamic booking duration & pricing calculations, and automatic database schema initialization.

---

## 🚀 Quick Start (Running the Image)

### Step 1: Pull the image
```bash
docker pull shifat18/vehicle-rental-system-app:latest
```

### Step 2: Run with your database
Pass your PostgreSQL connection string (such as from [Neon](https://neon.tech), Supabase, AWS RDS, or a local Postgres instance):

```bash
docker run -d \
  --name vehicle_rental_app \
  -p 3001:3001 \
  -e CONNECTION_STRING="postgresql://username:password@host:port/database?sslmode=require" \
  -e JWT_SECRET="your-super-secure-jwt-secret" \
  shifat18/vehicle-rental-system-app:latest
```

### Step 3: Test the API
```bash
curl http://localhost:3001/api/v1
# Response: "Vehicle rental system running"
```

---

## ⚙️ Environment Variables

| Variable | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `CONNECTION_STRING` | **YES** | *None* | Full PostgreSQL connection URI. Works with cloud databases (Neon, Supabase) or local instances. |
| `PORT` | No | `3001` | The HTTP port the containerized server listens on. |
| `JWT_SECRET` | No | `dev-fallback-secret-key` | Secret key for signing and verifying JSON Web Tokens (pass your own in production!). |
| `NODE_ENV` | No | `production` | Node environment (`production` / `development`). |

---

## 🐳 Run Everything with Docker Compose (App + Database)

If you don't have a remote database and want to run **both the API and a local PostgreSQL container** together with persistent storage, save this as `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: vehicle_rental_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vehicle_rental_db
    ports:
      - "5433:5432" # Exposed on 5433 to avoid collision with any host Postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d vehicle_rental_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    image: shifat18/vehicle-rental-system-app:latest
    container_name: vehicle_rental_app
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      JWT_SECRET: your-custom-jwt-secret
      CONNECTION_STRING: postgresql://postgres:postgres@postgres:5432/vehicle_rental_db
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

Then run:
```bash
docker compose up -d
```

---

## 🗄️ Automatic Database Initialization

You do **not** need to run any manual migrations. On startup, the application checks and automatically creates:
* `USERS` table (Authentication, roles: `admin` and `customer`, hashed passwords).
* `VEHICLES` table (Vehicle catalog, types: `car`, `bike`, `van`, `SUV`, daily rent price, availability).
* `BOOKINGS` table (Rent duration, total price calculation, status, foreign key relationships with cascade delete).

---

## 🔒 Security & Architecture Highlights

* **Multi-stage build**: Compiled TypeScript output with devDependencies stripped (`node:20-alpine`).
* **Non-root user**: Runs under unprivileged user `node` for container security.
* **Graceful termination**: Handles `SIGTERM` and `SIGINT` signals cleanly for zero-downtime orchestrations.
* **Fail-fast configuration**: Validates `CONNECTION_STRING` on startup with human-readable error messages.

---

## 📖 Key API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register new customer or admin | Public |
| `POST` | `/api/v1/auth/login` | Login and receive JWT bearer token | Public |
| `GET` | `/api/v1/vehicles` | List vehicles (with availability filters) | Public |
| `POST` | `/api/v1/vehicles` | Add a new vehicle | Admin only |
| `POST` | `/api/v1/bookings` | Book a vehicle (auto-calculates total price) | Customer / Admin |
| `GET` | `/api/v1/bookings` | View bookings | Role-based |
| `GET` | `/api/v1` | Health check endpoint | Public |
