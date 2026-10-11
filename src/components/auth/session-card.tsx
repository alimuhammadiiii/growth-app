"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

type SessionCardProps = {
  name: string;
  email: string;
  username: string | null;
};

export function SessionCard({ name, email, username }: SessionCardProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.refresh();
    setSigningOut(false);
  }

  return (
    <Card className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      <CardHeader>
        <CardTitle className="tracking-tight">{name}</CardTitle>
        <CardDescription>
          {email}
          {username ? ` · @${username}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <>
              <Spinner />
              Signing out…
            </>
          ) : (
            "Sign out"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
