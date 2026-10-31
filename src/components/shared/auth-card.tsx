import Link from "next/link";

import { LogoMark } from "@/components/layout/logo";

export function AuthCard({ title, description, children, footer }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container-x flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-ink-900/5 lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-brand-500/20 blur-3xl" />
          <Link href="/" className="relative flex items-center gap-2.5 font-display text-xl font-extrabold">
            <LogoMark className="size-8" /> LEEPA<span className="text-brand-400">SPORTS</span>
          </Link>
          <div className="relative">
            <h2 className="font-display text-3xl font-bold leading-tight">Wholesale pricing, live. Quotes in a day. Every order tracked.</h2>
            <ul className="mt-6 space-y-3 text-sm text-ink-300">
              {["Instant prices for any fabric × size × gender mix", "Company accounts with roles, approvals and net terms", "Reorder past kits in one click", "Chat with the production team"].map((t) => (
                <li key={t} className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-400" />{t}</li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-ink-400">Trusted by clubs, schools and brands in 30+ countries.</p>
        </aside>
        <div className="p-6 sm:p-10">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {children}
          {footer ? <div className="mt-7 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
