import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeekCounts } from "../types";

const TILES = [
  {
    key: "completed",
    label: "Completed",
    dot: "bg-emerald-500",
  },
  {
    key: "partial",
    label: "Partial",
    dot: "bg-amber-500",
  },
  {
    key: "notCompleted",
    label: "Not completed",
    dot: "bg-rose-500",
  },
  {
    key: "unrecorded",
    label: "Unrecorded",
    dot: "bg-muted-foreground/40",
  },
] as const;

export function WeekSummary({ week }: { week: WeekCounts }) {
  const recorded = week.completed + week.partial + week.notCompleted;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {week.expected} expected so far · {recorded} recorded
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TILES.map((tile) => (
            <div key={tile.key} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={tile.dot + " size-2 shrink-0 rounded-full"} />
                {tile.label}
              </span>
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {week[tile.key]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Unrecorded means no outcome was logged — it is not counted as missed.
        </p>
      </CardContent>
    </Card>
  );
}
