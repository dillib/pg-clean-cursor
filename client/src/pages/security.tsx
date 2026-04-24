import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { PublicNavV2 } from "@/components/brand/public-nav-v2";
import { PublicFooter } from "@/components/public-footer";
import { Eyebrow } from "@/components/brand/brand";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Security · PhotonicTag</title>
        <meta name="description" content="How PhotonicTag handles tenancy, credentials, and auditability." />
      </Helmet>
      <PublicNavV2 />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <Eyebrow>Trust</Eyebrow>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Security</h1>
        <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
          <li>Tenant-scoped storage for products, connectors, CRM, and sync logs.</li>
          <li>SAP connector secrets encrypted at rest (AES-256-GCM) when a key is configured.</li>
          <li>Append-only audit log chain with integrity verification endpoint for regulators.</li>
          <li>WorkOS-hosted authentication with session stores backed by Postgres or Redis.</li>
        </ul>
        <p className="text-sm">
          <Link href="/dpa" className="underline underline-offset-4 mr-4">
            Data processing agreement
          </Link>
          <Link href="/v2" className="underline underline-offset-4">
            Home
          </Link>
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
