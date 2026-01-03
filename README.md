# Hypertube

## 📦 Prerequisites

- [Docker](https://www.docker.com/) 🐳
- [pnpm](https://pnpm.io/) 📦

## 🚀 Getting Started

### 1. Configure environment variables

Create the `.env` file from the example:

```bash
cp .env.example .env
```

⚠️ **Don’t forget to fill in the required values in `.env`.**

### 2. Create the Docker network

```bash
docker network create hypertube-network
```

### 3. Start the infra

```bash
docker compose up
```

or

```bash
make infra
```

### 4. [OPTIONAL] Start infra helpers

```bash
docker compose -f docker-compose-helpers.yml up
```

or

```bash
make helpers
```

## 📂 Launch Modes

### 🔹 Option 1 — Local (development)

Install dependencies:

```bash
pnpm install
```

Initialize the database:

```bash
pnpm --filter server-core prisma:migrate
```

Create downloads symlink (simulate docker volume)

```bash
ln -s ../downloader/downloads ./apps/server/downloads
```

Build packages:

```bash
pnpm build
```

Run all workers in dev mode (hot reload):

```bash
pnpm dev
```

### 🔹 Option 2 — Dev with Docker (only for 42)

```bash
docker compose -f docker-compose-dev.yml up
```

or

```bash
make dev
```

### 🔹 Option 3 — Prod with Docker (no hot reload)

```bash
docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml up
```

or

```bash
make prod
```

## 📜 Dependency Installation Rules

The project is split into **7 workspaces**:

- **client** (`apps/client`)
- **libs** (`packages/libs`)
- **server** (`apps/server`)
- **server-core** (`packages/server-core`)
- **downloader** (`apps/downloader`)
- **scheduler** (`apps/scheduler`)
- **yts-api-proxy** (`apps/yts-api-proxy`)

### Install a dependency shared across multiple workspaces:

```bash
pnpm add <package-name> -w
```

### Install a dependency only for a specific workspace:

```bash
cd apps/{workspace}
pnpm add <package-name>
```

## ℹ️ Workspace Info

### 🖥️ Client (`apps/client`)

- Developed with **Vite**
- Runs in dev on: [http://localhost:3001](http://localhost:3001)
- In production: rendered by the server

---

### 📚 Libs (`packages/libs`)

- Functions exported in `index.ts` can be used in other workspaces

---

### ⚙️ Server (`apps/server`)

- **Hono** server
- Runs in dev on: [http://localhost:3000](http://localhost:3000)

---

### 📚 Server core (`packages/server-core`)

- Functions exported in `index.ts` can be used in other server side workspaces

---

### ⚙️ Downloader (`apps/downloader`)

- Worker that listen bullMQ to start and monitor movie downloads

---

### ⚙️ Scheduler (`apps/scheduler`)

- Worker to run cron jobs

### ⚙️ Yts API proxy (`apps/yts-api-proxy`)

- A proxy for the yts using a VPN

## 📦 Package Import Rules

Understanding how packages can import each other is key to maintaining a clean and scalable monorepo structure:

- **libs**
  - Can be imported in **any package** (client, server, server-core, downloader, scheduler).
- **server-core**
  - Can be imported in any **server-side package** (**server**, **downloader**, **scheduler**).
  - **Cannot** be imported in **libs** or **client**.

| Importing Package | Can import libs | Can import server-core |
| ----------------- | :-------------: | :--------------------: |
| libs              |        —        |           ❌           |
| server-core       |       ✅        |           —            |
| server            |       ✅        |           ✅           |
| downloader        |       ✅        |           ✅           |
| scheduler         |       ✅        |           ✅           |
| yts-api-proxy     |       ✅        |           ✅           |
| client            |       ✅        |           ❌           |

_Note: This ensures shared logic and types flow in one direction (from base to specialized packages), and frontend code never accidentally pulls in backend/server-only code._
