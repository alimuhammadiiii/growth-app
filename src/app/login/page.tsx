import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/login/components/login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in — Growth App",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 font-sans">
      <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-tight text-muted-foreground">
            Growth
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl leading-tight font-semibold tracking-tight">
              Sign in
            </CardTitle>
            <CardDescription>
              Welcome back. Pick up where you left off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
