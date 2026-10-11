import { headers } from "next/headers";
import Link from "next/link";

import { SessionCard } from "@/components/auth/session-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-16 font-sans">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Growth App
        </h1>
        <p className="mt-3 max-w-md text-lg leading-8 text-muted-foreground">
          Define goals. Record what actually happened. Understand your
          progress.
        </p>
      </div>

      {session ? (
        <SessionCard
          name={session.user.name}
          email={session.user.email}
          username={session.user.username ?? null}
        />
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            render={<Link href="/signup" />}
          >
            Create account
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>
      )}
    </main>
  );
}
