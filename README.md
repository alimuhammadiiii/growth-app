# Growth

Growth is a personal growth-tracking web app. You define a **Goal**, break it into scheduled **Activities**, and record what actually happened each day — completed, partially completed, or not completed, with an optional reason. Weekly reports then show what you planned, what you did, and where your plan may be unrealistic.

It is intentionally **not a todo app**: you don't manage daily tasks by hand. The app builds the day's plan from your schedules, and your job is only to record reality.

> The full domain model and business rules are defined in [AI_DOMAIN_CONTEXT.md](AI_DOMAIN_CONTEXT.md).

This is an early-stage MVP built with [Next.js](https://nextjs.org), React, TypeScript, Tailwind CSS, and PostgreSQL via [Drizzle ORM](https://orm.drizzle.team).

## Getting the code

```bash
git clone https://github.com/alimuhammadiiii/growth-app.git
cd growth-app
```

A plain clone is enough — there are no submodules, Git LFS files, or dev containers.

## Prerequisites

| Tool | Version | Why | Verify |
| --- | --- | --- | --- |
| [Node.js](https://nodejs.org) | 20 or later | Required by Next.js and the `@types/node@^20` baseline | `node --version` |
| [pnpm](https://pnpm.io) | 12.9.1 | Pinned via the `packageManager` field in `package.json`; the lockfile (`pnpm-lock.yaml`) and scripts assume it | `pnpm --version` |
| [Docker](https://docs.docker.com/get-docker/) | recent stable | Runs the local PostgreSQL database | `docker --version` |

Install the pinned pnpm version with:

```bash
npm install -g pnpm@12.9.1
```

## Getting started

These steps run the app in **local development** mode (with hot reload). For a production build, see [Build and quality checks](#build-and-quality-checks).

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the PostgreSQL database:

   ```bash
   pnpm db:start
   ```

   > [!WARNING]
   > The database is published on host port **5433**, not the default 5432. If something else already uses port 5433, edit `docker-compose.yml` first.

3. Create a `.env.local` file in the repo root with the local database connection string:

   ```env
   DATABASE_URL="postgresql://app_user:app_password@localhost:5433/growth_app"
   ```

   > [!NOTE]
   > These credentials are the local-only defaults from `docker-compose.yml`. Don't use them for anything exposed to a network.

4. Apply the database migrations:

   ```bash
   pnpm db:migrate
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser. To confirm the database connection works, check the health endpoint:

   ```bash
   curl http://localhost:3000/health/db
   ```

   It should return `{"ok":true}`.

## Build and quality checks

Build a production artifact and run it locally (this is distinct from the dev server above):

```bash
pnpm build
pnpm start
```

Check code quality:

```bash
pnpm lint
pnpm typecheck
```

There is no test suite yet.

### Database tooling

| Command | What it does |
| --- | --- |
| `pnpm db:generate` | Generate a migration from the schema in `src/db/schema` |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio to browse data |
| `pnpm db:start` / `pnpm db:stop` | Start/stop the local PostgreSQL container |
| `pnpm db:push` | Push the schema directly to the database |

> [!WARNING]
> `db:push` applies the schema straight to the database and bypasses migration history. Prefer `db:generate` + `db:migrate` so schema changes stay reproducible.

## Contributing

Bug reports and feature requests are welcome via [GitHub issues](https://github.com/alimuhammadiiii/growth-app/issues).

Before making changes, please read:

- [AGENTS.md](AGENTS.md) — architecture and coding conventions for this repo.
- [AI_DOMAIN_CONTEXT.md](AI_DOMAIN_CONTEXT.md) — the authoritative product and business rules. Don't invent domain behavior that isn't defined there.

No license has been added yet.
