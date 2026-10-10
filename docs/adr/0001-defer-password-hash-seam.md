# ADR-0001: Defer the password-hash module until a second adapter exists

## Status

Accepted

## Date

2026-10-10

## Context

User passwords are stored as salted scrypt hashes (format
`scrypt$<saltHex>$<hashHex>`, documented in `AI_DOMAIN_CONTEXT.md` §29).
Today the only producer of that hash is the development seed
(`src/db/seed.ts`, `hashDevPassword`). A future login feature would need a
matching verify function, which suggests extracting a shared password-hash
module (hash + verify behind one small interface).

At the moment of writing, the seed is the only adapter at that seam.

## Decision

Do not extract a password-hash module yet. Keep `hashDevPassword` inside
the seed until a second consumer (the real login) appears.

## Rationale

One adapter means a hypothetical seam; two adapters make the seam real.
Extracting now would create a module whose interface is guesses about a
login architecture that is still an open decision in
`AI_DOMAIN_CONTEXT.md` (see Open Decisions: "Authentication/session
architecture").

## Consequences

- `hashDevPassword` stays in the seed; the format stays documented in
  `AI_DOMAIN_CONTEXT.md` §29.
- Architecture reviews should not re-suggest this extraction until login
  work begins.
- When login lands, revisit: the scrypt scheme may be upgraded (e.g. to
  argon2id) behind a verify-and-rehash flow; the stored format is
  self-describing.
