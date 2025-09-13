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

## 📂 Launch Modes

### 🔹 Option 1 — Local (development)

Install dependencies:

```bash
pnpm install
```

Initialize the database:

```bash
pnpm --filter server prisma:migrate
```

Run the app in dev mode (hot reload):

```bash
pnpm dev
```

### 🔹 Option 2 — Dev with Docker (only for 42)

```bash
docker compose -f docker-compose-workers-dev.yml up
```

```bash
docker compose -f docker-compose-dev.yml up
```

### 🔹 Option 3 — Prod with Docker (no hot reload)

```bash
docker compose -f docker-compose-workers-prod.yml up
```

```bash
docker compose -f docker-compose-prod.yml up
```

## 📜 Dependency Installation Rules

The project is split into **3 workspaces**:

- **client** (`apps/client`)
- **server** (`apps/server`)
- **libs** (`apps/libs`)

### Install a dependency shared across multiple workspaces:

```bash
pnpm add <package-name> -w
```

### Install a dependency only for a specific workspace:

```bash
cd apps/client   # or apps/server / libs
pnpm add <package-name>
```

## ℹ️ Workspace Info

### 🖥️ Client (`apps/client`)

- Developed with **Vite**
- Runs in dev on: [http://localhost:3001](http://localhost:3001)
- In production: rendered by the server

---

### 📚 Libs (`apps/libs`)

- Functions exported in `index.ts` can be used in other workspaces
- Compiles automatically on save

---

### ⚙️ Server (`apps/server`)

- **Hono** server
- Runs in dev on: [http://localhost:3000](http://localhost:3000)
