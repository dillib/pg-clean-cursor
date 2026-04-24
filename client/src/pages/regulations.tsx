import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { PublicNavV2 } from "@/components/brand/public-nav-v2";
import { PublicFooter } from "@/components/public-footer";
import { Eyebrow, Mono } from "@/components/brand/brand";

export default function RegulationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Regulations · PhotonicTag</title>
        <meta name="description" content="ESPR (EU) 2024/1781 and related enforcement timelines for Digital Product Passports." />
      </Helmet>
      <PublicNavV2 />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Regulations</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          PhotonicTag is built around the EU Ecodesign for Sustainable Products Regulation and the Digital Product Passport
          obligations that flow from it. This page summarizes what producers need on their radar; product data in the app is
          shaped to those field sets.
        </p>
        <ul className="space-y-4 border border-border p-6">
          <li>
            <Mono>ESPR · 2024/1781</Mono>
            <p className="mt-1 text-sm text-muted-foreground">Framework regulation — sector delegated acts set passport content.</p>
          </li>
          <li>
            <Mono>Battery Regulation · 2023/1542</Mono>
            <p className="mt-1 text-sm text-muted-foreground">Battery passport fields where chemistry and lifetime data apply.</p>
          </li>
        </ul>
        <p className="text-sm">
          <Link href="/v2" className="underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
