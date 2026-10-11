# ADR-0003: Adopt Better Auth for authentication

## Status

Accepted

## Date

2026-10-10

## Context

`AI_DOMAIN_CONTEXT.md` listed the exact authentication mechanism and the
session architecture as Open Decisions. The application needed its first
login flow. Hand-rolling credentials, sessions, and cookie handling was an
alternative, as was deferring login further.

The existing `users.password_hash` column (salted scrypt, produced only by
the development seed) was a placeholder for "a future login" —
ADR-0001 explicitly deferred any shared password-hash module until login
work began.

## Decision

1. Adopt **Better Auth** as the authentication library:
   - Credentials (scrypt password hashes) live in Better Auth's
     `accounts` table — never on the `users` table.
   - Sessions are database-backed (`sessions` table) with a secure cookie.
   - Sign-in accepts **email or username** (Better Auth `username` plugin);
     email remains a required user field either way.
   - The existing `users` table remains the single User concept; Better
     Auth's `user` model is mapped onto it via the Drizzle adapter
     (`usePlural`, uuid ids).
2. Drop `users.password_hash`. The account table is the sole credential
   store (the column predated any real login; only dev-seed data existed).
3. Sign-up captures the browser's IANA timezone (domain rule: timezone is
   detected at initial setup, §30 of `AI_DOMAIN_CONTEXT.md`).

## Rationale

- Authentication is security-critical and easy to get subtly wrong;
  a maintained library beats a hand-rolled scheme.
- Keeping one `users` table preserves the domain model (`goals.user_id`
  FK, single User concept) instead of splitting identity across two
  tables.
- Both email and username login was a product choice: email is Better
  Auth's default identifier; usernames match the app's personal,
  name-based tone.

## Consequences

- ADR-0001 is superseded: no hand-rolled hash/verify module will exist.
  `hashDevPassword` was removed from the seed; the seed now provisions
  the dev user through Better Auth's `signUpEmail` (user + credential
  account atomically).
- `AI_DOMAIN_CONTEXT.md` §29 now lists `email` and `username` among user
  fields; the scrypt-format documentation moved to Better Auth's domain.
- New tables `sessions`, `accounts`, `verifications` are owned by Better
  Auth; app code should not write them directly.
- Session checks in server components use `auth.api.getSession`; guest
  guards redirect authenticated users away from `/login` and `/signup`.
- Migration `0004` adds `users.email` as `NOT NULL` without a default, so
  it fails on any database that already contains users (PostgreSQL
  rejects the backfill-free column add). Databases seeded before this
  change must be reset (`docker compose down -v`, `pnpm db:start`,
  `pnpm db:migrate`, `pnpm db:seed`); fresh clones are unaffected.
