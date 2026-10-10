# Product Domain & Business Logic Context

## AI Engineering Specification for the Growth Tracking App

> **Purpose:** This document is the authoritative product/domain context
> for AI coding agents working on this project.
>
> **Primary audience:** GLM / OpenCode and future developers.
>
> **Rule:** Do not invent, silently change, or "improve" business rules
> defined here. If an implementation requires a decision that is not
> specified, treat it as an **Open Decision**, preserve existing
> behavior, and ask for/flag the decision before introducing a new
> domain rule.

------------------------------------------------------------------------

# 1. Product Vision

This product is a personal growth tracking application.

The user defines a **Goal** and describes the recurring or planned
**Activities** they want to perform in pursuit of that goal.

The core product is intentionally **not a traditional Todo List**.

The user should not have to repeatedly manage every daily task manually.
The user establishes what they want to work on, and the application
creates/maintains the relevant daily structure. During the day, the user
mainly records what actually happened.

The product then turns those daily records into a clear history and
weekly/monthly view so the user can understand:

-   what they planned to do,
-   what they actually did,
-   what they consistently completed,
-   what they only partially completed,
-   what they did not complete,
-   why they failed to complete something when they choose to explain
    it,
-   how consistent their behavior has been over time,
-   where their plan may be unrealistic,
-   and how their behavior has changed over the course of the goal.

The fundamental value proposition is **clarity of progress**.

The product should help a user answer:

> "I started this path. What have I actually done so far, where did I
> struggle, and what does my own data tell me?"

------------------------------------------------------------------------

# 2. Product Philosophy

## 2.1 Data first, management second

The application should collect useful behavioral data with very low
daily friction.

The user should not need to spend a large amount of time managing the
application.

Daily interaction should primarily be:

1.  See today's planned activities.
2.  Mark each activity as completed, partially completed, or not
    completed.
3.  Optionally explain partial/non-completion.
4.  Close/complete the day.

The application does the aggregation and presentation.

## 2.2 The product is not intended to create pressure

The product should not force every user into a rigid target/challenge
system.

A user may:

-   have a measurable target, OR
-   simply want to practice/work on something and observe their
    progress.

Therefore, a Goal does **not** inherently require a numeric target.

Do not add artificial targets, streak requirements, points, penalties,
or gamification to the MVP.

## 2.3 Transparency over opaque analysis

The user's own data should remain understandable.

Reports should be explainable from the underlying records.

The MVP should prioritize:

-   clear tables,
-   percentages,
-   counts,
-   history,
-   trends,
-   simple summaries.

Advanced AI analysis/recommendations can be added later.

------------------------------------------------------------------------

# 3. MVP Scope

The MVP must stay intentionally small.

## Included

-   User
-   Goal
-   Activity
-   Schedule
-   Schedule versioning
-   Execution
-   Daily completion states
-   Partial completion
-   Non-completion
-   Optional reason/notes
-   Day closing/reminder concept
-   Goal/activity history
-   Weekly analysis/report
-   Basic monthly/history views where useful
-   Archive behavior
-   Timezone-aware date logic
-   Clear data visualization

## Explicitly NOT a core MVP requirement

Do not add these unless a later product decision explicitly introduces
them:

-   AI agent/coach
-   automatic behavioral recommendations
-   complex gamification
-   points
-   badges
-   social features
-   leaderboards
-   complicated calendar management
-   elaborate project-management features
-   excessive notification systems
-   unnecessary task-management workflows

The product should first prove the core loop:

**Plan → Execute → Record → Review → Understand → Adjust**

------------------------------------------------------------------------

# 4. Core Domain Concepts

The core domain is organized around four primary concepts:

``` text
Goal
  ↓
Activity
  ↓
Schedule
  ↓
Execution
```

They are related, but they are NOT interchangeable.

------------------------------------------------------------------------

# 5. Goal

## Definition

A **Goal** represents a meaningful direction/path the user wants to
pursue.

Examples:

-   Learn English
-   Exercise regularly
-   Read more books
-   Build a side project
-   Improve programming skills

A Goal answers:

> "What am I trying to improve or work toward?"

## Important rule

