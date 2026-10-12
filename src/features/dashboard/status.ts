import type { OutcomeStatus } from "./types";

/** Canonical terminology — keep labels aligned with the domain vocabulary. */
export const STATUS_LABEL: Record<OutcomeStatus, string> = {
  COMPLETED: "Completed",
  PARTIAL: "Partial",
  NOT_COMPLETED: "Not completed",
  UNRECORDED: "Unrecorded",
};

export const STATUS_CHART_COLOR: Record<OutcomeStatus, string> = {
  COMPLETED: "oklch(0.696 0.17 162.48)",
  PARTIAL: "oklch(0.769 0.188 70.08)",
  NOT_COMPLETED: "oklch(0.645 0.246 16.44)",
  UNRECORDED: "var(--muted-foreground)",
};

export const STATUS_BADGE_CLASS: Record<OutcomeStatus, string> = {
  COMPLETED:
    "border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  PARTIAL:
    "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  NOT_COMPLETED:
    "border-transparent bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  UNRECORDED: "border-transparent bg-muted text-muted-foreground",
};

export const STATUS_ICON_CLASS: Record<OutcomeStatus, string> = {
  COMPLETED: "text-emerald-600 dark:text-emerald-400",
  PARTIAL: "text-amber-600 dark:text-amber-400",
  NOT_COMPLETED: "text-rose-600 dark:text-rose-400",
  UNRECORDED: "text-muted-foreground/60",
};

/** Half-filled dot for the first-class PARTIAL state. */
export const PARTIAL_DOT_COLOR = "oklch(0.769 0.188 70.08)";
