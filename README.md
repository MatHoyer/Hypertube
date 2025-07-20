# Hypertube

## 📁 Prerequisites

- docker
- pnpm

## Launch

Create the root .env (and complete it)

```bash
cp .env.example .env
```

Create the docker network

```bash
docker network create hypertube-network
```

Launch db dockers

```bash
docker compose up
```

### Run in local (dev)

Install dependances

```bash
pnpm i
```

Init db

```bash
pnpm --filter server prisma:migrate
```

Run

```bash
pnpm dev
```

### Dev with docker (only for 42)

```bash
docker compose -f docker-compose-dev.yml up
```

### Prod with Docker

Launch app dockers

```bash
docker compose -f docker-compose-prod.yml up
```

## Rules

This repo has 3 workspaces, if a packages is needed in more than 1 worksapce you can add it on the root package json

```bash
pnpm add <package name> -w
```

otherwise you will have to go in the workspace and install it localy

```bash
cd apps/client
pnpm add <package name>
```

## Infos

### client workspace

```text
Use vite to dev and build

In dev run on localhost:3001

In prod render by the server
```

### libs workspace

```text
All exported function in the index.ts can be used in other workspaces

Compiled on save
```

### server workspace

```text
Hono server

In dev run on localhost:3000
```
