"use client";

import { useState, useSyncExternalStore } from "react";
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

const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Use letters, numbers, dots and underscores only",
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

const emptySubscribe = () => () => {};

let clientTimezone: string | null = null;

function getSnapshot(): string {
  if (clientTimezone === null) {
    clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return clientTimezone;
}

function useDetectedTimezone(): string | null {
  // Server render: null. Client render: the device's IANA timezone.
  return useSyncExternalStore(emptySubscribe, getSnapshot, () => null);
}

function mapSignUpError(code: string | undefined): string {
  switch (code) {
    case "USER_ALREADY_EXISTS":
      return "An account with this email already exists.";
    case "USERNAME_IS_ALREADY_TAKEN":
      return "That username is already taken.";
    default:
      return "Could not create your account. Please try again.";
  }
}

export function SignupForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const timezone = useDetectedTimezone();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    } as SignupValues,
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setAuthError(null);

      const result = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        username: value.username,
        password: value.password,
        timezone: timezone ?? "UTC",
      });

      if (result.error) {
        setAuthError(mapSignUpError(result.error.code));

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

      <form.Field name="name">
        {(field) => (
          <FormField
            id={field.name}
            label="Name"
            autoComplete="name"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={toFieldError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <FormField
            id={field.name}
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={toFieldError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="username">
        {(field) => (
          <FormField
            id={field.name}
            label="Username"
            placeholder="grower"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={toFieldError(field.state.meta.errors)}
            helper="Letters, numbers, dots and underscores"
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <FormFieldPassword
            id={field.name}
            label="Password"
            autoComplete="new-password"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={toFieldError(field.state.meta.errors)}
            helper="At least 8 characters"
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
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        )}
      </form.Subscribe>

      {timezone ? (
        <p className="text-center text-xs leading-normal text-muted-foreground">
          Timezone: {timezone} — detected from your device
        </p>
      ) : null}
    </form>
  );
}

