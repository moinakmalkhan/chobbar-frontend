import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

const field =
  "w-full rounded-xl border border-border bg-card px-3.5 text-[15px] text-foreground transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        field,
        "flex h-12 py-2 file:me-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        invalid && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(field, "flex min-h-[104px] py-3", invalid && "border-red-500", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-foreground mb-1.5 block text-sm font-medium", className)} {...props} />;
}

function FieldError({ children, id }: { children?: React.ReactNode; id?: string }) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className="animate-in fade-in slide-in-from-top-2 mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
    >
      {children}
    </p>
  );
}

function Hint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-muted-foreground mt-1.5 text-xs">{children}</p>;
}

export { FieldError, Hint, Input, Label, Textarea };
