"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

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

type FieldErrorLike = string | { message?: string } | undefined;

export function toFieldError(errors: unknown[]): string | undefined {
  const first = errors[0] as FieldErrorLike;
  if (first === undefined || first === null || first === "") {
    return undefined;
  }
  return typeof first === "string" ? first : first.message;
}

const errorEntrance =
  "animate-in fade-in-0 duration-150 motion-reduce:animate-none";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  helper?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  id,
  label,
  error,
  helper,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        {...inputProps}
      />
      {helper && !error ? (
        <FieldDescription id={helperId}>{helper}</FieldDescription>
      ) : null}
      {error ? (
        <FieldError id={errorId} className={errorEntrance}>
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}

type FormFieldPasswordProps = Omit<FormFieldProps, "type">;

export function FormFieldPassword({
  id,
  label,
  error,
  helper,
  ...inputProps
}: FormFieldPasswordProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          {...inputProps}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-pressed={visible}
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {helper && !error ? (
        <FieldDescription id={helperId}>{helper}</FieldDescription>
      ) : null}
      {error ? (
        <FieldError id={errorId} className={errorEntrance}>
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}
