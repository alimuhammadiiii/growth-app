import { Archive, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoalListItem, GoalStatus } from "../types";

function StatusBadge({ status }: { status: GoalStatus }) {
  if (status === "ARCHIVED") {
    return (
      <Badge className="gap-1 border-transparent bg-muted font-medium text-muted-foreground">
        <Archive className="size-3" />
        Archived
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-primary/10 font-medium text-primary">
      Active
    </Badge>
  );
}

function GoalCard({ goal, index }: { goal: GoalListItem; index: number }) {
  const archived = goal.status === "ARCHIVED";

  return (
    <Card
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-2 rounded-2xl duration-300 ease-out motion-reduce:animate-none",
        archived && "opacity-75",
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg",
                archived ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
              )}
            >
              <Target className="size-4" />
            </span>
            <span className="truncate">{goal.title}</span>
          </span>
          <StatusBadge status={goal.status} />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Created {goal.createdAtLabel}
        </p>
      </CardHeader>
      <CardContent className="gap-2.5">
        {goal.activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities yet.</p>
        ) : (
          goal.activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between gap-2"
            >
              <p
                className={cn(
                  "min-w-0 truncate text-sm",
                  activity.status === "ARCHIVED"
                    ? "text-muted-foreground line-through decoration-muted-foreground/40"
                    : "font-medium",
                )}
              >
                {activity.title}
              </p>
              {activity.status === "ARCHIVED" ? (
                <Badge className="shrink-0 border-transparent bg-muted text-[11px] font-medium text-muted-foreground">
                  Archived
                </Badge>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function GoalsList({ goals }: { goals: GoalListItem[] }) {
  const activeCount = goals.filter((goal) => goal.status === "ACTIVE").length;
  const archivedCount = goals.length - activeCount;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-12 md:gap-8 md:p-8">
      <header className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Goals
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {activeCount} active
          {archivedCount > 0 ? ` · ${archivedCount} archived` : ""}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal, index) => (
          <GoalCard key={goal.id} goal={goal} index={index} />
        ))}
      </div>
    </div>
  );
}