A Goal does not necessarily have a numeric target.

Example:

> Goal: Learn English

This is valid even without:

> "Reach B2 in 90 days."

Do not require a target unless the product later explicitly adds target
functionality.

## Goal ownership

Every Goal belongs to exactly one User.

Conceptually:

``` text
User 1 ──── * Goals
```

A user must never be able to access another user's Goal.

------------------------------------------------------------------------

# 6. Activity

## Definition

An **Activity** represents a concrete behavior/action that contributes
to a Goal.

Examples for:

> Goal: Learn English

Activities might be:

-   Study vocabulary
-   Read English
-   Listen to English
-   Practice speaking

An Activity answers:

> "What behavior do I want to perform?"

## Activity vs Goal

Goal:

> Learn English

Activity:

> Study vocabulary for 30 minutes

The Goal is the direction. The Activity is the behavior.

## Activity ownership

An Activity belongs to one Goal.

Conceptually:

``` text
User
  └── Goal
       └── Activity
```

------------------------------------------------------------------------

# 7. Schedule

## Definition

A **Schedule** describes when and under what planning rules an Activity
is expected to occur.

Schedule is a **plan**, not evidence that the user actually performed
the Activity.

This distinction is fundamental.

Example:

``` text
Activity:
Study vocabulary

Schedule:
Monday, Wednesday, Friday
30 minutes
```

The Schedule answers:

> "According to the current plan, when should this Activity happen?"

It does NOT answer:

> "Did the user actually do it?"

That is the job of Execution.

------------------------------------------------------------------------

# 8. Execution

## Definition

An **Execution** is the user's actual recorded result for a scheduled
Activity on a specific local calendar date.

Execution answers:

> "What actually happened?"

For an expected Activity on a given day, the result can be:

-   Completed
-   Partially completed
-   Not completed

The exact persisted state names should be kept consistent throughout the
codebase.

Recommended canonical states:

``` text
COMPLETED
PARTIAL
NOT_COMPLETED
```

Do not introduce synonyms such as:

-   DONE
-   SUCCESS
-   FAILED
-   HALF_DONE

unless the domain model is intentionally changed.

------------------------------------------------------------------------

# 9. Planned vs Actual

This is one of the most important architectural distinctions.

Do not derive actual behavior directly from the Schedule.

Correct model:

``` text
Schedule
    ↓
Expected Activity for Date
    ↓
Execution
    ↓
Actual result
```

Example:

``` text
Schedule:
Study English every Monday

2026-10-05:
Expected = YES
Execution = COMPLETED

2026-10-12:
Expected = YES
Execution = PARTIAL

2026-10-19:
Expected = YES
Execution = NOT_COMPLETED
```

The schedule remains the plan. Executions are historical facts.

------------------------------------------------------------------------

# 10. Partial Completion

Partial completion is a first-class result.

The user can say:

> "I planned to study for 60 minutes but only studied for 25."

The user marks:

``` text
PARTIAL
```

and may provide a reason/note such as:

> "I didn't have enough time."

The MVP does not need to force a numeric completion percentage unless
that is explicitly added later.

Do not infer an exact percentage from text.

------------------------------------------------------------------------

# 11. Not Completed

If the user did not perform the planned Activity, the user can mark:

``` text
NOT_COMPLETED
```

The user may provide a reason.

Examples:

-   "My schedule was overloaded."
-   "I was too tired."
-   "Unexpected work came up."
-   "I decided this activity was not important today."

A reason is useful data because the product is intended to help the user
discover patterns in failure/non-completion.

Do not force users to provide a reason unless the product later
explicitly requires it.

------------------------------------------------------------------------

# 12. Daily Interaction

The daily interaction should be extremely lightweight.

Typical daily flow:

``` text
Open app
   ↓
See today's planned activities
   ↓
During the day / end of day:
record actual state
   ↓
For PARTIAL or NOT_COMPLETED:
optionally add explanation
   ↓
Close the day
```

The user should not have to rebuild the day's plan manually.

------------------------------------------------------------------------

# 13. Day Closing

The application should support a daily closing step/reminder.

The purpose is not to punish the user.

