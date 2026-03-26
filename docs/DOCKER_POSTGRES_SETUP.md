# PostgreSQL Docker Setup Guide

## Overview
This project now includes a PostgreSQL container with persistent data storage. The database data is preserved even when containers are shut down.

## Quick Start

### 1. Configure Environment Variables
Create a `.env.local` file (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update the values:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=dashboard
AUTH_SECRET=your_auth_secret_key
AUTH_URL=http://localhost:3000
```

### 2. Start Development Environment

```bash
docker-compose -f docker-compose.dev.yml up
```

The app will automatically wait for PostgreSQL to be healthy before starting.

### 3. Access the Services

- **Next.js App**: http://localhost:3001
- **PostgreSQL**: localhost:5432
  - Username: `postgres` (or your configured `POSTGRES_USER`)
  - Password: (your configured `POSTGRES_PASSWORD`)
  - Database: `dashboard` (or your configured `POSTGRES_DB`)

## Data Persistence

### How It Works
- PostgreSQL data is stored in a named volume: `postgres_data`
- When you run `docker-compose down`, the volume is preserved
- When you run `docker-compose up` again, the data is automatically restored

### Stop Containers (data preserved)
```bash
docker-compose -f docker-compose.dev.yml down
```

### Remove Everything (including data)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

The `-v` flag removes all volumes, deleting the database data.

## Production Setup

For production, use:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Same data persistence features apply.

## Database Initialization

To run seed scripts or migrations automatically on startup, you can:

1. **Option A**: Add initialization scripts to the postgres service:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./init-scripts:/docker-entrypoint-initdb.d
```

Create SQL files in an `init-scripts` folder - they'll run automatically on first startup.

2. **Option B**: Use Prisma migrations in your app:
```bash
# Inside the running container
docker-compose exec app pnpm prisma migrate dev
```

## Troubleshooting

### Check PostgreSQL is running
```bash
docker-compose logs postgres
```

### Connect directly to PostgreSQL
```bash
docker exec -it nextjs-dashboard-postgres-dev psql -U postgres -d dashboard
```

### View volumes
```bash
docker volume ls | grep postgres
```

### Check container health
```bash
docker ps --filter name=postgres
```

## Environment Variable Options

### Auto-generated Connection String (Recommended)
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=dashboard
# docker-compose will construct: postgresql://postgres:postgres@postgres:5432/dashboard
```

### Manual Connection String
```env
POSTGRES_URL=postgresql://postgres:password@postgres:5432/dashboard
```

Both approaches are supported. The manual one takes precedence if set.

