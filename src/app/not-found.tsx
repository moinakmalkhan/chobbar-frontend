import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-extrabold text-brand-500">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">That page has been substituted</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The link may be out of date, or the product was retired from the catalog.</p>
      <div className="mt-6 flex gap-2"><Button asChild><Link href="/products">Browse products</Link></Button><Button variant="outline" asChild><Link href="/">Home</Link></Button></div>
    </div>
  );
}