The purpose is to give the user a chance to record what happened while
the day is still understandable.

A day can therefore conceptually move toward a closed/reviewed state.

The exact persisted Day entity/state model is not yet a finalized
separate domain entity. Do not invent one unless implementation requires
it and the decision is explicitly made.

------------------------------------------------------------------------

# 14. Important Analytics Rule: No Activity Is Not Automatically Failure

If the user never opens the application and makes no changes, this must
**not automatically be interpreted as a behavioral failure**.

Reason:

The system does not know what happened in real life.

Therefore:

``` text
No app interaction
≠
User did nothing
```

and:

``` text
No recorded execution
≠
Confirmed failure
```

unless the user explicitly records the Activity as not completed.

This is critical for analytics.

Do not calculate:

> "User failed today"

merely because the app was not opened.

The system should distinguish:

-   confirmed user-recorded outcome,
-   no recorded data,
-   scheduled/expected activity.

These are different concepts.

------------------------------------------------------------------------

# 15. Zero / Missing Data Rule

If a scheduled Activity has no execution record because the user never
recorded an outcome, do not silently turn that absence into a confirmed
`NOT_COMPLETED` execution.

A report may show something like:

-   Recorded completion
-   Recorded partial
-   Recorded non-completion
-   Unrecorded / no data

The exact UI labels can evolve, but the underlying semantic distinction
must remain.

------------------------------------------------------------------------

# 16. Schedule Versioning

Schedules are historical plans.

When a user changes the schedule, the system must not rewrite history as
though the new plan had always existed.

Example:

Original schedule:

``` text
Study English
Monday / Wednesday / Friday
```

Later the user changes it to:

``` text
Monday / Tuesday / Thursday
```

The historical period must retain the old schedule definition.

Conceptually:

``` text
Schedule Version 1
Mon / Wed / Fri
        │
        └── historical period

Schedule Version 2
Mon / Tue / Thu
        │
        └── new period
```

This is required so reports remain historically accurate.

------------------------------------------------------------------------

# 17. Schedule Versioning Principle

A schedule change means:

> "The plan changed from this point forward."

It does NOT mean:

> "The past should be recalculated using the new plan."

Therefore:

-   never mutate historical schedule meaning,
-   never retroactively apply a new schedule to old dates,
-   preserve the effective period/version of the plan.

------------------------------------------------------------------------

# 18. Schedule Effective Dates

A Schedule Version should have an effective period.

Conceptually:

``` text
effectiveStartDate
effectiveEndDate
```

The exact database constraints and transition implementation should be
defined when the schedule implementation is built.

At minimum:

-   versions must not create ambiguous overlapping active plans for the
    same Activity,
-   a new version starts from a defined date,
-   old versions remain available for historical interpretation.

------------------------------------------------------------------------

# 19. State Transition Philosophy

Business state changes must be explicit.

Do not allow arbitrary database updates that bypass business rules.

Conceptually:

``` text
Draft / Active / Archived
```

or other states should be changed through domain operations/use cases.

The exact final state list must follow the already-approved domain model
and must not be invented casually during implementation.

------------------------------------------------------------------------

# 20. Archive vs Delete

For user-created domain data, the preferred behavior is generally:

**Archive instead of destructive delete.**

Reason:

The application is fundamentally a historical tracking system.

Deleting an Activity or Goal can destroy the context required to
understand the user's journey.

Therefore, unless a later product decision explicitly introduces
permanent deletion:

``` text
Active
  ↓
Archived
```

is preferred over:

``` text
Active
  ↓
DELETE
```

Historical executions should remain understandable.

------------------------------------------------------------------------

# 21. Goal Lifecycle

A Goal can be active or archived.

Archiving means:

> The user is no longer actively pursuing this Goal.

It does not mean:

> The Goal never existed.

Archived Goals should remain available in historical views where
appropriate.

Do not automatically delete Activities, Schedules, or Executions merely
because the Goal is archived.

------------------------------------------------------------------------

# 22. Activity Lifecycle

An Activity can be archived.

Archiving means:

> The Activity is no longer part of the user's active plan.

Historical executions should remain.

