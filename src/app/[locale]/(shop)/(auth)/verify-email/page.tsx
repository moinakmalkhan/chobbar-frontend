"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { toApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { authService } from "@/services/auth";

function Verify() {
  const { t } = useI18n();
  const token = useSearchParams().get("token") ?? "";
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; message?: string }>({
    status: token ? "loading" : "error",
  });
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // StrictMode double-invoke guard: tokens are single-use.
    authService
      .verifyEmail(token)
      .then(() => {
        setState({ status: "ok" });
        queryClient.invalidateQueries({ queryKey: queryKeys.me });
      })
      .catch((e) => setState({ status: "error", message: toApiError(e).detail }));
  }, [token, queryClient]);

  return (
    <AuthCard title={t("auth.verifyTitle")}>
      <div className="flex flex-col items-center gap-4 text-center">
        {state.status === "loading" ? (
          <>
            <Loader2 className="text-muted-foreground size-10 animate-spin" />
            <p className="text-sm">{t("auth.verifying")}</p>
          </>
        ) : state.status === "ok" ? (
          <>
            <CheckCircle2 className="animate-in zoom-in-95 size-12 text-emerald-600" />
            <p className="font-semibold">{t("auth.verified")}</p>
            <Button asChild>
              <Link href={isAuthenticated ? "/account" : "/login"}>{t("common.continue")}</Link>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="size-12 text-red-600" />
            <p className="text-muted-foreground text-sm">{state.message ?? t("errors.generic")}</p>
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() =>
                  authService
                    .resendVerification()
                    .then((r) => setState({ status: "error", message: r.detail }))
                }
              >
                {t("auth.resend")}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
