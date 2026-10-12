import { Clock, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayOfWeek } from "../date-utils";
import type { GoalOverview } from "../types";

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

export function GoalsOverview({ goals }: { goals: GoalOverview[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">Active goals</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="size-4" />
                </span>
                {goal.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              {goal.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activities yet.
                </p>
              ) : (
                goal.activities.map((activity) => (
                  <div key={activity.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-medium">
                        {activity.title}
                      </p>
                      {activity.expectedDurationMinutes ? (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {activity.expectedDurationMinutes} min
                        </span>
                      ) : null}
                    </div>
                    {activity.days.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {activity.days.map((day) => (
                          <Badge
                            key={day}
                            variant="secondary"
                            className="px-1.5 text-[11px] font-medium"
                          >
                            {DAY_SHORT[day]}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No schedule yet
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