The system must avoid changing historical reports simply because an
Activity was archived later.

------------------------------------------------------------------------

# 23. Analysis Philosophy

The first version of analysis should be descriptive before it is
prescriptive.

The application should first answer:

> "What happened?"

before attempting:

> "What should you do?"

MVP analysis should therefore focus on:

-   completion counts,
-   partial counts,
-   non-completion counts,
-   recorded vs unrecorded data,
-   consistency over time,
-   activity-level patterns,
-   goal-level progress,
-   changes across weeks,
-   reasons recorded by the user.

------------------------------------------------------------------------

# 24. Weekly Report

The weekly report is a core product feature.

It should transform raw execution data into a clear summary.

The report should help answer:

1.  How many planned Activities had recorded outcomes?
2.  How many were completed?
3.  How many were partial?
4.  How many were explicitly marked not completed?
5.  Which Activities were most consistent?
6.  Which Activities struggled?
7.  What reasons were recorded for partial/non-completion?
8.  How did this week compare with previous weeks where enough data
    exists?

Percentages should be calculated only from an explicitly defined
denominator.

Do not silently count unrecorded days as failures.

------------------------------------------------------------------------

# 25. Percentage Rule

A percentage is meaningful only when its denominator is clearly defined.

For example, a completion rate may be:

``` text
completed / recorded outcomes
```

or:

``` text
completed / expected occurrences
```

These are NOT the same metric.

The UI and domain code must explicitly name which metric is being
calculated.

Do not use a vague field called `percentage` without defining its
denominator.

------------------------------------------------------------------------

# 26. Reason Data

Reasons attached to PARTIAL or NOT_COMPLETED outcomes are valuable
behavioral data.

They may later support pattern analysis such as:

``` text
Time shortage
Unexpected work
Low energy
Plan too ambitious
Loss of interest
Other
```

However, free-form user text should not automatically be converted into
a fixed category in the MVP unless a categorization system is explicitly
designed.

Raw user-provided notes should remain available.

------------------------------------------------------------------------

# 27. Monthly / Long-Term History

The user should be able to understand the journey beyond one week.

Long-term views can include:

-   weekly trends,
-   monthly aggregation,
-   activity consistency,
-   historical execution timeline,
-   goal journey.

The important principle is that historical data must remain tied to the
plan that was actually active at that time.

Schedule versioning exists largely to protect this historical truth.

------------------------------------------------------------------------

# 28. Data Model Direction

The core relational model is conceptually:

``` text
User
 │
 └── Goal
      │
      └── Activity
           │
           ├── Schedule / ScheduleVersion
           │
           ├── Pause (if applicable)
           │
           └── Execution
```

A more explicit relational direction:

``` text
users
  1
  │
  └─────< goals
            1
            │
            └─────< activities
                       1
                       │
                       ├─────< schedule_versions
                       │
                       ├─────< pauses
                       │
                       └─────< executions
```

Foreign keys should enforce ownership relationships.

------------------------------------------------------------------------

# 29. User Data

The User currently needs at least the concept of:

``` text
id
name
passwordHash
timezone
createdAt
updatedAt
```

`name` is a required display name.

`passwordHash` exists so that a future login can verify credentials.
Passwords must never be stored in plaintext. Until real login exists,
the only producer of password hashes is the development seed, which
stores a salted scrypt hash in the format:

``` text
scrypt$<saltHex>$<hashHex>
```

Login/session architecture itself remains an open decision (see Open
Decisions). Storing the hash does not implement authentication.

Timezone behavior is important and is explicitly defined below.

------------------------------------------------------------------------

# 30. Timezone Rules

Timezone must NOT be requested from the user during MVP onboarding.

Initial behavior:

``` text
Browser / OS
      ↓
Detect IANA timezone
      ↓
Save to User.timezone
```

Examples:

``` text
Europe/Rome
Asia/Tehran
America/New_York
```

The application uses the stored timezone as the current basis for
date-based planning and execution logic.

The user does not need to manually select a timezone in MVP.

------------------------------------------------------------------------

# 31. Stored Timezone Is the Current Source for Date Logic

The initial timezone is detected from the system/browser.

After it is stored:

