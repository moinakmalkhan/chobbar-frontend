import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <h1 className="font-display text-3xl font-bold">Privacy policy</h1>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <p>We collect the information needed to run wholesale accounts: contact details, company information, shipping addresses, order history and messages you send us. We use it to price, produce and deliver your orders, to send transactional emails and notifications you can control in settings, and to improve the catalog (for example, search logs are aggregated to surface popular products).</p>
        <p>Google sign-in shares your name, email and profile picture with us; we never receive your Google password. Payment proofs you upload are stored securely and only visible to your company and our finance team.</p>
        <p>We do not sell personal data. Service providers (hosting, email delivery) process data on our behalf under contract. You can request export or deletion of your account data at any time via sales@leepasports.com.</p>
      </div>
    </div>
  );
}
