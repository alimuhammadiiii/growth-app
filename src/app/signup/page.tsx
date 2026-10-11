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
import { SignupForm } from "@/features/signup/components/signup-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account — Growth App",
};

export default async function SignupPage() {
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
              Create your account
            </CardTitle>
            <CardDescription>
              Define goals, build habits, see your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
