import { findAllGoalsWithActivities } from "@/db/repositories/goals";

import type { GoalListItem } from "./types";

function formatCreatedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * All of the user's goals (active and archived) with their activities.
 * Read-only list view: archived entries are retained for history and are
 * simply labeled, not hidden or deleted.
 */
export async function getGoalsList(userId: string): Promise<GoalListItem[]> {
  const rows = await findAllGoalsWithActivities(userId);

  return rows.map(({ goal, activities }) => ({
    id: goal.id,
    title: goal.title,
    status: goal.status,
    createdAtLabel: formatCreatedAt(goal.createdAt),
    activities: activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      status: activity.status,
    })),
  }));
}