``` text
User.timezone
```

becomes the current basis for the application's date calculations.

Do NOT automatically overwrite the stored timezone just because the
browser reports a different timezone later.

Reason:

-   user may travel,
-   user may change devices,
-   VPN may affect environment,
-   historical interpretation must remain stable.

Manual timezone editing may be added in a future version.

------------------------------------------------------------------------

# 32. Timestamp vs Calendar Date

This distinction is mandatory.

Technical timestamps:

``` text
createdAt
updatedAt
```

should be stored as timezone-aware timestamps / UTC.

Example:

``` text
2026-10-04T18:30:00Z
```

Calendar-date domain values should remain calendar dates.

Examples:

``` text
Execution.date
Schedule.startDate
Schedule.endDate
Pause.startDate
Pause.endDate
```

These represent local calendar dates, not absolute instants.

Conceptually:

``` text
createdAt / updatedAt
    → timestamp / UTC

Execution.date
Schedule.startDate
Schedule.endDate
Pause.startDate
Pause.endDate
    → local calendar date
```

Do not convert a calendar date into a UTC timestamp merely because
PostgreSQL can store timestamps.

This distinction prevents midnight/timezone bugs.

------------------------------------------------------------------------

# 33. Ownership and Security

All personal data belongs to a specific User.

Every application-level query involving user-owned domain data must
enforce ownership.

Never rely on:

``` text
id alone
```

when an operation should be scoped to the authenticated user.

Conceptually:

``` text
authenticatedUserId
        +
resourceId
        ↓
authorized resource
```

The system must never allow:

``` text
User A → read/update User B's Goal
```

------------------------------------------------------------------------

# 34. Backend Architecture Principles

The backend should be understandable and domain-oriented.

Preferred conceptual flow:

``` text
HTTP Request
    ↓
Route Handler
    ↓
Input Validation (Zod)
    ↓
Use Case
    ↓
Repository
    ↓
Drizzle ORM
    ↓
PostgreSQL
```

Not every trivial operation must artificially create unnecessary layers,
but business logic should not be scattered randomly across route
handlers.

------------------------------------------------------------------------

# 35. Route Handler Responsibility

Route handlers should primarily handle transport concerns:

-   HTTP method,
-   request parsing,
-   authentication context,
-   validation invocation,
-   calling the appropriate use case,
-   mapping result/errors to HTTP responses.

Avoid putting complex business rules directly into route handlers.

Bad direction:

``` text
Route Handler
 ├── validation
 ├── schedule version calculation
 ├── ownership rules
 ├── state transitions
 ├── analytics
 └── database queries
```

Preferred:

``` text
Route
 ↓
Use Case
 ↓
Domain/business logic
 ↓
Repository
```

------------------------------------------------------------------------

# 36. Validation

Zod is used for input validation.

Validation answers:

> "Is the input structurally valid?"

Business logic answers:

> "Is this operation allowed?"

These are different.

Example:

``` text
Zod:
title is a string

Business rule:
archived Goal cannot receive a new active Schedule
```

Do not put all business rules into Zod schemas.

------------------------------------------------------------------------

# 37. Repository Responsibility

Repositories should isolate persistence concerns.

A repository can handle operations such as:

-   find Goal,
-   create Goal,
-   update Goal,
-   find Activity,
-   create Execution,
-   find active Schedule Version.

Repositories should not become a dumping ground for unrelated business
decisions.

The use case/domain layer decides **what should happen**. The repository
decides **how persistence happens**.

------------------------------------------------------------------------

# 38. Use Case Responsibility

Use Cases represent meaningful application actions.

Examples:

``` text
CreateGoal
ArchiveGoal
CreateActivity
ChangeActivitySchedule
RecordExecution
CloseDay
GenerateWeeklyReport
```

Use cases should orchestrate business rules and persistence.

The exact final use-case list should grow from real product behavior
rather than being created all at once.

------------------------------------------------------------------------

# 39. Execution Recording

Recording an Execution is a business operation, not simply:

``` sql
INSERT INTO executions ...
```

The operation should consider:

