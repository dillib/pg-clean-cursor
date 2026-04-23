import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { PublicNavV2 } from "@/components/brand/public-nav-v2";
import { PublicFooter } from "@/components/public-footer";
import { Eyebrow, Mono, BrandBadge, BrandButton } from "@/components/brand/brand";
import { Icon } from "@/components/brand/icon";
import { Reveal } from "@/components/brand/motion";
import type { IconName } from "@/components/brand/icon";

const scopedYellow = { ["--yellow" as string]: "51 100% 62%" } as React.CSSProperties;

function SectionHead({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div style={{ textAlign: align, marginBottom: 48, maxWidth: align === "center" ? 720 : undefined, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}>
      {eyebrow && <Eyebrow style={{ marginBottom: 12 }}>{eyebrow}</Eyebrow>}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.6vw, 44px)",
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          fontWeight: 600,
          margin: 0,
          marginBottom: lede ? 14 : 0,
        }}
      >
        {title}
      </h2>
      {lede && (
        <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--fg-muted)", margin: 0 }}>{lede}</p>
      )}
    </div>
  );
}

function PillarTile({
  n,
  icon,
  title,
  body,
  bullets,
}: {
  n: string;
  icon: IconName;
  title: string;
  body: string;
  bullets: string[];
}) {
  return (
    <div
      style={{
        padding: "28px 28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "hsl(var(--paper))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(var(--yellow))",
          }}
        >
          <Icon name={icon} size={20} stroke="hsl(var(--yellow-ink))" />
        </div>
        <Mono style={{ fontSize: 12, color: "var(--fg-muted)" }}>{n}</Mono>
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{body}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {bullets.map((b) => (
          <li key={b} style={{ display: "flex", gap: 8, fontSize: 13, color: "hsl(var(--ink))" }}>
            <Icon name="check" size={14} stroke="hsl(var(--ink))" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatBlock({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{ padding: "24px 24px", borderRight: "1px solid var(--hairline)" }}>
      <Mono
        style={{
          display: "block",
          fontSize: 36,
          letterSpacing: "-0.025em",
          color: "hsl(var(--ink))",
          marginBottom: 6,
        }}
      >
        {value}
      </Mono>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", marginBottom: sub ? 6 : 0 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-72)", lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

export default function PlatformPage() {
  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--paper))", ...scopedYellow }}>
      <Helmet>
        <title>Platform — PhotonicTag · The operating system for Digital Product Passports</title>
        <meta
          name="description"
          content="PhotonicTag is the end-to-end DPP platform: SAP-native data ingestion, AI-enriched sustainability intelligence, photon-rooted product identity, regulator-grade audit trails, and a consumer-ready scan experience."
        />
        <link rel="canonical" href="https://www.photonictag.com/platform" />
      </Helmet>

      <PublicNavV2 />

      {/* HERO */}
      <section
        className="relative px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: 96,
          paddingBottom: 80,
          background: "hsl(var(--paper))",
          borderBottom: "1px solid var(--hairline)",
          overflow: "hidden",
        }}
      >
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
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -160,
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
            <Eyebrow style={{ marginBottom: 18 }}>The PhotonicTag Platform</Eyebrow>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5.6vw, 72px)",
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
                fontWeight: 600,
                margin: 0,
                marginBottom: 22,
                maxWidth: 980,
              }}
              data-testid="text-platform-hero-title"
            >
              The operating system for{" "}
              <span style={{ display: "inline-block", background: "hsl(var(--yellow))", color: "hsl(var(--yellow-ink))", padding: "0 12px", marginTop: 4 }}>
                Digital Product Passports.
              </span>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: "var(--ink-72)", maxWidth: 720, margin: 0, marginBottom: 16 }}>
              PhotonicTag turns every SKU you ship into a regulator-grade passport — from SAP extract to consumer scan,
              with AI-enriched sustainability data, photon-rooted product identity, and an audit trail that stands up to
              ESPR enforcement.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-56)", maxWidth: 720, margin: 0, marginBottom: 32 }}>
              One platform. Five integrated planes. Built specifically for EU Digital Product Passport compliance under
              ESPR Regulation 2024/1781 — and engineered to extend to every regulation that follows it.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/book-demo">
                <BrandButton variant="primary" size="lg" icon="arrowR">
                  Book a platform walkthrough
                </BrandButton>
              </Link>
              <Link href="/industries">
                <BrandButton variant="secondary" size="lg" icon="arrowR">
                  See your industry
                </BrandButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AT A GLANCE / STATS STRIP */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}>
        <div className="max-w-6xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
          <StatBlock value="4–6 wks" label="Time to live" sub="POC in week 1, full SAP integration by week 6." />
          <StatBlock value="5 planes" label="Connect · Enrich · Verify · Deploy · Audit" sub="One platform, no integration glue between modules." />
          <StatBlock value="99.9%" label="Uptime SLA" sub="EU-hosted, ISO 27001 framework alignment." />
          <StatBlock value="€100K+" label="Per-violation downside" sub="What you avoid by being compliant on day one." />
        </div>
      </section>

      {/* ── THE FIVE PLANES ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead
            align="center"
            eyebrow="The five planes"
            title="A complete DPP stack — not a toolbox you wire yourself."
            lede="Most teams treat compliance as a backlog of disconnected tools: a CSV export from ERP, a sustainability spreadsheet, a QR generator, a microsite. PhotonicTag unifies them into one system with shared identity, shared data, and one source of truth for regulators."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              border: "1px solid var(--hairline)",
              gap: 1,
              background: "var(--hairline)",
            }}
          >
            <PillarTile
              n="01"
              icon="grid"
              title="Connect"
              body="Native bidirectional adapters for SAP S/4HANA, ECC, and Business One. Plus REST + CSV for everything else. Map once; product master, BOMs, and supplier records flow continuously."
              bullets={["SAP IDoc + OData", "REST + Webhooks", "CSV/Excel import", "Field-level mapping UI"]}
            />
            <PillarTile
              n="02"
              icon="bolt"
              title="Enrich"
              body="Five AI sustainability modules — carbon footprint, circularity grade, repairability score, origin verification, and risk scoring — fill the data gaps your ERP doesn't carry. Every output is sourced and auditable."
              bullets={["EF 3.1 carbon factors", "Circularity A+ to F", "Repairability index", "Confidence-scored outputs"]}
            />
            <PillarTile
              n="03"
              icon="shield"
              title="Verify"
              body="Each product gets a photon-rooted, GS1 Digital Link–compliant identity. Tamper-evident, copy-resistant, queryable from a phone camera. Bind one identity to thousands of physical units in a single batch."
              bullets={["GS1 Digital Link", "QR + NFC delivery", "Anti-clone verification", "Batch / serial granularity"]}
            />
            <PillarTile
              n="04"
              icon="eye"
              title="Deploy"
              body="The consumer-facing passport — multi-language, mobile-first, accessible. White-label to your brand. Edge-cached globally so a scan in Munich loads in under 200 ms."
              bullets={["27 languages out of the box", "Brand white-labeling", "Sub-200ms global TTFB", "WCAG 2.2 AA"]}
            />
            <PillarTile
              n="05"
              icon="lock"
              title="Audit"
              body="Every data point, transformation, and consent is logged. Export regulator-ready evidence packs in one click — including raw SAP source, AI provenance, and the chain of custody from cell to consumer."
              bullets={["Append-only event log", "Regulator export pack", "Differential audit history", "5-year retention default"]}
            />
          </div>
        </div>
      </section>

      {/* ── SAP DEEP-DIVE ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "var(--ink-04)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2" style={{ gap: 48, alignItems: "start" }}>
            <div>
              <Eyebrow style={{ marginBottom: 12 }}>SAP-native, by design</Eyebrow>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                  marginBottom: 16,
                }}
              >
                Your product master is already 80% of a passport.
              </h2>
              <p style={{ fontSize: 16, color: "var(--ink-72)", lineHeight: 1.6, marginBottom: 14 }}>
                Most DPP vendors ask you to re-enter your product data. We don't. PhotonicTag connects directly to SAP via
                native IDoc and OData adapters and continuously syncs material masters, BOMs, supplier records, batches,
                and serials.
              </p>
              <p style={{ fontSize: 16, color: "var(--ink-72)", lineHeight: 1.6, marginBottom: 24 }}>
                You map MARA, MARC, MAKT, MBEW, EBAN, EKKO once. After that, every change in SAP propagates into the live
                passport — bidirectionally if you want enriched data written back to custom Z-fields.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  "S/4HANA Cloud + OnPrem",
                  "ECC 6.0 EHP6+",
                  "Business One (HANA + SQL)",
                  "Ariba + IBP optional",
                  "ABAP add-on (no transport risk)",
                  "Read-only or read/write modes",
                ].map((s) => (
                  <li key={s} style={{ display: "flex", gap: 8, fontSize: 14, color: "hsl(var(--ink))" }}>
                    <Icon name="check" size={14} stroke="hsl(var(--ink))" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Field mapping mockup */}
            <div style={{ border: "1px solid var(--hairline)", background: "hsl(var(--paper))" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--hairline)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--ink-04)",
                }}
              >
                <Mono style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                  sap.mapping › product.master
                </Mono>
                <BrandBadge tone="accent">live</BrandBadge>
              </div>
              <div style={{ padding: 0 }}>
                {[
                  ["MARA-MATNR", "product.sku"],
                  ["MAKT-MAKTX", "product.name"],
                  ["MARA-MEINS", "product.unitOfMeasure"],
                  ["MARA-MTART", "product.materialType"],
                  ["MBEW-LBKUM", "stock.quantity"],
                  ["MARC-DISMM", "supplyChain.mrpType"],
                  ["EINA-LIFNR", "supplier.id"],
                  ["BATCH-CHARG", "passport.batchId"],
                ].map(([from, to], i) => (
                  <div
                    key={from}
                    style={{
                      padding: "10px 14px",
                      display: "grid",
                      gridTemplateColumns: "1fr 16px 1fr",
                      gap: 10,
                      alignItems: "center",
                      borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                    }}
                  >
                    <Mono style={{ fontSize: 12 }}>{from}</Mono>
                    <Icon name="arrowR" size={12} stroke="var(--ink-56)" />
                    <Mono style={{ fontSize: 12, color: "hsl(var(--ink))" }}>{to}</Mono>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid var(--hairline)", background: "var(--ink-04)" }}>
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                  + 47 more fields auto-mapped via heuristic
                </Mono>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI INTELLIGENCE ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead
            align="center"
            eyebrow="AI sustainability intelligence"
            title="Five modules that turn product data into compliance evidence."
            lede="Regulators don't accept 'we don't have that data'. PhotonicTag fills the gaps that SAP doesn't carry — using domain-specific models trained on EU regulatory frameworks, published EPDs, and the EF 3.1 carbon factor database."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ border: "1px solid var(--hairline)" }}>
            {[
              {
                tid: "ai-carbon",
                icon: "bolt" as const,
                title: "Carbon Footprint",
                body: "Cradle-to-gate (and optional cradle-to-grave) using EF 3.1 factors. Scope 1, 2, and 3 broken out by SAP cost center.",
                stat: "± 8% vs. third-party LCA",
              },
              {
                tid: "ai-circular",
                icon: "grid" as const,
                title: "Circularity Grade",
                body: "A+ to F grading aligned with the EU's Circular Economy Action Plan. Inputs: recycled content, disassemblability, durability, recyclability.",
                stat: "Validated against PEFCR scopes",
              },
              {
                tid: "ai-repair",
                icon: "doc" as const,
                title: "Repairability Index",
                body: "0–10 score using the French repairability index methodology (extended). Auto-generated repair guides for Top 20 failure modes per SKU.",
                stat: "Compatible with EU Right-to-Repair",
              },
              {
                tid: "ai-origin",
                icon: "shield" as const,
                title: "Origin Verification",
                body: "Cross-checks supplier declarations against EUDR, conflict-minerals, and forced-labor watchlists. Flags risk by tier with confidence scoring.",
                stat: "EUDR + Dodd-Frank ready",
              },
              {
                tid: "ai-risk",
                icon: "bell" as const,
                title: "Risk Scoring",
                body: "Combines regulatory exposure, supplier concentration, and material substitution risk into a single board-ready score per product line.",
                stat: "Updated nightly, queryable via API",
              },
              {
                tid: "ai-provenance",
                icon: "ext" as const,
                title: "Provenance & Sourcing",
                body: "Chain-of-custody graph from raw material to finished good. Each node is signed and timestamped — no central authority required for audit.",
                stat: "Append-only, regulator-exportable",
              },
            ].map((m, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <div
                  key={m.tid}
                  data-testid={m.tid}
                  style={{
                    padding: "24px 24px 28px",
                    borderLeft: col === 0 ? "none" : "1px solid var(--hairline)",
                    borderTop: row === 0 ? "none" : "1px solid var(--hairline)",
                  }}
                  className="max-md:!border-l-0 max-md:border-t max-md:first:border-t-0 max-lg:[&:nth-child(2n)]:border-l max-lg:[&:nth-child(odd)]:border-l-0"
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "hsl(var(--yellow))",
                      marginBottom: 14,
                    }}
                  >
                    <Icon name={m.icon} size={18} stroke="hsl(var(--yellow-ink))" />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8 }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                    {m.body}
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px",
                      border: "1px solid var(--hairline)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--ink-72)",
                    }}
                  >
                    <Icon name="check" size={11} stroke="hsl(var(--ink))" />
                    {m.stat}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── IDENTITY & SECURITY ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "var(--ink-04)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5" style={{ gap: 48, alignItems: "start" }}>
            <div className="md:col-span-2">
              <Eyebrow style={{ marginBottom: 12 }}>Identity & security</Eyebrow>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: 14 }}>
                Photon-rooted identity. Regulator-grade trust.
              </h2>
              <p style={{ fontSize: 15, color: "var(--ink-72)", lineHeight: 1.6 }}>
                Most QR systems can be photographed and replicated. PhotonicTag's identities are anchored in an
                append-only registry with cryptographic verification — you know whether a scan is genuine, not just
                whether the QR was readable.
              </p>
            </div>
            <div className="md:col-span-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--hairline)", border: "1px solid var(--hairline)" }}>
              {[
                { title: "GS1 Digital Link", body: "Standard-compliant resolver — works in any retailer database that already speaks GS1.", icon: "qr" as const },
                { title: "Append-only registry", body: "Every passport state change is hashed and chained. Tamper detection is automatic.", icon: "lock" as const },
                { title: "EU data sovereignty", body: "All product data hosted and processed in Frankfurt (Fly.io fra region). Never leaves the EU.", icon: "shield" as const },
                { title: "ISO 27001 framework", body: "Operations, change management, and incident response all map to ISO 27001 controls.", icon: "doc" as const },
              ].map((t) => (
                <div key={t.title} style={{ padding: 20, background: "hsl(var(--paper))" }}>
                  <Icon name={t.icon} size={18} stroke="hsl(var(--ink))" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 6 }}>
                    {t.title}
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55, margin: 0 }}>{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEVELOPER PLATFORM ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2" style={{ gap: 48, alignItems: "center" }}>
          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Developer platform</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: 14 }}>
              REST API, webhooks, SDKs. No vendor lock-in.
            </h2>
            <p style={{ fontSize: 15, color: "var(--ink-72)", lineHeight: 1.6, marginBottom: 24 }}>
              PhotonicTag is API-first. Every UI action is also an endpoint — your team can build internal tooling, embed
              passport authoring into existing PIM workflows, or stream events into your data warehouse.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {[
                "REST + GraphQL (OpenAPI 3.1 spec)",
                "Webhooks for every state change",
                "SDKs: TypeScript, Python, Go",
                "OAuth 2.0 + scoped service tokens",
                "Sandbox tenants with synthetic data",
              ].map((s) => (
                <li key={s} style={{ display: "flex", gap: 10, fontSize: 14, color: "hsl(var(--ink))" }}>
                  <Icon name="check" size={14} stroke="hsl(var(--ink))" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ border: "1px solid var(--hairline)", background: "hsl(var(--ink))", color: "hsl(var(--paper))", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--paper-12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Mono style={{ fontSize: 11, color: "var(--paper-56)" }}>POST /v1/passports</Mono>
              <Mono style={{ fontSize: 11, color: "hsl(var(--yellow))" }}>201 Created</Mono>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--paper-72)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
{`{
  "sku": "BAT-EV-72KWH-A1",
  "batch": "B-2027-0042",
  "manufacturer": "Acme EU GmbH",
  "carbonKgCO2e": 4820,
  "recycledContentPct": 27.4,
  "circularityGrade": "B+",
  "compliance": ["espr", "battery_reg_2023_1542"],
  "passportUrl": "https://pt.eu/p/`}<span style={{ color: "hsl(var(--yellow))" }}>{`8a1f3...`}</span>{`",
  "qrSvg": "<svg ..."
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── DELIVERY MODEL ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead
            align="center"
            eyebrow="How we deliver"
            title="From kickoff to compliance in six weeks."
            lede="A fixed-scope delivery model with named owners on both sides. No 'discovery phase' that drags on for months — we've done this before, and the playbook is tight."
          />
          <div className="grid md:grid-cols-4" style={{ border: "1px solid var(--hairline)" }}>
            {[
              { w: "Week 1", title: "Discovery + sandbox", body: "SAP read-only connection, 50 SKUs in your sandbox tenant, kickoff workshop with your data, IT, and sustainability leads." },
              { w: "Weeks 2–3", title: "Mapping + AI baseline", body: "Field-level mapping, AI module calibration on your historical data, validation against any existing EPDs you have." },
              { w: "Weeks 4–5", title: "Identity + publishing", body: "QR + NFC identity issuance for first product line, consumer scan pages live on a staging domain, internal review." },
              { w: "Week 6", title: "Production cut-over", body: "Read/write SAP enabled, white-labeled scan domain live, regulator export pack tested. Handover to your owner." },
            ].map((s, i) => (
              <div
                key={s.w}
                style={{
                  padding: "24px 22px 28px",
                  borderLeft: i === 0 ? "none" : "1px solid var(--hairline)",
                  position: "relative",
                }}
                className="max-md:!border-l-0 max-md:border-t max-md:first:border-t-0"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "hsl(var(--yellow))" }} />
                  <Mono style={{ fontSize: 13, color: "var(--fg-muted)" }}>{s.w}</Mono>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "var(--ink-04)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Eyebrow style={{ marginBottom: 16 }}>Why it matters</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: 18 }}>
            Compliance is the floor. Trust is the ceiling.
          </h2>
          <p style={{ fontSize: 18, color: "var(--ink-72)", lineHeight: 1.6, marginBottom: 14 }}>
            EU DPP isn't a checkbox — it's the start of how brands earn shelf space, retailer preference, and consumer
            loyalty in the next decade. The companies that ship transparent passports first will define what 'good'
            looks like for their category.
          </p>
          <p style={{ fontSize: 16, color: "var(--ink-56)", lineHeight: 1.6 }}>
            We built PhotonicTag because no existing tool treated DPP as the brand-defining infrastructure it actually
            is. It's not a compliance side-project. It's the foundation of how your products will be understood in the
            EU market for the next twenty years.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "hsl(var(--yellow))", color: "hsl(var(--yellow-ink))" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Eyebrow color="rgba(0,0,0,0.56)" style={{ marginBottom: 16 }}>Start this week</Eyebrow>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.0,
              letterSpacing: "-0.045em",
              fontWeight: 600,
              margin: 0,
              marginBottom: 18,
              color: "hsl(var(--yellow-ink))",
            }}
          >
            See PhotonicTag in your stack.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(0,0,0,0.78)", maxWidth: 620, margin: "0 auto 32px" }}>
            45 minutes. We bring two of your real SKUs and walk through the platform end-to-end — SAP extract to
            consumer scan to regulator export. No slides.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book-demo">
              <BrandButton variant="ink" size="lg" icon="arrowR">
                Book a platform walkthrough
              </BrandButton>
            </Link>
            <Link href="/industries">
              <BrandButton variant="ghost" size="lg" style={{ borderColor: "rgba(0,0,0,0.35)", color: "hsl(var(--yellow-ink))" }}>
                Explore by industry
              </BrandButton>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
