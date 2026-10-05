<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project AI Instructions

## Required Context

Before implementing or modifying any business/domain code, read:

- `AI_DOMAIN_CONTEXT.md`

`AI_DOMAIN_CONTEXT.md` is the authoritative source for product/domain meaning and business rules.

Do not invent business rules that are not defined there.

If a requested implementation depends on an unresolved decision listed under `Open Decisions` in `AI_DOMAIN_CONTEXT.md`, do not silently choose a permanent business rule. Flag the decision before encoding it into the domain.

## Core Domain

The core domain concepts are:

- User
- Goal
- Activity
- Schedule
- Schedule Version
- Execution

Keep these concepts separate.

The fundamental distinction is:

- Schedule = what should happen
- Execution = what actually happened
- Analysis = interpretation of recorded data in the context of the plan

Never collapse these concepts into one generic Task/Todo model.

## Business Rules

Always preserve these principles:

1. Missing execution data is not automatically `NOT_COMPLETED`.
2. App inactivity is not proof that the user did nothing.
3. Historical schedules must not be rewritten when a schedule changes.
4. Schedule changes require historical versioning.
5. Archive is preferred over destructive deletion for domain history.
6. Goal does not inherently require a numeric target.
7. The MVP should remain simple and should not become a generic Todo application.
8. Historical execution data must remain understandable.
9. User-owned data must always be scoped to the authenticated user.
10. Calendar dates and timestamps are different domain concepts.

## Architecture

Prefer this backend flow:

HTTP Request
→ Route Handler
→ Zod Validation
→ Use Case
→ Repository
→ Drizzle ORM
→ PostgreSQL

### Route Handler

Responsible primarily for:

- HTTP concerns
- authentication context
- request parsing
- validation
- calling use cases
- mapping results/errors to HTTP responses

Do not put complex business rules in route handlers.

### Use Case

Responsible for:

- application/business operations
- enforcing business rules
- coordinating repositories
- handling meaningful state transitions

Examples:

- CreateGoal
- CreateActivity
- ChangeActivitySchedule
- RecordExecution
- ArchiveGoal
- ArchiveActivity
- GenerateWeeklyReport

Do not create unnecessary use cases before a real operation requires them.

### Repository

Responsible for persistence.

Repositories should contain database access and persistence-specific logic.

Do not turn repositories into a place for unrelated business rules.

## Database

Use:

- PostgreSQL
- Drizzle ORM
- TypeScript

Database schema is the persistence model.

Business rules must not depend on raw SQL being scattered throughout the application.

Use migrations for database changes.

Never modify production database structure manually when the change should be represented by a migration.

## Validation

Use Zod for structural input validation.

Do not confuse validation with business rules.

Example:

Zod:
- title must be a string

Business rule:
- an archived Goal cannot receive a new active Activity

## Timezone

Timezone is automatically detected from the user's system/browser during initial setup.

The user does not manually select a timezone in MVP.

Store the detected IANA timezone on the User.

Examples:

- Europe/Rome
- Asia/Tehran
- America/New_York

Use the stored timezone as the current basis for date-based planning and execution logic.

Do not automatically overwrite the stored timezone whenever the browser reports a different timezone later.

Technical timestamps such as:

- createdAt
- updatedAt

should be timezone-aware timestamps / UTC.

Calendar-domain values such as:

- Execution.date
- Schedule.startDate
- Schedule.endDate

represent local calendar dates and must not be casually converted into UTC timestamps.

## Historical Integrity

Whenever implementing a feature, ask:

> Can this change alter the interpretation of historical data?

If yes, review Schedule Versioning and historical integrity before implementing it.

Never retroactively apply a new schedule to historical dates unless the product explicitly requires it.

## Analytics

Analytics should primarily be derived from source records.

Do not store derived metrics as primary truth unless there is a demonstrated need.

Examples of source data:

- Schedule
- Schedule Version
- Execution
- Execution status
- Execution note/reason
- dates

Metrics such as completion percentages should have an explicit denominator.

Never create a generic ambiguous field such as `percentage` without defining what it represents.

## MVP Discipline

Do not add the following unless explicitly requested:

- AI coach
- AI agent
- gamification
- points
- badges
- social features
- leaderboards
- complex task management
- unnecessary calendar functionality
- unnecessary abstractions
- speculative domain entities

The first goal is a reliable:

Plan
→ Execute
→ Record
→ Review
→ Understand
→ Adjust

loop.

## Coding Principles

Prefer:

- simple code
- explicit domain concepts
- strong TypeScript types
- small focused functions
- clear naming
- predictable data flow
- testable business logic

Avoid:

- premature abstraction
- generic "manager" classes
- giant service files
- business logic hidden inside ORM queries
- duplicated business rules
- magic strings for domain states
- unnecessary dependencies

## Before Coding

Before making a non-trivial change:

1. Read `AI_DOMAIN_CONTEXT.md`.
2. Identify affected domain concepts.
3. Identify affected business rules.
4. Check historical-data implications.
5. Check ownership/security implications.
6. Check timezone/date implications.
7. Check whether the requirement is already defined or is an Open Decision.
8. Implement the smallest coherent change.
9. Add/update tests where business behavior is affected.

## When Requirements Are Ambiguous

Do not silently invent product behavior.

If the ambiguity affects:

- data meaning
- historical integrity
- state transitions
- ownership
- scheduling
- execution semantics
- analytics
- deletion/archive behavior

treat it as a product decision.

Prefer preserving existing behavior and clearly identifying the unresolved decision.

## Important

The AI is an implementation assistant, not the product owner.

Do not change business semantics merely because another implementation would be technically convenient.