"use client";

import { Building2, ChevronsUpDown, ClipboardList, LogOut, MessageSquare, Package, Settings, UserRound, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/misc";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { user, isAuthenticated, hydrated, company, role, logout, switchCompany, canManage } = useAuth();
  if (!hydrated) return <div className="size-9 rounded-full bg-muted" aria-hidden />;
  if (!isAuthenticated || !user) {
    return (
      <div className="hidden items-center gap-1.5 sm:flex">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Open account</Link>
        </Button>
      </div>
    );
  }
  const otherCompanies = user.memberships.filter((m) => m.company.id !== company?.id);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Account menu">
          <Avatar src={user.avatar_url} name={user.full_name} />
          <span className="hidden text-left md:block">
            <span className="block max-w-[140px] truncate text-xs font-semibold leading-tight">{user.full_name}</span>
            <span className="block max-w-[140px] truncate text-[11px] leading-tight text-muted-foreground">{company?.name ?? "No company"}</span>
          </span>
          <ChevronsUpDown className="hidden size-3.5 text-muted-foreground md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block text-sm font-semibold text-foreground">{user.full_name}</span>
          <span className="block truncate text-xs font-normal">{user.email}</span>
          {company ? <span className="mt-1 inline-block rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{role} · {company.name}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/account"><UserRound /> Dashboard</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/account/orders"><Package /> Orders</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/account/quotes"><ClipboardList /> Quotes</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/account/messages"><MessageSquare /> Messages</Link></DropdownMenuItem>
        {canManage ? <DropdownMenuItem asChild><Link href="/account/team"><Users /> Team</Link></DropdownMenuItem> : null}
        <DropdownMenuItem asChild><Link href="/account/settings"><Settings /> Settings</Link></DropdownMenuItem>
        {otherCompanies.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Switch company</DropdownMenuLabel>
            {otherCompanies.map((m) => (
              <DropdownMenuItem key={m.company.id} onClick={() => switchCompany.mutate(m.company.id)}>
                <Building2 /> {m.company.name}
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={() => logout()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
