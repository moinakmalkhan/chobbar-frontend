import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <h1 className="font-display text-3xl font-bold">Terms of sale</h1>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Wholesale only.</strong> Prices are ex-works Sialkot in the selling currency shown, exclusive of freight, duties and taxes unless stated. Minimum order quantities apply per product.</p>
        <p><strong className="text-foreground">Quotes</strong> are valid until the date shown and convert to orders when accepted. <strong className="text-foreground">Orders</strong> placed with bank transfer enter production once payment (or the agreed deposit) is confirmed. Net-terms invoices are due on the date shown on the order.</p>
        <p><strong className="text-foreground">Artwork approval.</strong> Lead times start after artwork and size confirmation. Orders can be cancelled online until production starts; afterwards please contact us.</p>
        <p><strong className="text-foreground">Quality.</strong> Made-to-order garments are produced to the confirmed specification. Report defects within 14 days of delivery with photos and we will repair, replace or credit.</p>
      </div>
    </div>
  );
}
