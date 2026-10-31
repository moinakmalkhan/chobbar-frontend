"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { useAuth } from "@/hooks/use-auth";
import { fieldErrors } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

const profileSchema = z.object({ first_name: z.string().min(1, "Required"), last_name: z.string().optional(), phone: z.string().optional(), job_title: z.string().optional() });
const passwordSchema = z.object({ current_password: z.string().optional(), new_password: z.string().min(10, "At least 10 characters"), confirm: z.string() }).refine((v) => v.new_password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

const PREFS = [["order_updates", "Order status updates", "Confirmation, production, shipping and delivery emails"], ["quote_updates", "Quote replies", "When sales answers or updates a quote"], ["payment_updates", "Payment confirmations", "Receipts and payment reminders"], ["chat_messages", "Chat messages", "Email me when I'm away and someone replies"], ["marketing", "New products & seasonal offers", "Occasional, never more than monthly"]] as const;

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const profile = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", phone: user?.phone ?? "", job_title: user?.job_title ?? "" } });
  const password = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = useMutation({ mutationFn: (v: z.infer<typeof profileSchema>) => authService.updateMe(v), onSuccess: (u) => { setUser(u); queryClient.setQueryData(queryKeys.me, u); notify.success("Profile saved"); }, onError: (e) => { Object.entries(fieldErrors(e)).forEach(([k, m]) => profile.setError(k as "first_name", { message: m })); notify.error(e); } });
  const savePrefs = useMutation({ mutationFn: (prefs: Record<string, boolean>) => authService.updateMe({ notification_preferences: prefs, marketing_opt_in: Boolean(prefs.marketing) }), onSuccess: (u) => { setUser(u); notify.success("Preferences saved"); }, onError: (e) => notify.error(e) });
  const changePassword = useMutation({ mutationFn: (v: z.infer<typeof passwordSchema>) => authService.changePassword(v.current_password ?? "", v.new_password), onSuccess: (d) => { notify.success(d.detail); password.reset(); }, onError: (e) => { Object.entries(fieldErrors(e)).forEach(([k, m]) => password.setError(k as "current_password", { message: m })); notify.error(e, "Couldn't change password"); } });

  const prefs = { order_updates: true, quote_updates: true, payment_updates: true, chat_messages: true, marketing: user?.marketing_opt_in ?? false, ...(user?.notification_preferences ?? {}) };

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Settings</p><h1 className="font-display text-3xl font-bold">Your profile</h1></div>
      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle><CardDescription>Signed in as {user?.email} via {user?.auth_provider === "google" ? "Google" : "email"}.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={profile.handleSubmit((v) => saveProfile.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div><Label htmlFor="first_name">First name</Label><Input id="first_name" {...profile.register("first_name")} invalid={!!profile.formState.errors.first_name} /><FieldError>{profile.formState.errors.first_name?.message}</FieldError></div>
            <div><Label htmlFor="last_name">Last name</Label><Input id="last_name" {...profile.register("last_name")} /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" {...profile.register("phone")} /></div>
            <div><Label htmlFor="job_title">Job title</Label><Input id="job_title" placeholder="Kit manager, Buyer…" {...profile.register("job_title")} /></div>
            <div className="sm:col-span-2"><Button type="submit" loading={saveProfile.isPending}>Save profile</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email notifications</CardTitle><CardDescription>In-app and realtime notifications are always on; choose which also reach your inbox.</CardDescription></CardHeader>
        <CardContent className="divide-y divide-border">
          {PREFS.map(([key, label, text]) => (
            <div key={key} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{text}</p></div><Switch checked={Boolean(prefs[key])} onCheckedChange={(v) => savePrefs.mutate({ ...prefs, [key]: v })} aria-label={label} /></div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{user?.has_password ? "Change password" : "Set a password"}</CardTitle><CardDescription>{user?.has_password ? "Use at least 10 characters." : "You signed up with Google — add a password to also sign in with email."}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={password.handleSubmit((v) => changePassword.mutate(v))} className="grid gap-4 sm:grid-cols-3" noValidate>
            {user?.has_password ? <div><Label htmlFor="current">Current password</Label><Input id="current" type="password" autoComplete="current-password" {...password.register("current_password")} invalid={!!password.formState.errors.current_password} /><FieldError>{password.formState.errors.current_password?.message}</FieldError></div> : null}
            <div><Label htmlFor="new">New password</Label><Input id="new" type="password" autoComplete="new-password" {...password.register("new_password")} invalid={!!password.formState.errors.new_password} /><FieldError>{password.formState.errors.new_password?.message}</FieldError></div>
            <div><Label htmlFor="confirm">Confirm</Label><Input id="confirm" type="password" autoComplete="new-password" {...password.register("confirm")} invalid={!!password.formState.errors.confirm} /><FieldError>{password.formState.errors.confirm?.message}</FieldError></div>
            <div className="sm:col-span-3"><Button type="submit" variant="secondary" loading={changePassword.isPending}>Update password</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
