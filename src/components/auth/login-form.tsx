"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import {
  FormField,
  FormFieldPassword,
  toFieldError,
} from "@/components/auth/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    } as LoginValues,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setAuthError(null);

      const result = value.identifier.includes("@")
        ? await authClient.signIn.email({
            email: value.identifier,
            password: value.password,
          })
        : await authClient.signIn.username({
            username: value.identifier,
            password: value.password,
          });

      if (result.error) {
        setAuthError("Invalid email/username or password.");
        return;
      }

      router.push("/");
      router.refresh();
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {authError ? (
        <Alert
          variant="destructive"
          className="animate-in fade-in-0 duration-150 motion-reduce:animate-none"
        >
          <CircleAlert />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      ) : null}

      <form.Field name="identifier">
        {(field) => (
          <FormField
            id={field.name}
            label="Email or username"
            placeholder="you@example.com"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={toFieldError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <FormFieldPassword
            id={field.name}
            label="Password"
            autoComplete="current-password"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={toFieldError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
