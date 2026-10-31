import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/env";

const columns = [
  { title: "Shop", links: [["All products", "/products"], ["Teamwear", "/categories/teamwear"], ["Training", "/categories/training-performance"], ["Tracksuits & outerwear", "/categories/tracksuits-outerwear"], ["Fabric guide", "/fabrics"]] },
  { title: "Buying", links: [["How ordering works", "/how-it-works"], ["Quick order by SKU", "/quick-order"], ["Request a quote", "/cart"], ["Track an order", "/track"], ["Payment & terms", "/how-it-works#payment"]] },
  { title: "Company", links: [["About Leepa Sports", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms of sale", "/terms"]] },
];

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-border bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Family-run sportswear manufacturer in Sialkot, Pakistan. We cut, stitch and print custom teamwear for clubs, schools and brands in 30+ countries.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <a className="hover:text-foreground" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
            <br />
            {SITE.address}
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Prices shown are wholesale, ex-works Sialkot. Freight estimated at checkout.</p>
        </div>
      </div>
    </footer>
  );
}
