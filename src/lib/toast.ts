"use client";

import { toast } from "sonner";

import { getErrorCopy, toApiError } from "@/lib/api";

/**
 * One place for every toast so copy and behaviour stay consistent.
 * Success toasts are short; errors stay a little longer and are de-duplicated by id.
 */
export const notify = {
  success: (title: string, description?: string) => toast.success(title, { description, duration: 3500 }),
  info: (title: string, description?: string) => toast.info(title, { description, duration: 4000 }),
  warning: (title: string, description?: string) => toast.warning(title, { description, duration: 5000 }),
  error: (error: unknown, fallbackTitle?: string) => {
    const err = toApiError(error);
    const copy = getErrorCopy();
    const title = err.code === "validation_error" ? copy.checkForm : (fallbackTitle ?? err.detail);
    return toast.error(title, {
      description: title === err.detail ? undefined : err.detail,
      duration: 6000,
      id: `err:${err.code}:${err.detail.slice(0, 40)}`,
    });
  },
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string | ((v: T) => string); error?: string },
  ) =>
    toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: (e: unknown) => msgs.error ?? toApiError(e).detail,
    }),
  action: (title: string, description: string, action: { label: string; onClick: () => void }) =>
    toast(title, {
      description: description || undefined,
      action: { label: action.label, onClick: action.onClick },
      duration: 6000,
    }),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
