"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarDays, CircleAlert, CircleCheck, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

import { checkGoalTitleAvailability, createGoalAction } from "../actions";
import { fromCalendarString } from "../date-format";
import {
  GOAL_TITLE_TAKEN_MESSAGE,
  TITLE_AVAILABILITY_DEBOUNCE_MS,
} from "../constants";
import {
  createGoalSchema,
  goalTitleSchema,
  type CreateGoalFieldErrors,
  type CreateGoalValues,
} from "../schema";

const messageAnimation =
  "animate-in fade-in-0 duration-150 motion-reduce:animate-none";

type Availability = { value: string; available: boolean };

function toFieldError(errors: unknown[]): string | undefined {
  const first = errors[0] as string | { message?: string } | undefined;
  if (first === undefined || first === null || first === "") {
    return undefined;
  }
  return typeof first === "string" ? first : first.message;
}

type CreateGoalDialogProps = {
  today: string;
  size?: "default" | "lg";
};

export function CreateGoalDialog({
  today,
  size = "default",
}: CreateGoalDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverErrors, setServerErrors] = useState<CreateGoalFieldErrors>({});
  const [titleAvailability, setTitleAvailability] =
    useState<Availability | null>(null);

  const schema = useMemo(() => createGoalSchema(today), [today]);

  const form = useForm({
    defaultValues: {
      title: "",
      startDate: today,
      endDate: null,
    } as CreateGoalValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value, formApi }) => {
      setServerErrors({});

      const result = await createGoalAction(value);

      if (!result.ok) {
        setServerErrors(result.fieldErrors);
        return;
      }

      setOpen(false);
      formApi.reset();
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size={size}
            className="transition-transform duration-100 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          />
        }
      >
        <Plus />
        Create a goal
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="tracking-tight">New goal</DialogTitle>
          <DialogDescription>
            A goal is a direction you want to pursue. Activities and schedules
            come next.
          </DialogDescription>
        </DialogHeader>

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

          <form.Field
            name="title"
            validators={{
              onChange: goalTitleSchema,
              onChangeAsync: async ({ value }) => {
                const available = await checkGoalTitleAvailability(value);
                if (available === null) {
                  return undefined;
                }
                setTitleAvailability({ value, available });
                return available ? undefined : GOAL_TITLE_TAKEN_MESSAGE;
              },
              onChangeAsyncDebounceMs: TITLE_AVAILABILITY_DEBOUNCE_MS,
            }}
          >
            {(field) => {
              const error =
                toFieldError(field.state.meta.errors) ?? serverErrors.title;
              const success =
                !error &&
                titleAvailability?.available &&
                titleAvailability.value === field.state.value
                  ? "Title is available"
                  : undefined;

              return (
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="Learn English"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={
                      error
                        ? `${field.name}-error`
                        : success
                          ? `${field.name}-success`
                          : undefined
                    }
                    value={field.state.value}
                    onChange={(e) => {
                      if (serverErrors.title) {
                        setServerErrors((prev) => ({
                          ...prev,
                          title: undefined,
                        }));
                      }
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {success ? (
                    <FieldDescription
                      id={`${field.name}-success`}
                      className={cn(
                        "flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500",
                        messageAnimation,
                      )}
                    >
                      <CircleCheck className="size-3.5" />
                      {success}
                    </FieldDescription>
                  ) : null}
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
            name="startDate"
            validators={{ onChange: schema.shape.startDate }}
          >
            {(field) => {
              const error =
                toFieldError(field.state.meta.errors) ?? serverErrors.startDate;
              const selected = field.state.value
                ? fromCalendarString(field.state.value)
                : undefined;

              return (
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>Start date</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          id={field.name}
                          variant="outline"
                          className="w-full justify-start font-normal aria-invalid:border-destructive"
                          aria-invalid={error ? true : undefined}
                          aria-describedby={
                            error ? `${field.name}-error` : undefined
                          }
                        />
                      }
                    >
                      <CalendarDays className="text-muted-foreground" />
                      {selected
                        ? format(selected, "MMM d, yyyy")
                        : "Pick a date"}
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selected}
                        onSelect={(date) => {
                          if (date) {
                            field.handleChange(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        disabled={{ before: fromCalendarString(today) }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>
                    Dates follow your timezone setting.
                  </FieldDescription>
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
            name="endDate"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (value == null || value === "") {
                  return undefined;
                }
                const start = fieldApi.form.getFieldValue(
                  "startDate",
                ) as string;
                if (!start) {
                  return undefined;
                }
                return value < start
                  ? "End date must be on or after the start date"
                  : undefined;
              },
            }}
          >
            {(field) => {
              const error =
                toFieldError(field.state.meta.errors) ?? serverErrors.endDate;
              const start =
                (field.form.getFieldValue("startDate") as string) ?? today;
              const selected = field.state.value
                ? fromCalendarString(field.state.value)
                : undefined;

              return (
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>End date</FieldLabel>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            id={field.name}
                            variant="outline"
                            className="w-full justify-start font-normal aria-invalid:border-destructive"
                            aria-invalid={error ? true : undefined}
                            aria-describedby={
                              error ? `${field.name}-error` : undefined
                            }
                          />
                        }
                      >
                        <CalendarDays className="text-muted-foreground" />
                        {selected
                          ? format(selected, "MMM d, yyyy")
                          : "No end date"}
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selected}
                          onSelect={(date) => {
                            if (date) {
                              field.handleChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          disabled={{ before: fromCalendarString(start) }}
                        />
                      </PopoverContent>
                    </Popover>
                    {field.state.value ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Clear end date"
                        className="shrink-0"
                        onClick={() => {
                          if (serverErrors.endDate) {
                            setServerErrors((prev) => ({
                              ...prev,
                              endDate: undefined,
                            }));
                          }
                          field.handleChange(null);
                        }}
                      >
                        <X />
                      </Button>
                    ) : null}
                  </div>
                  <FieldDescription>
                    Optional — leave open for an ongoing goal.
                  </FieldDescription>
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

          <DialogFooter className="mt-2">
            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Creating…
                    </>
                  ) : (
                    "Create goal"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

