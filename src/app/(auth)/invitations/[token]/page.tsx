"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, hydrated, setSession } = useAuth();
  const router = useRouter();
  const invitation = useQuery({ queryKey: ["invitation", token], queryFn: () => accountsService.invitation(token), enabled: hydrated && isAuthenticated, retry: false });
  const accept = useMutation({
    mutationFn: () => accountsService.acceptInvitation(token),
    onSuccess: (data) => { setSession(data); notify.success(`Welcome to ${invitation.data?.company}`, "You can now order on behalf of the company."); router.push("/account"); },
    onError: (e) => notify.error(e, "Couldn't accept invitation"),
  });
  const next = `/invitations/${token}`;
  return (
    <AuthCard title="Team invitation">
      {!hydrated ? <Skeleton className="h-24" /> : !isAuthenticated ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Sign in or create an account with the invited email address to join the company.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline"><Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></Button>
            <Button asChild><Link href={`/register?next=${encodeURIComponent(next)}`}>Create account</Link></Button>
          </div>
        </div>
      ) : invitation.isLoading ? <Skeleton className="h-24" /> : invitation.isError ? (
        <p className="text-sm text-red-600">{toApiError(invitation.error).detail}</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><Building2 className="size-5" /></div>
            <div><p className="font-semibold">{invitation.data!.company}</p><p className="text-xs text-muted-foreground">{invitation.data!.invited_by} invited you as <span className="capitalize">{invitation.data!.role}</span></p></div>
          </div>
          <Button className="w-full" size="lg" onClick={() => accept.mutate()} loading={accept.isPending}>Accept invitation</Button>
        </div>
      )}
    </AuthCard>
  );
}
