import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus, Sprout } from "lucide-react";

import { GoalsOverview } from "@/features/dashboard/components/goals-overview";
import { TodayActivities } from "@/features/dashboard/components/today-activities";
import { WeekSummary } from "@/features/dashboard/components/week-summary";
import { WeeklyChart } from "@/features/dashboard/components/weekly-chart";
import { localHourInTimezone } from "@/features/dashboard/date-utils";
import { getDashboardData } from "@/features/dashboard/queries/dashboard-data";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { auth } from "@/lib/auth";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const timezone = session.user.timezone;
  const { todayActivities, week, chart, goals } = await getDashboardData(
    session.user.id,
    timezone,
  );

  if (goals.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Empty className="rounded-2xl border bg-card shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sprout />
            </EmptyMedia>
            <EmptyTitle>Welcome to Growth</EmptyTitle>
            <EmptyDescription>
              Create your first goal to start planning, recording, and
              reviewing your progress.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button disabled>
              <Plus />
              Create a goal
            </Button>
            <p className="text-xs text-muted-foreground">Goal creation is coming soon.</p>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const greeting = greetingFor(localHourInTimezone(timezone));
  const firstName = session.user.name.split(/\s+/)[0];
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date());

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-12 md:gap-8 md:p-8">
      <header className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {todayLabel} · {timezone}
        </p>
      </header>

      <section
        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out [animation-delay:60ms] motion-reduce:animate-none"
        aria-labelledby="today-heading"
      >
        <TodayActivities items={todayActivities} />
      </section>

      <section
        className="grid animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out gap-6 [animation-delay:120ms] motion-reduce:animate-none md:gap-8 lg:grid-cols-2"
        aria-labelledby="week-heading"
      >
        <WeekSummary week={week} />
        <WeeklyChart data={chart} />
      </section>

      <section
        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out [animation-delay:180ms] motion-reduce:animate-none"
        aria-labelledby="goals-heading"
      >
        <GoalsOverview goals={goals} />
      </section>
    </div>
  );
}
