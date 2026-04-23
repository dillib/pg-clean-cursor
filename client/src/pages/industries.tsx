import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { PublicNavV2, industriesMenu } from "@/components/brand/public-nav-v2";
import { PublicFooter } from "@/components/public-footer";
import { Eyebrow, Mono, BrandBadge, BrandButton } from "@/components/brand/brand";
import { Icon } from "@/components/brand/icon";
import { Reveal } from "@/components/brand/motion";
import type { IconName } from "@/components/brand/icon";

const scopedYellow = { ["--yellow" as string]: "51 100% 62%" } as React.CSSProperties;

type UseCase = {
  title: string;
  body: string;
  bullets: string[];
};

type IndustryBlock = {
  slug: string;
  label: string;
  deadline: string;
  regulation: string;
  icon: IconName;
  lede: string;
  whoItsFor: string;
  useCases: UseCase[];
};

const industries: IndustryBlock[] = [
  {
    slug: "batteries",
    label: "Batteries & Energy Storage",
    deadline: "Feb 18, 2027",
    regulation: "EU Battery Regulation 2023/1542",
    icon: "bolt",
    lede:
      "Every industrial, EV, and LMT battery sold into the EU after Feb 2027 must carry a unique passport — covering chemistry, carbon footprint, recycled content, state of health, and end-of-life routing.",
    whoItsFor:
      "Cell manufacturers, pack assemblers, OEMs, second-life integrators, recyclers.",
    useCases: [
      {
        title: "EV battery lifecycle passport",
        body: "Issue a unique DPP at cell-format level, link it to the pack, the vehicle VIN, and every state-of-health snapshot for the next 15 years.",
        bullets: [
          "Cell-to-pack-to-VIN traceability",
          "OBD telemetry feed for SoH events",
          "Warranty & recall scoping in seconds",
          "Hand-off contract to second-life integrator",
        ],
      },
      {
        title: "Industrial carbon disclosure",
        body: "Compute, attest, and publish per-kWh CO₂e using ISO 14067 boundaries — auditable down to the smelter and the renewable PPA.",
        bullets: [
          "Tier-1 to tier-4 supplier emissions ingest",
          "Renewable energy certificate matching",
          "Third-party verifier sign-off workflow",
          "Disclosed value pinned on-chain",
        ],
      },
      {
        title: "Recycled content audit",
        body: "Track recycled cobalt, lithium, nickel, lead percentages with mass-balance proof — meet 2031 and 2036 minimums without scrambling.",
        bullets: [
          "Mass-balance reconciliation per batch",
          "Recycler chain-of-custody attestation",
          "Forecast against EU minimum thresholds",
          "Auditor-ready evidence pack export",
        ],
      },
      {
        title: "Second-life & end-of-life routing",
        body: "When a pack hits its EV-grade SoH floor, automatically route it to the right second-life partner or recycler based on chemistry and condition.",
        bullets: [
          "Automated grading from telemetry",
          "Partner marketplace for B2B re-sale",
          "Take-back logistics + WEEE manifests",
          "Closing-the-loop reporting for regulators",
        ],
      },
    ],
  },
  {
    slug: "textiles",
    label: "Textiles & Fashion",
    deadline: "Late 2027 (ESPR delegated act)",
    regulation: "EU ESPR + EU Strategy for Sustainable Textiles",
    icon: "qr",
    lede:
      "Apparel, footwear, and home textiles will need a DPP covering fiber composition, country of origin, repairability, and end-of-life pathways. Luxury brands also use it to kill counterfeits at the source.",
    whoItsFor:
      "Apparel brands, vertically integrated mills, luxury houses, resale platforms, recyclers.",
    useCases: [
      {
        title: "Fiber composition + verified origin",
        body: "One QR shows the consumer cotton-from-where, polyester-from-which-recycler, and the dye house — backed by tier-3 supplier attestations.",
        bullets: [
          "Mill, dye-house, cut-make-trim attestation",
          "Organic, BCI, GRS, GOTS certificate binding",
          "Country-of-origin proof for customs",
          "Per-SKU vs. per-piece passport modes",
        ],
      },
      {
        title: "Repairability & circularity score",
        body: "Disclose how a garment is built, what spare parts exist, which repair partner is closest, and how to disassemble for recycling.",
        bullets: [
          "Repair instructions + spare-part SKUs",
          "Authorised repair partner directory",
          "Take-back pre-paid shipping label issue",
          "Fiber-to-fiber recycler routing",
        ],
      },
      {
        title: "Anti-counterfeit for luxury",
        body: "Photon-rooted identity at the stitch level — a counterfeit can copy the QR, but it cannot copy the optical fingerprint. Resale platforms verify in one scan.",
        bullets: [
          "Optical fingerprint at point of manufacture",
          "Resale platform API for live verification",
          "Provenance ledger across owners",
          "Fraud-attempt analytics for brand teams",
        ],
      },
      {
        title: "Take-back + resale routing",
        body: "Turn end-of-life into a logistics problem you actually want — every garment knows where to go and the brand earns the credit.",
        bullets: [
          "Automated EPR fee reporting",
          "First-party resale channel integration",
          "Donation-vs-recycle decision logic",
          "Closed-loop recycled-content credits",
        ],
      },
    ],
  },
  {
    slug: "electronics",
    label: "Consumer Electronics",
    deadline: "2027–2028 (per ESPR product group)",
    regulation: "EU ESPR + Right-to-Repair Directive",
    icon: "grid",
    lede:
      "Phones, laptops, displays, and small appliances will need a DPP covering reparability, conflict minerals, software support window, and disposal — turning compliance into a buyer-trust signal.",
    whoItsFor:
      "OEMs, ODMs, refurbishers, repair networks, e-waste recyclers.",
    useCases: [
      {
        title: "Reparability & spare parts disclosure",
        body: "Publish the official reparability score, the parts list with prices and availability windows, and the certified repair partner network.",
        bullets: [
          "Per-component spare-part SKU + price",
          "5/7/10-year availability commitment",
          "Authorised repair partner directory",
          "DIY guide attachments per assembly step",
        ],
      },
      {
        title: "Conflict minerals & supply chain ethics",
        body: "Tin, tantalum, tungsten, gold, cobalt — sourced from where, smelted by whom, audited by which RMI initiative. Buyers see the receipts.",
        bullets: [
          "RMI/RCS smelter cross-check",
          "Tier-3 mine-of-origin attestation",
          "Annual due-diligence report export",
          "Customer-facing ethics page generator",
        ],
      },
      {
        title: "Firmware & security log",
        body: "Pin every firmware version, every CVE patch, and every end-of-support date so regulators and corporate buyers see your security posture in one view.",
        bullets: [
          "Signed firmware release manifest",
          "CVE-to-patch traceability",
          "Software bill-of-materials (SBOM)",
          "End-of-support deadline disclosure",
        ],
      },
      {
        title: "End-of-life e-waste routing",
        body: "Route returned devices to refurbishers, parts harvesters, or WEEE recyclers based on model, condition, and where the customer is.",
        bullets: [
          "Condition-grading playbook",
          "WEEE compliance + EPR fee automation",
          "Component harvest + resale flow",
          "Data-wipe attestation per device",
        ],
      },
    ],
  },
  {
    slug: "automotive",
    label: "Automotive & EV Components",
    deadline: "Rolling — battery 2027, full vehicle TBD",
    regulation: "EU Battery Reg + ELV Directive revision",
    icon: "shield",
    lede:
      "Vehicles aren't yet in scope as a whole, but every regulated component already is — batteries, tyres, brake pads, electronics. OEMs that get ahead of this turn DPPs into a service-and-resale advantage.",
    whoItsFor:
      "OEMs, tier-1 suppliers, fleet operators, dealer networks, dismantlers.",
    useCases: [
      {
        title: "Component carbon footprint",
        body: "Per-part CO₂e calculated to the smelter, reported up the supply chain to the OEM, and rolled into the vehicle-level disclosure.",
        bullets: [
          "Tier-1 to tier-4 emissions ingest",
          "OEM roll-up per VIN",
          "Customer-facing carbon spec sheet",
          "Procurement leverage by supplier emissions",
        ],
      },
      {
        title: "Recycled & bio-based materials proof",
        body: "Mass-balance proof for recycled steel, aluminium, plastics, glass — meet ELV and ESPR thresholds with an evidence chain regulators trust.",
        bullets: [
          "Per-kg mass balance per batch",
          "Bio-based fraction certification",
          "Post-consumer vs. pre-consumer split",
          "ELV directive reporting export",
        ],
      },
      {
        title: "Remanufactured part authentication",
        body: "Reman parts need provenance to compete with OEM-new — a passport that says where it came from, what was replaced, and what's warrantied.",
        bullets: [
          "Original-part chain-of-custody",
          "Replaced-component itemisation",
          "Warranty terms pinned to the part",
          "Counterfeit-reman detection at install",
        ],
      },
      {
        title: "Battery passport integration",
        body: "Ride the EU Battery Regulation deadline — every pack ships with a Reg-compliant DPP linked to the VIN and the OEM warranty system.",
        bullets: [
          "Cell-pack-VIN linkage",
          "Telemetry-driven SoH passport updates",
          "Warranty + recall scope automation",
          "Second-life partner hand-off",
        ],
      },
    ],
  },
  {
    slug: "packaging",
    label: "Industrial Packaging",
    deadline: "Aug 2028 (PPWR Article 12 reusable)",
    regulation: "Packaging & Packaging Waste Regulation (PPWR)",
    icon: "doc",
    lede:
      "PPWR mandates per-unit material composition, recyclability class, and reuse tracking for B2B packaging. Closed-loop packaging operators need passports to bill, audit, and prove compliance.",
    whoItsFor:
      "Packaging converters, brand owners, reverse-logistics ops, recyclers, EPR schemes.",
    useCases: [
      {
        title: "Material composition disclosure",
        body: "Every pallet, crate, drum, IBC carries the polymer family, recycled fraction, and additive disclosure required by Article 12.",
        bullets: [
          "Per-component polymer + additive list",
          "Recycled-content mass balance",
          "Hazardous additive flagging",
          "EPR fee base auto-calculation",
        ],
      },
      {
        title: "Recyclability by region",
        body: "Same SKU, different recyclability class depending on where it's sold — surface the right grade for the right market without guesswork.",
        bullets: [
          "Per-country recyclability lookup",
          "Design-for-recycling score",
          "MRF compatibility assessment",
          "Market-restriction warnings at quote time",
        ],
      },
      {
        title: "Reusable packaging tracking",
        body: "Every reusable asset — crate, pallet, IBC — has a passport. Every cycle is logged. Every loss is billed. Every clean is audit-ready.",
        bullets: [
          "Asset-level cycle counter",
          "Loss-and-damage billing automation",
          "Cleaning + sanitisation log",
          "Pool-operator settlement reporting",
        ],
      },
      {
        title: "Closed-loop B2B reporting",
        body: "Prove to your customer the packaging they pay for is actually re-used — with the cycle data, the loss rate, and the carbon avoided.",
        bullets: [
          "Customer-portal cycle dashboards",
          "CO₂-avoided calculator per SKU",
          "Loss-rate benchmarking",
          "Pool-economics annual review export",
        ],
      },
    ],
  },
  {
    slug: "furniture",
    label: "Furniture & Home Goods",
    deadline: "2028–2029 (ESPR product group)",
    regulation: "EU ESPR + EUDR (wood) + REACH",
    icon: "grid",
    lede:
      "Furniture sits at the intersection of EUDR (wood origin), REACH (chemical safety), and ESPR (durability + repair). One DPP covers all three — and gives the consumer the spec sheet they actually want.",
    whoItsFor:
      "Furniture brands, contract & hospitality buyers, online resellers, refurbishers.",
    useCases: [
      {
        title: "EUDR wood-origin compliance",
        body: "Plot-level geolocation for every timber input, deforestation-risk scoring, and the due-diligence statement EUDR requires.",
        bullets: [
          "Geo-fenced plot-of-harvest evidence",
          "Satellite deforestation cross-check",
          "FSC / PEFC certificate binding",
          "Article 4 due-diligence statement export",
        ],
      },
      {
        title: "Chemical safety disclosure",
        body: "Formaldehyde, VOCs, flame retardants, plasticisers — disclose what's in the foam, the laminate, the finish, and the textile.",
        bullets: [
          "REACH SVHC concentration disclosure",
          "Indoor air-quality (E1/CARB) certification",
          "Allergen & skin-contact warnings",
          "Hospitality / contract spec-sheet generator",
        ],
      },
      {
        title: "Repair & spare-parts service",
        body: "Sell the chair once, sell the spare fabric, the spare leg, the spare cushion for the next decade — and let buyers self-serve the order.",
        bullets: [
          "Per-component spare SKU + price",
          "Authorised repair partner directory",
          "Customer self-service parts ordering",
          "Warranty extension upsell at scan",
        ],
      },
      {
        title: "Disassembly + refurbish guide",
        body: "End-of-first-life is not end-of-life — publish the disassembly diagram and route the piece to the right refurbisher or recycler.",
        bullets: [
          "Step-by-step disassembly guide",
          "Component-recyclability map",
          "Refurbish partner matchmaking",
          "B2B fleet-replacement take-back program",
        ],
      },
    ],
  },
  {
    slug: "construction",
    label: "Construction Materials",
    deadline: "2029–2030 (CPR + ESPR overlap)",
    regulation: "Construction Products Regulation (CPR) + ESPR",
    icon: "shield",
    lede:
      "CPR revision requires DPPs at the product level for every CE-marked construction product. Architects and contractors increasingly demand EPDs as a pre-bid filter — DPPs satisfy both in one workflow.",
    whoItsFor:
      "Material producers, contractors, architects, demolition/deconstruction firms.",
    useCases: [
      {
        title: "Embodied carbon (EPD) at product level",
        body: "Issue ISO 14025-compliant Environmental Product Declarations on every batch — not every five years on a product family.",
        bullets: [
          "Per-batch LCA computation",
          "Background-data version pinning",
          "Third-party verifier workflow",
          "EN 15804+A2 export for tendering",
        ],
      },
      {
        title: "Material-health transparency",
        body: "Cradle-to-Cradle and Living-Building-Challenge buyers want the full ingredient list — disclose without compromising IP via tiered access.",
        bullets: [
          "Tiered disclosure (public / NDA / certifier)",
          "Red List screening automation",
          "Health Product Declaration (HPD) export",
          "Spec-section Division 01 81 13 alignment",
        ],
      },
      {
        title: "Deconstruction & material reuse",
        body: "Tag the structure when it's built — use the passport when it's torn down. Buyers of reclaimed brick, steel, timber get a real spec sheet.",
        bullets: [
          "BIM-model-to-passport linkage",
          "Pre-demolition material audit export",
          "Reclaimed-material marketplace API",
          "Carbon-credit issuance for reuse",
        ],
      },
      {
        title: "CPR + CE marking compliance",
        body: "One passport carries the CPR Declaration of Performance, the CE mark, the LCA, and the safety data sheet — auditor sees one source of truth.",
        bullets: [
          "DoP versioning per batch",
          "Notified body certification binding",
          "Harmonised standard cross-reference",
          "Market surveillance authority portal",
        ],
      },
    ],
  },
  {
    slug: "chemicals",
    label: "Chemicals & Pharmaceuticals",
    deadline: "Per ESPR + serialisation deadlines",
    regulation: "REACH + EU FMD (pharma) + ESPR",
    icon: "lock",
    lede:
      "Chemicals carry REACH, CLP, and SDS data. Pharma carries serialisation under FMD. Both sectors need per-batch passports that move with the product across borders, customers, and regulators.",
    whoItsFor:
      "Specialty chemical producers, formulators, distributors, pharma manufacturers, hospital procurement.",
    useCases: [
      {
        title: "REACH + CLP disclosure",
        body: "Per-substance registration number, per-mixture classification, and the SDS the customer needs — language and region-resolved automatically.",
        bullets: [
          "Per-substance REACH dossier link",
          "Auto-translated SDS in 24 EU languages",
          "Mixture classification engine",
          "Downstream-user notification workflow",
        ],
      },
      {
        title: "Pharma serialisation (FMD)",
        body: "Pack-level GS1 serialisation, EMVS cross-check, and the chain-of-custody every dispenser needs to verify authenticity at the patient.",
        bullets: [
          "GS1 SGTIN issuance",
          "EMVS / NMVS upload pipeline",
          "Aggregation hierarchy (item-bundle-pallet)",
          "Counterfeit-incident escalation",
        ],
      },
      {
        title: "Supply chain provenance",
        body: "API origin, intermediate manufacturer, fill-finish site — for every batch, with the full audit trail regulators and corporate buyers expect.",
        bullets: [
          "API-to-patient chain-of-custody",
          "GMP audit log per facility",
          "Cold-chain telemetry pinning",
          "Quality-event correlation per batch",
        ],
      },
      {
        title: "End-of-life + disposal routing",
        body: "Hazardous, controlled, and unused product needs the right disposal route — passport carries the right manifest to the right operator.",
        bullets: [
          "Hazardous waste routing logic",
          "Controlled-substance return manifest",
          "Take-back partner directory",
          "Disposal evidence pack for regulators",
        ],
      },
    ],
  },
];

