import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
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
      <AuthCard
        title="Sign in"
        subtitle="Welcome back. Pick up where you left off."
        footer={
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
