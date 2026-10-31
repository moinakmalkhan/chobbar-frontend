import { LogoMark } from "@/components/layout/logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-x flex min-h-[calc(100dvh-12rem)] items-center justify-center py-10">
      <div className="animate-rise w-full max-w-md">
        <div className="border-border bg-card rounded-3xl border p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="mb-6 text-center">
            <LogoMark className="mx-auto mb-4 h-12" />
            <h1 className="font-display text-2xl font-extrabold">{title}</h1>
            {subtitle ? <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{subtitle}</p> : null}
          </div>
          {children}
        </div>
        {footer ? <div className="text-muted-foreground mt-6 text-center text-sm">{footer}</div> : null}
      </div>
    </div>
  );
}
