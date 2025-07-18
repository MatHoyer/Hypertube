# Hypertube

## 📁 Prerequisites

- pnpm
- docker

## Launch

Create the .env (and complete it)

```bash
cp .env.example .env
```

Install dependaces

```bash
pnpm i
```

Launch dockers

```bash
docker compose up
```

Launch

```bash
pnpm dev
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

Use vite to dev and build

### libs workspace

All exported function in the index.ts can be used in other workspaces

Compiled on save

### server workspace

Hono server
