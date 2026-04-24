import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { PublicNavV2 } from "@/components/brand/public-nav-v2";
import { PublicFooter } from "@/components/public-footer";
import { Eyebrow, Mono } from "@/components/brand/brand";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Developers · PhotonicTag</title>
        <meta name="description" content="Integrate PhotonicTag — REST APIs, webhooks, and SAP connectors." />
      </Helmet>
      <PublicNavV2 />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <Eyebrow>Integrate</Eyebrow>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Developers</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Use the authenticated REST surface behind the product console for imports, passport reads, and connector sync.
          API keys and signed webhooks for outbound events are on the roadmap; tenant-scoped access is already enforced server-side.
        </p>
        <div className="border border-border p-6 space-y-2 text-sm">
          <div>
            <Mono>GET /api/products</Mono>
            <span className="text-muted-foreground"> — list passports for the signed-in tenant</span>
          </div>
          <div>
            <Mono>GET /api/products/:id</Mono>
            <span className="text-muted-foreground"> — producer view (authenticated)</span>
          </div>
          <div>
            <Mono>POST /api/products/:productId/scan</Mono>
            <span className="text-muted-foreground"> — public scan record (rate limited)</span>
          </div>
        </div>
        <p className="text-sm">
          <Link href="/docs" className="underline underline-offset-4 mr-4">
            Docs
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
