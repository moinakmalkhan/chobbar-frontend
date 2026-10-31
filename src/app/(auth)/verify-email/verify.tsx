"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query-client";
import { toApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

export function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const verify = useMutation({
    mutationFn: () => authService.verifyEmail(token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.me }); notify.success("Email verified", "You can now place orders and request quotes."); },
  });
  const resend = useMutation({ mutationFn: authService.resendVerification, onSuccess: (d) => notify.success(d.detail), onError: (e) => notify.error(e) });
  const { mutate: runVerify } = verify;
  useEffect(() => {
    if (token) runVerify();
  }, [token, runVerify]);

  return (
    <AuthCard title="Email verification">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {!token ? (
          <>
            <p className="text-sm text-muted-foreground">{isAuthenticated && !user?.is_email_verified ? "Your email isn't verified yet. Need a new link?" : "Open the link from your verification email to continue."}</p>
            {isAuthenticated && !user?.is_email_verified ? <Button onClick={() => resend.mutate()} loading={resend.isPending}>Resend verification email</Button> : null}
          </>
        ) : verify.isPending ? (
          <><Loader2 className="size-8 animate-spin text-brand-500" /><p className="text-sm text-muted-foreground">Verifying…</p></>
        ) : verify.isSuccess ? (
          <><CheckCircle2 className="size-10 text-emerald-500" /><p className="font-semibold">You're verified</p><Button asChild><Link href={isAuthenticated ? "/account" : "/login"}>{isAuthenticated ? "Go to dashboard" : "Sign in"}</Link></Button></>
        ) : (
          <><XCircle className="size-10 text-red-500" /><p className="font-semibold">{toApiError(verify.error).detail}</p>{isAuthenticated ? <Button variant="outline" onClick={() => resend.mutate()} loading={resend.isPending}>Send a new link</Button> : <Button asChild variant="outline"><Link href="/login">Sign in to resend</Link></Button>}</>
        )}
      </div>
    </AuthCard>
  );
}
