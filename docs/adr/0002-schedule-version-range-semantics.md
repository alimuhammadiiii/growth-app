# ADR-0002: Schedule Version effective ranges are [startDate, endDate), adjacency permitted

## Status

Accepted

## Date

2026-10-10

## Context

`AI_DOMAIN_CONTEXT.md` defines Schedule Version semantics as
`[startDate, endDate)`: the start date is inclusive, the end date is
exclusive, and a null end date means the version has no end. Section 18
(schedule changes / historical integrity) left the exact database
enforcement to implementation time.

Migration `0003_uneven_wild_pack.sql` now enforces the one-effective-
version-per-activity invariant with:

```sql
EXCLUDE USING gist (
  activity_id WITH =,
  daterange(effective_start_date, effective_end_date) WITH &&
)
```

`daterange` uses default `[)` bounds, which matches the domain's
`[startDate, endDate)` semantics exactly; a null end date becomes an
unbounded range `(start, ∞)`.

## Decision

1. A Schedule Version's `effectiveEndDate` is **exclusive**. The range
   covered is `[effectiveStartDate, effectiveEndDate)`.
2. **Adjacent versions are permitted**: a new version may start exactly
   on the previous version's end date, because `[a, b)` and `[b, c)` do
   not overlap. This is asserted by the positive-control test in
   `src/db/test-constraints.ts`.
3. All schedule-range code must treat `effectiveEndDate` as exclusive.
   Code that treats it as inclusive will double-count one calendar day.

## Consequences

- The database rejects overlapping versions (`23P01`); adjacent ones
  pass. Callers never need to check overlaps themselves.
- Any future date-range arithmetic (daily expected-activity
  calculation, weekly reports) must use half-open interval logic.
- The constraint lives outside the drizzle schema (see the comment in
  `0003_uneven_wild_pack.sql`); `drizzle-kit generate` cannot see it and
  `drizzle-kit push` leaves it alone (verified against 0.31.11).