-   authenticated user ownership,
-   Activity ownership,
-   whether the Activity is valid for the date,
-   applicable Schedule Version,
-   whether the day/date is valid,
-   whether an Execution already exists,
-   allowed state transitions,
-   note/reason rules.

The exact constraints should be finalized when this use case is
implemented.

------------------------------------------------------------------------

# 40. Historical Integrity

Historical execution records are extremely valuable.

Once a user has recorded what happened on a date, later plan changes
must not rewrite the meaning of that historical record.

Example:

``` text
Week 1:
Activity scheduled Mon/Wed/Fri

Week 2:
User changes to Tue/Thu
```

Week 1 reports must continue to use the Week 1 schedule definition.

------------------------------------------------------------------------

# 41. Product Core Loop

The product's core loop is:

``` text
1. Define Goal
       ↓
2. Define Activities
       ↓
3. Define Schedule
       ↓
4. System presents expected daily Activities
       ↓
5. User records actual result
       ↓
6. User optionally explains partial/non-completion
       ↓
7. System preserves history
       ↓
8. Weekly report aggregates the data
       ↓
9. User understands patterns
       ↓
10. User adjusts the plan
       ↓
11. New Schedule Version
       ↓
12. Repeat
```

This loop is the heart of the product.

------------------------------------------------------------------------

# 42. What the AI Must NOT Do

When modifying the codebase, the AI must NOT silently:

-   turn the product into a generic Todo app,
-   require numeric goals,
-   add gamification,
-   treat app inactivity as confirmed failure,
-   overwrite historical schedules,
-   delete historical data by default,
-   treat missing Execution as NOT_COMPLETED,
-   use browser timezone as a permanent source of truth after stored
    timezone exists,
-   convert local calendar dates into UTC timestamps without a domain
    reason,
-   add AI coaching to MVP,
-   invent new domain states,
-   invent new business entities merely to make the architecture look
    sophisticated,
-   introduce complex abstractions before a real use case requires them.

------------------------------------------------------------------------

# 43. AI Decision Rules

When asked to implement a feature:

## Rule 1

First identify which domain concepts it affects:

``` text
User
Goal
Activity
Schedule
Execution
Report
```

## Rule 2

Check historical impact.

Ask internally:

> Does this change alter the interpretation of past data?

If yes, schedule versioning/historical integrity must be considered.

## Rule 3

Separate planned vs actual.

Never use an actual Execution as a replacement for the Schedule.

Never use Schedule alone as proof of actual behavior.

## Rule 4

Separate missing data vs failure.

No record is not automatically NOT_COMPLETED.

## Rule 5

Prefer explicit business operations.

For important state changes, use a meaningful use case instead of
arbitrary CRUD mutation.

## Rule 6

Do not over-engineer MVP.

Prefer the smallest implementation that preserves the domain rules.

## Rule 7

If a requirement conflicts with this document, flag the conflict instead
of silently choosing one interpretation.

------------------------------------------------------------------------

# 44. Analytics Data Principles

Analytics should be computed from normalized source data whenever
practical.

Do not store derived metrics such as:

``` text
completionPercentage
weeklyScore
consistencyScore
```

as primary truth unless there is a demonstrated performance requirement.

The underlying facts are:

``` text
Schedule
Execution
Execution.status
Execution.note/reason
dates
```

Reports can derive metrics from them.

This reduces the risk of stale analytics.

------------------------------------------------------------------------

# 45. AI / Agent Future Direction

An AI agent may eventually analyze the user's history and provide
guidance.

That is a future layer.

The underlying domain should therefore preserve enough structured data
for later analysis.

Useful future data includes:

-   schedule changes,
-   execution outcomes,
-   dates,
-   partial/non-completion notes,
-   archive events,
-   activity history,
-   goal history.

However, do not build the AI agent into the MVP domain model
prematurely.

The domain must work correctly without an AI agent.

------------------------------------------------------------------------

# 46. Current MVP Success Criterion

The MVP is successful if a user can:

1.  Create a Goal.
2.  Define Activities under the Goal.
3.  Define when Activities should occur.
4.  See the relevant planned Activities for a day.
5.  Record what actually happened.
6.  Mark partial completion.
7.  Mark non-completion.
8.  Optionally explain partial/non-completion.
9.  Preserve historical records.
10. Change a plan without corrupting history.
11. Review a clear weekly summary.
12. Understand their own behavior without manually calculating
    everything.

