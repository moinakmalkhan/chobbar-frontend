"use client";

/**
 * Axios instance with JWT handling.
 *
 *  - Access tokens are decoded client-side; if one is within 45 s of expiry we
 *    refresh *before* the request leaves (single-flight – concurrent requests
 *    share one refresh promise).
 *  - A 401 still triggers one refresh + retry (clock skew, revoked tokens…).
 *  - Refresh tokens rotate server-side; the new pair is persisted immediately.
 *  - Language, guest cart token and session key ride along as headers.
 */
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/lib/env";
import { isExpired, isExpiring } from "@/lib/jwt";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import type { ApiError } from "@/types/api";

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

/** Bare client for the refresh call so interceptors never recurse. */
const bare = axios.create({ baseURL: env.apiUrl, timeout: 15_000 });

let refreshPromise: Promise<string | null> | null = null;
let currentLocale = "en";
const errorCopy = {
  timeout: "The request timed out. Please try again.",
  network: "You appear to be offline. Check your connection.",
  throttled: "Too many attempts. Please wait a moment.",
  notFound: "We couldn't find that.",
  generic: "Something went wrong. Please try again.",
  checkForm: "Please check the form",
};
export type ErrorCopy = typeof errorCopy;

/** Called by the I18nProvider so every request asks for content in the page's language. */
export function setApiLocale(locale: string, copy?: Partial<ErrorCopy>) {
  currentLocale = locale;
  if (copy) Object.assign(errorCopy, copy);
}

export function getErrorCopy() {
  return errorCopy;
}
const listeners = new Set<() => void>();

/** Subscribe to forced logouts (e.g. to show a toast or redirect). */
export function onSessionExpired(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function forceLogout() {
  useAuthStore.getState().clear();
  listeners.forEach((fn) => fn());
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const { refresh } = useAuthStore.getState();
  if (!refresh || isExpired(refresh)) {
    forceLogout();
    return null;
  }
  refreshPromise = bare
    .post<{ access: string; refresh?: string }>("/auth/refresh/", { refresh })
    .then(({ data }) => {
      useAuthStore.getState().setTokens(data.access, data.refresh ?? refresh);
      return data.access;
    })
    .catch(() => {
      forceLogout();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const auth = useAuthStore.getState();
  let token = auth.access;
  if (token && isExpiring(token)) {
    token = await refreshAccessToken();
  }
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  config.headers.set("X-Language", currentLocale);
  const cart = useCartStore.getState();
  if (cart.guestToken) config.headers.set("X-Cart-Token", cart.guestToken);
  config.headers.set("X-Session-Key", cart.sessionKey);
  return config;
});

interface RetryConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    if (status === 401 && config && !config._retried && useAuthStore.getState().refresh) {
      config._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${token}` };
        return api.request(config);
      }
    }
    return Promise.reject(error);
  },
);

/** Normalise any thrown value into our API error envelope. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(error)) {
    if (error.response?.data?.detail) return error.response.data;
    if (error.code === "ECONNABORTED") return { detail: errorCopy.timeout, code: "timeout" };
    if (!error.response) return { detail: errorCopy.network, code: "network" };
    if (error.response.status === 429) return { detail: errorCopy.throttled, code: "throttled" };
    if (error.response.status === 404) return { detail: errorCopy.notFound, code: "not_found" };
    return { detail: errorCopy.generic, code: "server_error" };
  }
  if (
    error &&
    typeof error === "object" &&
    "detail" in error &&
    typeof (error as ApiError).detail === "string"
  )
    return error as ApiError;
  if (error instanceof Error) return { detail: error.message, code: "client_error" };
  return { detail: errorCopy.generic, code: "unknown" };
}

export function fieldErrors(error: unknown): Record<string, string> {
  const api = toApiError(error);
  const out: Record<string, string> = {};
  if (api.errors && typeof api.errors === "object") {
    for (const [field, value] of Object.entries(api.errors)) {
      out[field] = Array.isArray(value)
        ? String(value[0])
        : typeof value === "object"
          ? errorCopy.checkForm
          : String(value);
    }
  }
  return out;
}
