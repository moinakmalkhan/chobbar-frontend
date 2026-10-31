"use client";

import { useEffect, useRef, useState } from "react";

import { env } from "@/lib/env";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/** Google Identity Services button → returns an ID token for /auth/login/google/. */
export function GoogleButton({ onCredential, text = "continue_with" }: { onCredential: (idToken: string) => void; text?: "continue_with" | "signin_with" | "signup_with" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!env.googleClientId) return;
    const render = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({ client_id: env.googleClientId, callback: (r) => onCredential(r.credential) });
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", width: ref.current.clientWidth || 360, text, shape: "pill", logo_alignment: "center" });
      setReady(true);
    };
    if (window.google) return render();
    const existing = document.getElementById("gsi-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", render, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [onCredential, text]);

  if (!env.googleClientId) {
    return (
      <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-muted-foreground opacity-70" title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable">
        <GoogleG /> Google sign-in not configured
      </button>
    );
  }
  return (
    <div className="relative min-h-11">
      {!ready ? <div className="absolute inset-0 animate-pulse rounded-full bg-muted" /> : null}
      <div ref={ref} className="flex justify-center" />
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.3 6.6 2.3 12s4.3 9.8 9.7 9.8c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
