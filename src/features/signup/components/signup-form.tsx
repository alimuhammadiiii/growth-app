"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useDetectedTimezone } from "@/hooks/use-detected-timezone";
import { authClient } from "@/lib/auth-client";

import { checkEmailAvailability, checkUsernameAvailability } from "../actions";
import {
  AVAILABILITY_DEBOUNCE_MS,
  EMAIL_TAKEN_MESSAGE,
  USERNAME_TAKEN_MESSAGE,
} from "../constants";
import { submitSignup } from "../submit-signup";
import { signupSchema, type SignupValues } from "../schema";
import type { SignUpFieldErrors } from "../types";

const messageAnimation =
  "animate-in fade-in-0 duration-150 motion-reduce:animate-none h-[20px]";

function toFieldError(errors: readonly unknown[]): string | undefined {
  const first = errors[0];

  if (typeof first === "string") {
    return first;
  }

  if (
    typeof first === "object" &&
    first !== null &&
    "message" in first &&
    typeof first.message === "string"
  ) {
    return first.message;
  }

  return undefined;
}

export function SignupForm() {
  const router = useRouter();
  const timezone = useDetectedTimezone();
  const [serverErrors, setServerErrors] = useState<SignUpFieldErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);

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
      setServerErrors({});

      const result = await submitSignup(value, timezone, {
        signUpEmail: (input) => authClient.signUp.email(input),
      });

      if (!result.ok) {
        setServerErrors(result.fieldErrors);
        return;
      }

      router.push("/");
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {serverErrors.form ? (
        <Alert variant="destructive" className={messageAnimation}>
          <CircleAlert />
          <AlertDescription>{serverErrors.form}</AlertDescription>
        </Alert>
      ) : null}

      <form.Field name="name">
        {(field) => {
          const error = toFieldError(field.state.meta.errors);

          return (
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                id={field.name}
                autoComplete="name"
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

      <form.Field
        name="email"
        validators={{
          onChangeAsync: async ({ value }) => {
            const available = await checkEmailAvailability(value);

            if (available === null) {
              return undefined;
            }

            return available ? undefined : EMAIL_TAKEN_MESSAGE;
          },
          onChangeAsyncDebounceMs: AVAILABILITY_DEBOUNCE_MS,
        }}
      >
        {(field) => {
          const error =
            toFieldError(field.state.meta.errors) ?? serverErrors.email;

          return (
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={error && `${field.name}-error`}
                value={field.state.value}
                onChange={(e) => {
                  if (serverErrors.email) {
                    setServerErrors((prev) => ({ ...prev, email: undefined }));
                  }
                  field.handleChange(e.target.value);
                }}
              />
              <FieldError
                id={`${field.name}-error`}
                className={messageAnimation}
              >
                {error}
              </FieldError>
            </Field>
          );
        }}
      </form.Field>

      <form.Field
        name="username"
        validators={{
          onChangeAsyncDebounceMs: AVAILABILITY_DEBOUNCE_MS,
          onChangeAsync: async ({ value }) => {
            const available = await checkUsernameAvailability(value);

            if (available === null) {
              return undefined;
            }

            return available ? undefined : USERNAME_TAKEN_MESSAGE;
          },
        }}
      >
        {(field) => {
          const error = field.state.meta.isTouched
            ? (toFieldError(field.state.meta.errors) ?? serverErrors.username)
            : undefined;

          return (
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <Input
                id={field.name}
                placeholder="grower"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                value={field.state.value}
                onChange={(e) => {
                  if (serverErrors.username) {
                    setServerErrors((prev) => ({
                      ...prev,
                      username: undefined,
                    }));
                  }
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
              />
              {!error ? (
                <FieldDescription id={`${field.name}-helper`}>
                  {"Letters, numbers, dots and underscores"}
                </FieldDescription>
              ) : (
                <FieldError
                  id={`${field.name}-error`}
                  className={messageAnimation}
                >
                  {error}
                </FieldError>
              )}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const error = toFieldError(field.state.meta.errors);

          return (
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={
                    error ? `${field.name}-error` : `${field.name}-helper`
                  }
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
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
              ) : (
                <FieldDescription id={`${field.name}-helper`}>
                  {"At least 8 characters"}
                </FieldDescription>
              )}
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

