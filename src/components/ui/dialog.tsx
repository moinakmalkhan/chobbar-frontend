"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

type Side = "center" | "end" | "start" | "bottom";

const placements: Record<Side, string> = {
  // Sheets use inline-start/end so they slide from the correct edge in RTL.
  end: "inset-y-0 end-0 h-dvh w-full max-w-md rounded-none border-s data-[state=open]:animate-in data-[state=open]:slide-in-from-end data-[state=closed]:animate-out data-[state=closed]:slide-out-to-end sm:rounded-s-3xl",
  start:
    "inset-y-0 start-0 h-dvh w-[88%] max-w-sm rounded-none border-e data-[state=open]:animate-in data-[state=open]:slide-in-from-start data-[state=closed]:animate-out data-[state=closed]:slide-out-to-start sm:rounded-e-3xl",
  bottom:
    "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
  center:
    "left-1/2 top-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
};

function DialogContent({
  className,
  children,
  side = "center",
  hideClose = false,
  closeLabel = "Close",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: Side;
  hideClose?: boolean;
  closeLabel?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="bg-ink-950/45 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out fixed inset-0 z-50 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          "border-border bg-background fixed z-50 flex flex-col gap-4 overflow-y-auto overscroll-contain p-6 shadow-2xl focus:outline-none",
          placements[side],
          className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          <div aria-hidden className="bg-border mx-auto -mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full" />
        ) : null}
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-brand-500 absolute end-4 top-4 rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2">
            <X className="size-4" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 pe-8 text-start", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("font-display text-xl font-bold", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
