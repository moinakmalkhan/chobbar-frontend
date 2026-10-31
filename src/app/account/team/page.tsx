"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MoreHorizontal, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input, Label } from "@/components/ui/input";
import { Avatar } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import type { CompanyMember, Role } from "@/types/api";

const ROLES: { value: Role; label: string; text: string }[] = [
  { value: "owner", label: "Owner", text: "Full control, including other owners" },
  { value: "admin", label: "Admin", text: "Manage team, approve orders, edit company" },
  { value: "buyer", label: "Buyer", text: "Place orders and request quotes" },
  { value: "viewer", label: "Viewer", text: "View orders and quotes only" },
];

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { user, role, company, canManage } = useAuth();
  const members = useQuery({ queryKey: queryKeys.members, queryFn: () => accountsService.members(1) });
  const invitations = useQuery({ queryKey: queryKeys.invitations, queryFn: () => accountsService.invitations(1), enabled: canManage });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [limitFor, setLimitFor] = useState<CompanyMember | null>(null);
  const refresh = () => { queryClient.invalidateQueries({ queryKey: queryKeys.members }); queryClient.invalidateQueries({ queryKey: queryKeys.invitations }); };

  const updateRole = useMutation({ mutationFn: ({ id, role }: { id: number; role: Role }) => accountsService.updateMember(id, { role }), onSuccess: () => { refresh(); notify.success("Role updated"); }, onError: (e) => notify.error(e, "Couldn't change role") });
  const remove = useMutation({ mutationFn: (id: number) => accountsService.removeMember(id), onSuccess: () => { refresh(); notify.success("Member removed"); }, onError: (e) => notify.error(e, "Couldn't remove member") });
  const revoke = useMutation({ mutationFn: (id: string) => accountsService.revokeInvitation(id), onSuccess: () => { refresh(); notify.info("Invitation revoked"); }, onError: (e) => notify.error(e) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Team</p><h1 className="font-display text-3xl font-bold">People at {company?.name}</h1><p className="text-sm text-muted-foreground">Roles control who can order, approve and manage. Spend limits route big orders to admins.</p></div>{canManage ? <Button onClick={() => setInviteOpen(true)}><UserPlus /> Invite teammate</Button> : null}</div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-4 text-brand-500" /> Members</CardTitle></CardHeader>
        <CardContent className="p-0">
          {members.isLoading ? <div className="space-y-2 p-4">{[0, 1].map((i) => <Skeleton key={i} className="h-14" />)}</div> : (
            <ul className="divide-y divide-border">
              {members.data?.results.map((m) => {
                const me = m.user.id === user?.id;
                return (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <Avatar src={m.user.avatar_url} name={m.full_name} />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.full_name}{me ? <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span> : null}</p><p className="truncate text-xs text-muted-foreground">{m.email}{m.user.job_title ? ` · ${m.user.job_title}` : ""} · joined {formatDate(m.created_at)}</p></div>
                    <div className="flex items-center gap-2">
                      {Number(m.order_limit) > 0 ? <Badge variant="outline">Limit {formatMoney(m.order_limit, company?.currency)}</Badge> : null}
                      {!m.is_active ? <Badge variant="danger">Inactive</Badge> : null}
                      {canManage && !me && m.role !== "owner" ? (
                        <Select value={m.role} onValueChange={(v) => updateRole.mutate({ id: m.id, role: v as Role })}><SelectTrigger className="h-9 w-32 capitalize"><SelectValue /></SelectTrigger><SelectContent>{ROLES.filter((r) => r.value !== "owner" || role === "owner").map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select>
                      ) : <Badge variant="soft" className="capitalize">{m.role}</Badge>}
                      {canManage && !me && m.role !== "owner" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="More"><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Member</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setLimitFor(m)}>Set spend limit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onClick={() => remove.mutate(m.id)}><Trash2 /> Remove from company</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="size-4 text-brand-500" /> Invitations</CardTitle><CardDescription>Invites expire after 7 days.</CardDescription></CardHeader>
          <CardContent className="p-0">
            {invitations.isLoading ? <Skeleton className="m-4 h-12" /> : !invitations.data?.results.length ? <p className="px-5 py-6 text-sm text-muted-foreground">No pending invitations.</p> : (
              <ul className="divide-y divide-border">
                {invitations.data.results.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm"><span className="min-w-0 flex-1"><span className="font-medium">{inv.email}</span><span className="block text-xs text-muted-foreground">as {inv.role} · invited by {inv.invited_by || "—"} · expires {formatDate(inv.expires_at)}</span></span><StatusBadge status={inv.status} />{inv.status === "pending" ? <Button variant="ghost" size="sm" onClick={() => revoke.mutate(inv.id)}>Revoke</Button> : null}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ROLES.map((r) => <div key={r.value} className="rounded-xl border border-border bg-surface p-3 text-xs"><p className="font-semibold">{r.label}</p><p className="text-muted-foreground">{r.text}</p></div>)}</div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} ownerCanInviteOwner={role === "owner"} onDone={refresh} />
      <LimitDialog member={limitFor} onOpenChange={(o) => !o && setLimitFor(null)} currency={company?.currency ?? "USD"} onDone={refresh} />
    </div>
  );
}

function InviteDialog({ open, onOpenChange, ownerCanInviteOwner, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; ownerCanInviteOwner: boolean; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const invite = useMutation({ mutationFn: () => accountsService.invite(email.trim(), role), onSuccess: (inv) => { notify.success(`Invitation sent to ${inv.email}`); onOpenChange(false); setEmail(""); onDone(); }, onError: (e) => notify.error(e, "Couldn't send invitation") });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite a teammate</DialogTitle><DialogDescription>They'll get an email link to join your company with the role you pick.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}>
          <div><Label htmlFor="inv-email">Work email</Label><Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
          <div><Label>Role</Label><Select value={role} onValueChange={(v) => setRole(v as Role)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.filter((r) => r.value !== "owner" || ownerCanInviteOwner).map((r) => <SelectItem key={r.value} value={r.value}>{r.label} — {r.text}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={invite.isPending} disabled={!email.trim()}>Send invite</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LimitDialog({ member, onOpenChange, currency, onDone }: { member: CompanyMember | null; onOpenChange: (o: boolean) => void; currency: string; onDone: () => void }) {
  const [limit, setLimit] = useState("");
  const save = useMutation({ mutationFn: () => accountsService.updateMember(member!.id, { order_limit: Number(limit || 0) }), onSuccess: () => { notify.success("Spend limit updated"); onOpenChange(false); onDone(); }, onError: (e) => notify.error(e) });
  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Spend limit for {member?.full_name}</DialogTitle><DialogDescription>Orders above this subtotal need approval from an owner or admin. Set 0 to fall back to the company threshold.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div><Label htmlFor="limit">Limit per order ({currency})</Label><Input id="limit" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={member ? String(member.order_limit) : "0"} /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={save.isPending}>Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
