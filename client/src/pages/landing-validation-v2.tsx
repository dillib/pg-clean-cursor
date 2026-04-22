import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { useCurrency } from "@/hooks/use-currency";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { ModulesSection } from "@/components/modules-section";
import {
  Eyebrow,
  Mono,
  BrandBadge,
  BrandButton,
} from "@/components/brand/brand";
import { Icon } from "@/components/brand/icon";
import { Reveal } from "@/components/brand/motion";

/* ------------------------------------------------------------ *
 * landing-validation-v2
 * ------------------------------------------------------------
 * Same copy, same CTAs, same testids as landing-validation.tsx.
 * Rebuilt in the photonictag design system: three colors only
 * (ink / paper / yellow), sharp corners, hairline elevation,
 * Geist + Geist Mono, Mono load-bearing for dates/fines/SLA.
 * ------------------------------------------------------------ */

function HeroMetric({
  value,
  label,
  invert,
}: {
  value: string;
  label: string;
  invert?: boolean;
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: `1px solid ${invert ? "var(--paper-12)" : "var(--hairline)"}`,
      }}
    >
      <Mono
        style={{
          display: "block",
          fontSize: 28,
          lineHeight: 1,
          color: invert ? "hsl(var(--paper))" : "hsl(var(--ink))",
          letterSpacing: "-0.02em",
          marginBottom: 6,
        }}
      >
        {value}
      </Mono>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: invert ? "var(--paper-56)" : "var(--ink-56)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function LivePassportPreview() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/public/demo-products"],
  });

  const featured = products.filter((p) => p.productImage).slice(0, 3);
  if (!isLoading && featured.length === 0) return null;

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        background: "hsl(var(--paper))",
      }}
      data-testid="section-live-passports"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Eyebrow style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "hsl(var(--yellow))",
                display: "inline-block",
              }}
            />
            Live on PhotonicTag
          </Eyebrow>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 10,
            }}
            data-testid="text-live-passports-title"
          >
            Real Digital Product Passports, running right now
          </h2>
          <p style={{ color: "var(--fg-muted)", maxWidth: 560, margin: "0 auto" }}>
            Tap any passport to see exactly what a consumer sees when they scan the QR.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                style={{ border: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}
              >
                <div className="aspect-video w-full shimmer" />
                <div style={{ padding: 16 }}>
                  <div className="h-4 w-3/4 shimmer" />
                  <div className="h-3 w-1/2 shimmer mt-2" />
                </div>
              </div>
            ))}

          {!isLoading &&
            featured.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} data-testid={`card-live-passport-${p.id}`}>
                <div
                  style={{
                    border: "1px solid var(--hairline)",
                    background: "hsl(var(--paper))",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "border-color var(--dur-1) var(--ease)",
                  }}
                  className="hover-elevate"
                >
                  <div className="aspect-video w-full overflow-hidden photo-frame" style={{ borderRadius: 0 }}>
                    <img
                      src={p.productImage ?? ""}
                      alt={p.productName}
                      className="w-full h-full object-cover photo"
                      style={{ borderRadius: 0 }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: 16, borderTop: "1px solid var(--hairline)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 15,
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.25,
                        }}
                      >
                        {p.productName}
                      </h3>
                      {p.ceMarking === true && (
                        <BrandBadge tone="accent">
                          <Icon name="check" size={11} /> EU Ready
                        </BrandBadge>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
                      {p.manufacturer}
                      {p.countryOfOrigin ? ` · ${p.countryOfOrigin}` : ""}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                      <span style={{ color: "var(--fg-muted)" }}>{p.productCategory ?? "Product"}</span>
                      <span style={{ color: "hsl(var(--ink))", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        View passport
                        <Icon name="arrowR" size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/scan/demo" data-testid="button-live-see-all">
            <BrandButton variant="secondary" size="md" icon="qr">
              See all demo passports
            </BrandButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingValidationV2() {
  const { symbol } = useCurrency();

  // Scoped yellow token — slightly lighter than the global #FFE600 so
  // accents on paper feel warmer and less electric. Only applies to this
  // subtree; the rest of the app still uses the design-system yellow.
  const scopedYellow = { ["--yellow" as string]: "51 100% 62%" } as React.CSSProperties;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--paper))", ...scopedYellow }}>
      <Helmet>
        <title>PhotonicTag — EU Digital Product Passport Compliance Platform</title>
        <meta name="description" content="EU Digital Product Passports (DPP) are mandatory starting 2027. PhotonicTag gets you compliant in weeks — with AI insights, tamper-proof QR identity, and SAP integration. ESPR 2024/1781 ready." />
        <meta name="keywords" content="digital product passport, EU DPP compliance, ESPR 2024/1781, battery passport, SAP DPP integration, product traceability, EU ESPR regulation" />
        <link rel="canonical" href="https://www.photonictag.com/" />
        <meta property="og:title" content="PhotonicTag — Turn EU Compliance Into a Competitive Edge" />
        <meta property="og:description" content="Digital Product Passports for EU ESPR compliance. Avoid €100K+ penalties. SAP integration. Live in weeks." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.photonictag.com/" />
        <meta property="og:site_name" content="PhotonicTag" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PhotonicTag — EU Digital Product Passport Compliance Platform" />
        <meta name="twitter:description" content="EU DPP mandatory from 2027. Get compliant in weeks with AI-powered product passports and SAP integration." />
      </Helmet>

      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNav />
      </div>

      {/* ── HERO — paper with hairline grid + yellow accents ── */}
      <section
        className="relative px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: 144,
          paddingBottom: 96,
          background: "hsl(var(--paper))",
          color: "hsl(var(--ink))",
          overflow: "hidden",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        {/* soft hairline grid backdrop */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--ink-04) 1px, transparent 1px), linear-gradient(90deg, var(--ink-04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            backgroundPosition: "-1px -1px",
            pointerEvents: "none",
          }}
        />
        {/* subtle yellow wash, upper right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            background: "hsl(var(--yellow) / 0.28)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <Reveal>
            <BrandBadge
              tone="accent"
              style={{
                marginBottom: 24,
                background: "#FFE0E0",
                borderColor: "#FFC2C2",
                color: "#7F1D1D",
              }}
            >
              <Icon name="bolt" size={12} /> Battery Passport Deadline: Feb 18, 2027
            </BrandBadge>
            <Eyebrow style={{ marginBottom: 18 }}>
              EU ESPR 2024/1781 · Compliance Platform
            </Eyebrow>

            <h1
              data-testid="text-hero-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5.8vw, 72px)",
                lineHeight: 1.05,
                letterSpacing: "-0.045em",
                fontWeight: 600,
                margin: 0,
                marginBottom: 24,
                color: "hsl(var(--ink))",
                maxWidth: 920,
              }}
            >
              Every product deserves
              <br />
              <span
                style={{
                  display: "inline-block",
                  background: "hsl(var(--yellow))",
                  color: "hsl(var(--yellow-ink))",
                  padding: "0 12px",
                  marginTop: 8,
                }}
              >
                a verified identity.
              </span>
            </h1>

            <p
              data-testid="text-hero-subtitle"
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: "var(--ink-72)",
                maxWidth: 640,
                margin: 0,
                marginBottom: 14,
              }}
            >
              EU Digital Product Passports are mandatory under ESPR 2024/1781 — non-compliance means
              fines up to <Mono style={{ color: "hsl(var(--ink))" }}>€100,000+</Mono> per violation
              and EU market access restrictions.
            </p>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink-56)",
                maxWidth: 620,
                margin: 0,
                marginBottom: 36,
              }}
            >
              PhotonicTag gets you compliant in weeks — with AI-powered sustainability scoring,
              tamper-proof product identity, and native SAP integration.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <Link href="/book-demo" data-testid="button-hero-demo">
                <BrandButton variant="primary" size="lg" icon="arrowR">
                  Book a demo
                </BrandButton>
              </Link>
              <Link href="/scan/demo" data-testid="button-hero-see-demo">
                <BrandButton variant="secondary" size="lg" icon="qr">
                  See a live passport
                </BrandButton>
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", marginBottom: 40 }}>
              {[
                { label: "EU ESPR 2024/1781 Ready", tid: "badge-eu-ready" },
                { label: "SAP S/4HANA, ECC & Business One", tid: "badge-sap" },
                { label: "5 AI Sustainability Modules", tid: "badge-ai" },
                { label: "Go Live in 4–6 Weeks", tid: "badge-live" },
              ].map((c) => (
                <div
                  key={c.tid}
                  data-testid={c.tid}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-72)" }}
                >
                  <Icon name="check" size={14} stroke="hsl(var(--ink))" />
                  {c.label}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div
              data-testid="metrics-strip"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                border: "1px solid var(--hairline)",
                background: "hsl(var(--paper))",
              }}
              className="sm:!grid-cols-4"
            >
              <HeroMetric value="Feb 2027" label="First DPP deadline" />
              <HeroMetric value="€100K+" label="Per violation fine" />
              <HeroMetric value="4–6 wks" label="Average go-live" />
              <HeroMetric value="99.9%" label="Platform uptime SLA" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LIVE PASSPORTS ── */}
      <LivePassportPreview />

      {/* ── MODULES — existing component ── */}
      <div style={{ borderBottom: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}>
        <ModulesSection />
      </div>

      {/* ── COMPLIANCE TIMELINE ── */}
      <section
        data-testid="section-dpp-timeline"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ borderBottom: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow style={{ marginBottom: 12 }}>ESPR Regulation (EU) 2024/1781</Eyebrow>
            <h2
              data-testid="text-timeline-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              Your compliance clock is running
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 640, margin: "0 auto" }}>
              DPP mandates are rolling out by industry. Know your deadline — and get ahead of it.
            </p>
          </div>

          <div style={{ border: "1px solid var(--hairline)" }}>
            {[
              {
                tid: "timeline-item-batteries",
                urgency: "Urgent — Act now",
                urgencyTone: "solid" as const,
                title: "Batteries & EV Components",
                body: "Industrial, EV, and portable batteries above 2 kWh. Full lifecycle data, carbon footprint, recycled content, and supply chain disclosure required.",
                when: "Feb 18, 2027",
                reg: "EU Battery Regulation 2023/1542",
                accent: true,
              },
              {
                tid: "timeline-item-textiles",
                urgency: "Plan now",
                urgencyTone: "default" as const,
                title: "Textiles & Consumer Electronics",
                body: "Clothing, footwear, smartphones, laptops, and wearables. Material composition, repairability scores, and sustainability data required.",
                when: "Late 2027 – 2028",
                reg: "ESPR delegated acts in preparation",
              },
              {
                tid: "timeline-item-packaging",
                urgency: "Upcoming",
                urgencyTone: "default" as const,
                title: "Furniture, Packaging & Construction",
                body: "Office furniture, packaging materials, and building products. Recycling instructions, material sourcing, and full circularity data required.",
                when: "2028 – 2029",
                reg: "Phased rollout under ESPR delegated acts",
              },
              {
                tid: "timeline-item-universal",
                urgency: "All industries",
                urgencyTone: "default" as const,
                title: "Universal DPP Mandate",
                body: "Every product category sold in the EU. Construction materials, automotive parts, chemicals, and all industrial goods included.",
                when: "By 2030",
                reg: "Complete ESPR implementation — all categories",
              },
            ].map((row, i) => (
              <div
                key={row.tid}
                data-testid={row.tid}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 220px",
                  gap: 24,
                  padding: "24px 28px",
                  borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                  alignItems: "start",
                }}
                className="max-md:!grid-cols-1"
              >
                <div>
                  <BrandBadge tone={row.urgencyTone} style={{ marginBottom: 10 }}>
                    {row.urgency}
                  </BrandBadge>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 6 }}>
                    {row.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.55, margin: 0 }}>{row.body}</p>
                </div>
                <div
                  style={{
                    borderLeft: "1px solid var(--hairline)",
                    paddingLeft: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <Mono style={{ fontSize: 22, letterSpacing: "-0.02em", color: row.accent ? "hsl(var(--ink))" : "hsl(var(--ink))" }}>
                    {row.when}
                  </Mono>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>{row.reg}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/book-demo" data-testid="button-timeline-demo">
              <BrandButton variant="primary" size="md" icon="arrowR">
                Check your specific deadline
              </BrandButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ borderBottom: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <BrandBadge tone="solid" style={{ marginBottom: 16 }} data-testid="badge-problem">
              Non-compliance risk
            </BrandBadge>
            <h2
              data-testid="text-problem-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              The clock is ticking.<br className="hidden sm:block" /> Are you ready?
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 640, margin: "0 auto" }}>
              The EU is not extending deadlines. Enforcement is active. Companies that wait until the last quarter won't have time to comply.
            </p>
          </div>

          <div className="grid md:grid-cols-3" style={{ border: "1px solid var(--hairline)" }}>
            {[
              {
                tid: "card-problem-1",
                icon: "bolt" as const,
                title: "Deadlines are non-negotiable",
                body: (
                  <>
                    Battery passports: <Mono>Feb 18, 2027</Mono>. Textiles & electronics: late 2027. Full rollout by 2030.
                    Implementation takes 4–6 weeks minimum — that's time you can't afford to lose.
                  </>
                ),
              },
              {
                tid: "card-problem-2",
                icon: "shield" as const,
                title: "Penalties compound fast",
                body: (
                  <>
                    Fines of <Mono>€10,000–€100,000+</Mono> per violation, per product. Non-compliant goods face
                    EU market access blocks, forced recalls, and lasting reputational damage with retailers and consumers.
                  </>
                ),
              },
              {
                tid: "card-problem-3",
                icon: "doc" as const,
                title: "Data collection is harder than it looks",
                body: (
                  <>
                    Carbon footprint, material origins, repairability scores, certifications — structured across every SKU,
                    accessible to regulators and consumers. Most teams underestimate how complex this data operation really is.
                  </>
                ),
              },
            ].map((c, i) => (
              <div
                key={c.tid}
                data-testid={c.tid}
                style={{
                  padding: "28px 24px",
                  borderLeft: i === 0 ? "none" : "1px solid var(--hairline)",
                }}
                className="max-md:!border-l-0 max-md:border-t max-md:first:border-t-0"
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "hsl(var(--yellow))",
                    marginBottom: 16,
                  }}
                >
                  <Icon name={c.icon} size={20} stroke="hsl(var(--yellow-ink))" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 8 }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "hsl(var(--paper))" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow style={{ marginBottom: 12 }}>The PhotonicTag platform</Eyebrow>
            <h2
              data-testid="text-solution-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              One platform. Complete DPP compliance.
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 660, margin: "0 auto" }}>
              PhotonicTag handles everything — connecting your SAP data, generating AI-enriched passports,
              issuing tamper-proof QR codes, and publishing consumer-ready scan pages.
            </p>
          </div>

          <div className="grid md:grid-cols-2" style={{ border: "1px solid var(--hairline)" }}>
            {[
              { tid: "feature-qr", icon: "qr" as const, title: "Tamper-proof digital identity", body: "Every product gets a physics-rooted, unique identity. Consumers scan to verify authenticity and view full DPP data instantly — in any language, on any device." },
              { tid: "feature-compliance", icon: "shield" as const, title: "Pre-built for EU ESPR compliance", body: "Templates pre-configured for batteries, textiles, and electronics. Every mandatory DPP data field is included — no regulatory guesswork required." },
              { tid: "feature-sap", icon: "grid" as const, title: "Native SAP & ERP integration", body: "Bidirectional sync with SAP S/4HANA, ECC, and Business One. Your product data flows directly into compliant passports — no manual re-entry." },
              { tid: "feature-ai", icon: "bolt" as const, title: "AI sustainability intelligence", body: "Automated carbon scoring, A+ to F circularity grades, repair guides, and risk assessments — generated from your existing product data, with no manual effort." },
              { tid: "feature-fast", icon: "arrowUR" as const, title: "Live in weeks, not months", body: "Start with a POC in 1–2 weeks. Full enterprise deployment with SAP integration in 4–6 weeks — with a dedicated onboarding lead the whole way through." },
              { tid: "feature-consumer", icon: "eye" as const, title: "Consumer transparency at scale", body: "Every product gets a mobile-optimized public scan page — accessible via QR code anywhere in the world, instantly proving product authenticity and sustainability." },
            ].map((f, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              return (
                <div
                  key={f.tid}
                  data-testid={f.tid}
                  style={{
                    padding: "28px 24px",
                    borderLeft: col === 1 ? "1px solid var(--hairline)" : "none",
                    borderTop: row === 0 ? "none" : "1px solid var(--hairline)",
                    display: "flex",
                    gap: 16,
                  }}
                  className="max-md:!border-l-0 max-md:border-t max-md:first:border-t-0"
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "hsl(var(--yellow))",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={f.icon} size={18} stroke="hsl(var(--yellow-ink))" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 6 }}>
                      {f.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — paper with hairline rails + yellow accent ── */}
      <section
        data-testid="section-how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{
          background: "var(--ink-04)",
          borderTop: "1px solid var(--hairline)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow style={{ marginBottom: 12 }}>Operational sequence</Eyebrow>
            <h2
              data-testid="text-how-it-works-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              How it works
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 640, margin: "0 auto" }}>
              Four steps from your first product to full EU compliance — with your team trained and your SAP connected.
            </p>
          </div>

          <div className="grid md:grid-cols-4" style={{ border: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}>
            {[
              { tid: "step-connect", n: "01", title: "Connect", body: "Integrate SAP, ERP, or import via Excel. Product data maps automatically to DPP categories." },
              { tid: "step-enrich", n: "02", title: "Enrich", body: "AI generates sustainability scores, circularity grades, repair guides, and fills data gaps automatically." },
              { tid: "step-verify", n: "03", title: "Verify", body: "Tamper-proof digital identities are created. Unique QR codes link every physical product to its passport." },
              { tid: "step-deploy", n: "04", title: "Deploy", body: "Publish consumer scan pages, sync back to SAP, and enable real-time IoT tracking across your supply chain." },
            ].map((s, i) => (
              <div
                key={s.tid}
                data-testid={s.tid}
                style={{
                  padding: "32px 24px",
                  borderLeft: i === 0 ? "none" : "1px solid var(--hairline)",
                  position: "relative",
                }}
                className="max-md:!border-l-0 max-md:border-t max-md:first:border-t-0"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "hsl(var(--yellow))",
                    }}
                  />
                  <Mono style={{ fontSize: 13, color: "var(--fg-muted)" }}>{s.n}</Mono>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/docs" data-testid="button-how-it-works-cta">
              <BrandButton variant="secondary" size="md" icon="arrowR">
                Read the documentation
              </BrandButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST / STANDARDS ── */}
      <section
        data-testid="section-trust"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow style={{ marginBottom: 12 }}>Built for enterprise</Eyebrow>
            <h2
              data-testid="text-trust-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              Trusted for compliance
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 660, margin: "0 auto" }}>
              Security, data sovereignty, and regulatory alignment are not afterthoughts — they're built into every layer.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: "1px solid var(--hairline)" }}>
            {[
              { tid: "trust-gdpr", icon: "shield" as const, title: "GDPR compliant", body: "Full data privacy alignment with DPA templates" },
              { tid: "trust-espr", icon: "doc" as const, title: "ESPR 2024/1781", body: "All mandatory DPP fields pre-configured" },
              { tid: "trust-encryption", icon: "lock" as const, title: "End-to-end encrypted", body: "Enterprise-grade security & audit trail" },
              { tid: "trust-global", icon: "grid" as const, title: "EU data sovereignty", body: "Data hosted and processed within the EU" },
            ].map((t, i) => (
              <div
                key={t.tid}
                data-testid={t.tid}
                style={{
                  padding: "24px 20px",
                  textAlign: "center",
                  borderLeft: i % 4 === 0 ? "none" : "1px solid var(--hairline)",
                  borderTop: i < 2 ? "none" : "none",
                }}
                className="max-md:[&:nth-child(2n+1)]:border-l-0 max-md:[&:nth-child(n+3)]:border-t"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    margin: "0 auto 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "hsl(var(--yellow))",
                  }}
                >
                  <Icon name={t.icon} size={18} stroke="hsl(var(--yellow-ink))" />
                </div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 4 }}>
                  {t.title}
                </h4>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5, margin: 0 }}>{t.body}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 32,
              border: "1px solid var(--hairline)",
              padding: "20px 24px",
              background: "var(--ink-04)",
            }}
          >
            <Eyebrow style={{ textAlign: "center", marginBottom: 16 }}>Compliance & standards alignment</Eyebrow>
            <div className="flex flex-wrap justify-around gap-6 text-center">
              {[
                ["ESPR 2024/1781", "EU DPP Framework"],
                ["GDPR 2016/679", "Data Privacy"],
                ["Battery Reg. 2023/1542", "EU Battery Passport"],
                ["ISO/IEC 27001", "Security Framework"],
                ["GS1 Digital Link", "QR Standard"],
              ].map(([code, label]) => (
                <div key={code}>
                  <Mono style={{ fontSize: 13, color: "hsl(var(--ink))" }}>{code}</Mono>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "hsl(var(--paper))" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow style={{ marginBottom: 12 }}>Industries we serve</Eyebrow>
            <h2
              data-testid="text-industries-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              Every sector covered by EU DPP mandates
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 620, margin: "0 auto" }}>
              Purpose-built for every sector covered by EU DPP mandates — now and as the regulation expands.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Batteries & Energy Storage",
              "Textiles & Fashion",
              "Consumer Electronics",
              "Automotive & EV Components",
              "Industrial Packaging",
              "Furniture & Home Goods",
              "Construction Materials",
              "Chemicals & Pharmaceuticals",
            ].map((s) => (
              <BrandBadge key={s} tone="default" style={{ padding: "6px 12px", fontSize: 13 }}>
                {s}
              </BrandBadge>
            ))}
          </div>
        </div>
      </section>

      {/* ── DAY ONE VALUE ── */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow style={{ marginBottom: 12 }}>From day one</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 12,
              }}
            >
              What you get on day one
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", maxWidth: 620, margin: "0 auto" }}>
              Every customer gets a dedicated onboarding experience, not just platform access.
            </p>
          </div>

          <div className="grid md:grid-cols-3" style={{ border: "1px solid var(--hairline)" }}>
            {[
              { tid: "value-onboarding", icon: "bell" as const, title: "Dedicated onboarding lead", body: "A named contact guides your SAP connection, data mapping, and go-live from week one to handover." },
              { tid: "value-training", icon: "doc" as const, title: "Team training & documentation", body: "Live training sessions, self-paced documentation, and a knowledge base covering every DPP workflow." },
              { tid: "value-support", icon: "shield" as const, title: "Ongoing support SLA", body: "From email support with 48h SLA on Starter to a 4-hour phone SLA and dedicated account manager on Enterprise." },
            ].map((v, i) => (
              <div
                key={v.tid}
                data-testid={v.tid}
                style={{
                  padding: "28px 24px",
                  borderLeft: i === 0 ? "none" : "1px solid var(--hairline)",
                }}
                className="max-md:!border-l-0 max-md:border-t max-md:first:border-t-0"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "hsl(var(--yellow))",
                    marginBottom: 16,
                  }}
                >
                  <Icon name={v.icon} size={18} stroke="hsl(var(--yellow-ink))" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 8 }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP — yellow ── */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8"
        style={{ background: "hsl(var(--yellow))", color: "hsl(var(--yellow-ink))" }}
      >
        <div className="relative max-w-4xl mx-auto text-center">
          <Eyebrow color="rgba(0,0,0,0.56)" style={{ marginBottom: 16 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: "hsl(var(--ink))",
                borderRadius: "50%",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            Start this week
          </Eyebrow>

          <h2
            data-testid="text-cta-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 0.98,
              letterSpacing: "-0.045em",
              fontWeight: 600,
              color: "hsl(var(--yellow-ink))",
              margin: 0,
              marginBottom: 18,
            }}
          >
            Get EU compliant<br className="hidden sm:block" /> before your deadline.
          </h2>

          <p style={{ fontSize: 18, color: "rgba(0,0,0,0.78)", lineHeight: 1.55, maxWidth: 620, margin: "0 auto 14px" }}>
            The brands that move now will lead on consumer trust, retailer preference, and regulatory confidence — while competitors scramble.
          </p>

          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.56)", maxWidth: 540, margin: "0 auto 36px" }}>
            Start with a POC from{" "}
            <Mono style={{ color: "hsl(var(--yellow-ink))", fontWeight: 600 }}>{symbol}499/month</Mono>.{" "}
            No long-term commitment. Full credits apply when you upgrade.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
            <Link href="/book-demo" data-testid="button-cta-demo">
              <BrandButton variant="ink" size="lg" icon="arrowR">
                Book a demo
              </BrandButton>
            </Link>
            <Link href="/contact" data-testid="button-cta-contact">
              <BrandButton
                variant="ghost"
                size="lg"
                style={{ borderColor: "rgba(0,0,0,0.35)", color: "hsl(var(--yellow-ink))" }}
              >
                Talk to sales
              </BrandButton>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center" style={{ gap: "12px 24px", fontSize: 13, color: "rgba(0,0,0,0.66)" }}>
            {[
              "No long-term contract",
              "Dedicated onboarding lead",
              "Live in 4–6 weeks",
            ].map((c) => (
              <div key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={14} stroke="hsl(var(--yellow-ink))" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
