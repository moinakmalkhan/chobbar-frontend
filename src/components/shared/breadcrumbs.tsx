import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground scrollbar-none">
      <Link href="/" className="flex items-center hover:text-foreground" aria-label="Home"><Home className="size-3.5" /></Link>
      {items.map((item, i) => (
        <span key={`${item.name}-${i}`} className="flex shrink-0 items-center gap-1">
          <ChevronRight className="size-3.5" />
          {item.href && i < items.length - 1 ? <Link href={item.href} className="hover:text-foreground">{item.name}</Link> : <span className="font-medium text-foreground">{item.name}</span>}
        </span>
      ))}
    </nav>
  );
}