Anything beyond this should be evaluated against whether it improves the
core loop.

------------------------------------------------------------------------

# 47. Open Decisions

The following must NOT be treated as finalized business rules until
explicitly decided:

-   Exact authentication mechanism.
-   Exact final Goal status enum.
-   Exact final Activity status enum.
-   Exact final Schedule Version transition enum.
-   Whether a separate Day/DayClosing entity is required.
-   Exact Pause semantics and whether pauses are implemented in MVP.
-   Exact Execution editing rules after a day is closed.
-   Whether future executions may be edited freely.
-   Exact weekly report denominator definitions for every metric.
-   Exact monthly report behavior.
-   Exact reminder/notification mechanism.
-   Exact handling of schedule gaps.
-   Exact behavior when a Goal is archived while future schedule
    versions exist.
-   Exact behavior when an Activity is archived while historical/future
    schedule data exists.
-   Permanent account/data deletion policy.
-   Authentication/session architecture.
-   Whether execution notes are one free-text field or structured
    reason + note.
-   Whether partial completion eventually supports numeric
    amount/duration.
-   Whether users can manually change timezone in a later release.

When implementing any of these, stop and treat the choice as a product
decision rather than inventing a rule.

------------------------------------------------------------------------

# 48. Implementation Priorities

Implement in this order unless a deliberate product decision changes the
roadmap:

``` text
1. User
2. Goal
3. Activity
4. Schedule / Schedule Version
5. Daily expected-activity calculation
6. Execution recording
7. Partial / non-completion notes
8. Archive behavior
9. Weekly report
10. Historical views
11. Improvements / advanced analysis
12. AI guidance
```

The first objective is a reliable data loop, not feature quantity.

------------------------------------------------------------------------

# 49. Canonical Terminology

Use these terms consistently in code, API names, database names, and
documentation:

  Concept            Meaning
  ------------------ ----------------------------------------------------
  User               Owner of personal data
  Goal               Direction/path the user wants to pursue
  Activity           Concrete behavior contributing to a Goal
  Schedule           Plan describing when an Activity is expected
  Schedule Version   Historical version of a Schedule
  Execution          Actual recorded outcome for an Activity on a date
  Completed          Activity was completed
  Partial            Activity was only partially completed
  Not Completed      User explicitly recorded that it was not completed
  Archived           No longer active, but retained for history

Avoid unnecessary synonyms.

------------------------------------------------------------------------

# 50. Final Architectural Mental Model

The system should be understood as:

``` text
                    USER
                      │
                      ▼
                    GOAL
                      │
                      ▼
                  ACTIVITY
                      │
             ┌────────┴────────┐
             ▼                 ▼
          SCHEDULE          EXECUTION
             │                 │
             │                 │
       "What should          "What
        happen?"              happened?"
             │                 │
             └────────┬────────┘
                      ▼
                  ANALYSIS
                      │
                      ▼
                 USER INSIGHT
                      │
                      ▼
              PLAN ADJUSTMENT
                      │
                      ▼
              NEW SCHEDULE VERSION
```

The key conceptual separation is:

> **Schedule is the plan. Execution is the evidence. Analysis interprets
> the evidence in the context of the plan.**

That separation should remain intact throughout the system.

------------------------------------------------------------------------

# 51. Instruction to AI Coding Agents

Before changing domain code, the AI should:

1.  Read this document.
2.  Identify the affected domain concepts.
3.  Identify the relevant business rules.
4.  Check historical-data implications.
5.  Check ownership/security implications.
6.  Check timezone/date implications.
7.  Check whether the requested behavior is an existing rule or an Open
    Decision.
8.  Implement the smallest coherent change.
9.  Do not silently introduce new business semantics.
10. Explain any newly required product decision before encoding it as a
    permanent rule.

**The AI is an implementation assistant, not the product owner.**

When a business rule is ambiguous, preserve data integrity and surface
the ambiguity rather than guessing.
