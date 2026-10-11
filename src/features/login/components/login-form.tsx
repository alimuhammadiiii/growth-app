"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

import { loginSchema, type LoginValues } from "../schema";
import { submitSignin } from "../submit-signin";

const messageAnimation =
  "animate-in fade-in-0 duration-150 motion-reduce:animate-none";

export function LoginForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    } as LoginValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setAuthError(null);

      const result = await submitSignin(value, {
        signInEmail: (input) => authClient.signIn.email(input),
        signInUsername: (input) => authClient.signIn.username(input),
      });

      if (!result.ok) {
        setAuthError(result.message);
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
        <Alert variant="destructive" className={messageAnimation}>
          <CircleAlert />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      ) : null}

      <form.Field name="identifier">
        {(field) => {
          const error = field.state.meta.errors[0]?.message;

          return (
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={field.name}>Email or username</FieldLabel>
              <Input
                id={field.name}
                placeholder="you@example.com"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {error ? (
                <FieldError
                  id={`${field.name}-error`}
                  className={messageAnimation}
                >
                  {error}
                </FieldError>
              ) : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const error = field.state.meta.errors[0]?.message;

          return (
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${field.name}-error` : undefined}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-pressed={passwordVisible}
                    aria-label={
                      passwordVisible ? "Hide password" : "Show password"
                    }
                    onClick={() => setPasswordVisible((v) => !v)}
                  >
                    {passwordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {error ? (
                <FieldError
                  id={`${field.name}-error`}
                  className={messageAnimation}
                >
                  {error}
                </FieldError>
              ) : null}
            </Field>
          );
        }}
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
