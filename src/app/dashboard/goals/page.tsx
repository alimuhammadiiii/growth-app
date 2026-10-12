import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus, Target } from "lucide-react";

import { GoalsList } from "@/features/goals/components/goals-list";
import { getGoalsList } from "@/features/goals/queries";
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

export const metadata: Metadata = {
  title: "Goals · Growth App",
};

export default async function GoalsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const goals = await getGoalsList(session.user.id);

  if (goals.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Empty className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-2xl border bg-card shadow-sm duration-300 ease-out motion-reduce:animate-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target />
            </EmptyMedia>
            <EmptyTitle>No goals yet</EmptyTitle>
            <EmptyDescription>
              Goals are the directions you want to pursue. Create your first
              one to start planning activities.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button disabled>
              <Plus />
              Create a goal
            </Button>
            <p className="text-xs text-muted-foreground">
              Goal creation is coming soon.
            </p>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return <GoalsList goals={goals} />;
}
