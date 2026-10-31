"use client";

import { useEffect, useRef, useState } from "react";

import { useGoogleLogin } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { env } from "@/lib/env";
import { notify } from "@/lib/toast";

interface GoogleId {
  initialize: (o: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
  prompt: () => void;
  cancel: () => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("gsi"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * "Continue with Google" (Gmail) via Google Identity Services. The ID token goes to
 * /auth/login/google/, which verifies it server-side and returns our own JWT pair.
 * With `oneTap`, the One Tap prompt also appears for returning Google users.
 */
export function GoogleButton({ onDone, oneTap = false }: { onDone?: () => void; oneTap?: boolean }) {
  const { t, locale } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const google = useGoogleLogin();
  const [ready, setReady] = useState(false);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  const mutate = useRef(google.mutateAsync);
  useEffect(() => {
    mutate.current = google.mutateAsync;
  });

  useEffect(() => {
    if (!env.googleClientId) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !box.current || !window.google) return;
        const id = window.google.accounts.id;
        id.initialize({
          client_id: env.googleClientId,
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
          itp_support: true,
          callback: async (res: { credential?: string }) => {
            if (!res.credential) return;
            try {
              await mutate.current(res.credential);
              done.current?.();
            } catch (e) {
              notify.error(e);
            }
          },
        });
        id.renderButton(box.current, {
          type: "standard",
          theme: document.documentElement.classList.contains("dark") ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          locale,
          width: Math.min(400, box.current.clientWidth || 360),
        });
        if (oneTap) id.prompt();
        setReady(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [locale, oneTap]);

  if (!env.googleClientId) {
    return (
      <button
        type="button"
        onClick={() => notify.info(t("auth.googleNotConfigured"))}
        className="border-border bg-card hover:bg-muted flex h-12 w-full items-center justify-center gap-3 rounded-full border text-sm font-semibold transition-colors"
      >
        <GoogleG />
        {t("auth.continueGoogle")}
      </button>
    );
  }
  return (
    <div className="relative flex min-h-11 w-full justify-center">
      {!ready ? <div className="shimmer absolute inset-0 rounded-full" aria-hidden /> : null}
      <div
        ref={box}
        className="flex w-full justify-center [&_iframe]:!mx-auto"
        aria-busy={google.isPending}
      />
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
