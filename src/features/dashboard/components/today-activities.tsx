import { CalendarDays, CircleCheck, CircleDashed, CircleX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  PARTIAL_DOT_COLOR,
  STATUS_BADGE_CLASS,
  STATUS_ICON_CLASS,
  STATUS_LABEL,
} from "../status";
import type { OutcomeStatus, TodayActivityItem } from "../types";

function StatusGlyph({ status }: { status: OutcomeStatus }) {
  if (status === "COMPLETED") {
    return <CircleCheck className={cn("size-5 shrink-0", STATUS_ICON_CLASS[status])} />;
  }
  if (status === "NOT_COMPLETED") {
    return <CircleX className={cn("size-5 shrink-0", STATUS_ICON_CLASS[status])} />;
  }
  if (status === "UNRECORDED") {
    return <CircleDashed className={cn("size-5 shrink-0", STATUS_ICON_CLASS[status])} />;
  }

  return (
    <span
      aria-hidden
      className="size-5 shrink-0 rounded-full border-2"
      style={{
        borderColor: PARTIAL_DOT_COLOR,
        background: `linear-gradient(90deg, ${PARTIAL_DOT_COLOR} 50%, transparent 50%)`,
      }}
    />
  );
}

function TodayRow({ item }: { item: TodayActivityItem }) {
  const subtitle = [item.goalTitle, item.expectedDurationMinutes ? `${item.expectedDurationMinutes} min` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-accent/50">
      <StatusGlyph status={item.status} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.activityTitle}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        {item.note ? (
          <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
            &ldquo;{item.note}&rdquo;
          </p>
        ) : null}
      </div>
      <Badge className={cn("shrink-0 font-medium", STATUS_BADGE_CLASS[item.status])}>
        {STATUS_LABEL[item.status]}
      </Badge>
    </div>
  );
}

export function TodayActivities({ items }: { items: TodayActivityItem[] }) {
  const recorded = items.filter((item) => item.status !== "UNRECORDED").length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="today-heading" className="text-lg font-semibold tracking-tight">
          Today
        </h2>
        <p className="text-xs text-muted-foreground">
          {items.length} planned · {recorded} recorded
        </p>
      </div>

      <Card className="rounded-2xl p-1.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <CalendarDays className="size-6 text-muted-foreground/60" />
            <p className="text-sm font-medium">Nothing scheduled for today</p>
            <p className="text-xs text-muted-foreground">
              Your plan has no activities expected today.
            </p>
          </div>
        ) : (
          items.map((item) => <TodayRow key={item.activityId} item={item} />)
        )}
      </Card>
    </div>
  );
}