function StickySubNav({ active }: { active: string }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 64,
        zIndex: 40,
        background: "hsl(var(--paper) / 0.95)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {industriesMenu.map((it) => {
          const isActive = it.slug === active;
          return (
            <a
              key={it.slug}
              href={`#${it.slug}`}
              data-testid={`industries-subnav-${it.slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontFamily: "var(--font-sans)",
                color: isActive ? "hsl(var(--yellow-ink))" : "var(--ink-72)",
                background: isActive ? "hsl(var(--yellow))" : "transparent",
                border: `1px solid ${isActive ? "hsl(var(--yellow))" : "var(--hairline)"}`,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background var(--dur-1) var(--ease), color var(--dur-1) var(--ease)",
              }}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function UseCaseCard({ uc, idx }: { uc: UseCase; idx: number }) {
  return (
    <div
      style={{
        padding: "24px 24px 28px",
        border: "1px solid var(--hairline)",
        background: "hsl(var(--paper))",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      data-testid={`industry-usecase-${idx}`}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Mono style={{ fontSize: 11, color: "var(--fg-muted)" }}>USE CASE / {String(idx + 1).padStart(2, "0")}</Mono>
        <Icon name="arrowR" size={14} stroke="var(--ink-72)" />
      </div>
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {uc.title}
      </h4>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-72)", margin: 0 }}>{uc.body}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {uc.bullets.map((b) => (
          <li key={b} style={{ display: "flex", gap: 8, fontSize: 13, color: "hsl(var(--ink))" }}>
            <Icon name="check" size={14} stroke="hsl(var(--ink))" style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IndustrySection({ ind, index }: { ind: IndustryBlock; index: number }) {
  const isAlt = index % 2 === 1;
  return (
    <section
      id={ind.slug}
      data-testid={`industry-section-${ind.slug}`}
      style={{
        scrollMarginTop: 128,
        background: isAlt ? "var(--ink-04)" : "hsl(var(--paper))",
        borderBottom: "1px solid var(--hairline)",
        padding: "80px 0",
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 24,
              marginBottom: 40,
            }}
            className="md:grid-cols-[1fr_360px]"
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "hsl(var(--yellow))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={ind.icon} size={20} stroke="hsl(var(--yellow-ink))" />
                </div>
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Industry / {String(index + 1).padStart(2, "0")}
                </Mono>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                {ind.label}
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "var(--ink-72)", margin: 0, maxWidth: 720 }}>
                {ind.lede}
              </p>
            </div>
            <aside
              style={{
                border: "1px solid var(--hairline)",
                background: "hsl(var(--paper))",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignSelf: "start",
              }}
            >
              <div>
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Deadline
                </Mono>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "hsl(var(--ink))", marginTop: 4 }}>
                  {ind.deadline}
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 12 }}>
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Regulation
                </Mono>
                <div style={{ fontSize: 13, color: "hsl(var(--ink))", marginTop: 4, lineHeight: 1.4 }}>
                  {ind.regulation}
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 12 }}>
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Who it&apos;s for
                </Mono>
                <div style={{ fontSize: 13, color: "var(--ink-72)", marginTop: 4, lineHeight: 1.5 }}>
                  {ind.whoItsFor}
                </div>
              </div>
            </aside>
          </div>
        </Reveal>

        <Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {ind.useCases.map((uc, i) => (
              <UseCaseCard key={uc.title} uc={uc} idx={i} />
            ))}
          </div>
        </Reveal>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Mono style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            {ind.useCases.length} use cases · live on the platform
          </Mono>
          <Link href="/book-demo">
            <a data-testid={`industry-cta-${ind.slug}`}>
              <BrandButton variant="ghost" size="sm">
                Book a {ind.label.split(" ")[0].toLowerCase()} walkthrough
                <Icon name="arrowR" size={12} />
              </BrandButton>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function IndustriesPage() {
  const [active, setActive] = React.useState<string>(industries[0].slug);

  React.useEffect(() => {
    const sections = industries
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--paper))", ...scopedYellow }}>
      <Helmet>
        <title>Industries & Use Cases — PhotonicTag</title>
        <meta
          name="description"
          content="Eight EU-regulated industries covered end-to-end: batteries, textiles, electronics, automotive, packaging, furniture, construction, chemicals & pharma. Detailed use cases, deadlines, and regulation mapping."
        />
        <link rel="canonical" href="https://www.photonictag.com/industries" />
      </Helmet>

      <PublicNavV2 />

      {/* HERO */}
      <section
        className="relative px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: 80,
          paddingBottom: 64,
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
        <div className="relative" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <Eyebrow style={{ marginBottom: 16 }}>Industries & Use Cases</Eyebrow>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.04,
                letterSpacing: "-0.04em",
                fontWeight: 600,
                margin: 0,
                marginBottom: 20,
                maxWidth: 920,
              }}
              data-testid="text-industries-hero-title"
            >
              Eight regulated industries.{" "}
              <span style={{ display: "inline-block", background: "hsl(var(--yellow))", color: "hsl(var(--yellow-ink))", padding: "0 12px", marginTop: 4 }}>
                One passport platform.
              </span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-72)", margin: 0, maxWidth: 760 }}>
              From the EU Battery Regulation to ESPR delegated acts, every product group has its own deadline, scope, and data model. PhotonicTag ships with the right schema, the right evidence, and the right disclosure — for each.
            </p>
          </Reveal>

          <div
            style={{
              marginTop: 36,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 0,
              border: "1px solid var(--hairline)",
              background: "hsl(var(--paper))",
            }}
          >
            {industries.slice(0, 4).map((ind, i) => (
              <a
                key={ind.slug}
                href={`#${ind.slug}`}
                data-testid={`industries-hero-quick-${ind.slug}`}
                style={{
                  padding: "16px 18px",
                  borderRight: i < 3 ? "1px solid var(--hairline)" : "none",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  color: "hsl(var(--ink))",
                  transition: "background var(--dur-1) var(--ease)",
                }}
                className="hover-elevate"
              >
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)" }}>{ind.deadline}</Mono>
                <span style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.3 }}>{ind.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <StickySubNav active={active} />

      {industries.map((ind, i) => (
        <IndustrySection key={ind.slug} ind={ind} index={i} />
      ))}

      {/* CTA STRIP */}
      <section
        style={{
          background: "hsl(var(--yellow))",
          borderTop: "1px solid hsl(var(--ink))",
          borderBottom: "1px solid hsl(var(--ink))",
          padding: "72px 0",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }} className="md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Mono style={{ fontSize: 11, color: "hsl(var(--yellow-ink) / 0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Pick your industry · we ship the schema
              </Mono>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(30px, 4vw, 48px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.04em",
                  fontWeight: 600,
                  color: "hsl(var(--yellow-ink))",
                  margin: 0,
                  marginBottom: 12,
                  maxWidth: 720,
                }}
                data-testid="text-industries-cta-title"
              >
                Talk to someone who has shipped a passport in your sector.
              </h2>
              <p style={{ fontSize: 16, color: "hsl(var(--yellow-ink) / 0.85)", margin: 0, maxWidth: 620 }}>
                30 minutes. We'll map your product to the right regulation, the right deadline, and the right ingest path. No deck, no salesperson — an engineer.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/book-demo">
                <a data-testid="industries-cta-book-demo">
                  <BrandButton variant="primary" size="md">
                    Book a 30-min demo
                    <Icon name="arrowR" size={14} />
                  </BrandButton>
                </a>
              </Link>
              <Link href="/platform">
                <a data-testid="industries-cta-platform">
                  <BrandButton variant="ghost" size="md">
                    See the platform
                  </BrandButton>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
