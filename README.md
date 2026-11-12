# Thavala Store

A full-stack e-commerce app built with Next.js (App Router) + Tailwind CSS, backed by an embedded SQLite database (`node:sqlite`) — no external DB server required.

## Features

- Product catalog with search, category filter, and sorting
- Product detail pages
- Cart & wishlist (localStorage) with checkout flow
- Auth: register / login / logout sessions (signed HMAC cookies)
- Admin panel to add/delete products
- REST API under `/api/*`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The SQLite database is created and seeded automatically at `data/store.db` on first run.

Seeded accounts:

- Admin: `admin@example.com` / `admin123`
- Customer: `customer@example.com` / `customer123`

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Secret used to sign session cookies. **Set a strong random value in production.** |
| `DATA_DIR` | Directory for the SQLite file. Optional locally; set to your disk mount path (e.g. `/var/data`) on hosts with a persistent disk. |

## Requirements

- Node.js **≥ 22.5** (uses the built-in `node:sqlite` module)

## Deploy on Render

A `render.yaml` blueprint is included:

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint** and pick the repo.
3. Render provisions the web service, sets `NODE_VERSION=22.11`, generates `AUTH_SECRET`, and mounts a 1 GB persistent disk at `/var/data` (used via `DATA_DIR`) so the SQLite data survives deploys.
4. Build: `npm ci && npm run build` · Start: `npm run start`.

> Note: the free plan does **not** support persistent disks. With a free instance the DB resets on every deploy/restart — upgrade to a paid plan or attach a disk to keep data. (Render free web services also spin down after idle; first request may be slow.)

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
