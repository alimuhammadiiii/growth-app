import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
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
      <AuthCard
        title="Create your account"
        subtitle="Define goals, build habits, see your progress."
        footer={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <SignupForm />
      </AuthCard>
    </main>
  );
}
