import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Eyebrow, Mono, BrandBadge, BrandButton } from "@/components/brand/brand";
import { Icon } from "@/components/brand/icon";
import { Reveal } from "@/components/brand/motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import {
  demoProduct,
  demoTraceEvents,
  demoRegionalExtensions,
  demoAIInsights,
  getCategoryDeadline,
} from "@/lib/demo-passport";
import type {
  Product,
  TraceEvent,
  QRCode as QRCodeType,
  DppRegionalExtension,
  AIInsight,
} from "@shared/schema";

/* ------------------------------------------------------------ *
 * public-scan-v2 — canonical consumer passport page
 * -----------------------------------------------------------
 * Mounted at /product/:id (and /product/demo for the static
 * demo fixture). Photonictag design system: ink / paper /
 * yellow only, sharp corners, hairline elevation, Geist.
 *
 * Consumer-engagement layer: registration dialog (warranty
 * activation), share buttons (copy / WhatsApp / LinkedIn),
 * regulatory deadline banner driven by product category.
 * ------------------------------------------------------------ */

const regionFlags: Record<string, string> = {
  EU: "EU", CN: "CN", US: "US", IN: "IN", OTHER: "GLOBAL",
};
const regionNames: Record<string, string> = {
  EU: "European Union", CN: "China", US: "United States", IN: "India", OTHER: "Other markets",
};
const eventLabels: Record<string, string> = {
  manufactured: "Manufactured",
  shipped: "Shipped",
  received: "Received",
  transferred: "Transferred",
  inspected: "Quality inspected",
  repaired: "Repaired",
  recycled: "Recycled",
  disposed: "End of life",
  custom: "Event",
};

interface PublicScanV2Props {
  isDemo?: boolean;
}

export default function PublicScanV2({ isDemo: isDemoProp = false }: PublicScanV2Props) {
  const params = useParams<{ id: string }>();
  // /product/demo also triggers demo mode (matches the legacy v1 contract).
  const isDemo = isDemoProp || params.id === "demo";

  const { data: fetchedProduct, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
    enabled: !isDemo && !!params.id,
  });

  const { data: fetchedTraceEvents } = useQuery<TraceEvent[]>({
    queryKey: ["/api/products", params.id, "trace"],
    enabled: !isDemo && !!params.id,
  });

  const { data: qrCode } = useQuery<QRCodeType>({
    queryKey: ["/api/products", params.id, "qr"],
    enabled: !isDemo && !!params.id,
  });

  const { data: fetchedRegionalExtensions } = useQuery<DppRegionalExtension[]>({
    queryKey: ["/api/products", params.id, "regional-extensions"],
    enabled: !isDemo && !!params.id,
  });

  const { data: fetchedAIInsights } = useQuery<AIInsight[]>({
    queryKey: ["/api/products", params.id, "insights"],
    enabled: !isDemo && !!params.id,
  });

  // Demo mode swaps in the static fixture so /product/demo works without a
  // backend round-trip (same contract as legacy v1 page).
  const product = isDemo ? (demoProduct as Product) : fetchedProduct;
  const traceEvents = isDemo ? (demoTraceEvents as TraceEvent[]) : fetchedTraceEvents;
  const regionalExtensions = isDemo ? (demoRegionalExtensions as DppRegionalExtension[]) : fetchedRegionalExtensions;
  const aiInsights = isDemo ? (demoAIInsights as AIInsight[]) : fetchedAIInsights;

  // Track scan (skipped in demo mode to keep analytics clean)
  useEffect(() => {
    if (!isDemo && params.id && params.id !== "demo") {
      let sid = sessionStorage.getItem("pt_sid");
      if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem("pt_sid", sid); }
      fetch(`/api/products/${params.id}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      }).catch(() => {});
    }
  }, [params.id, isDemo]);

  // ── Consumer engagement state: registration dialog + share/copy
  const [showRegister, setShowRegister] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [regForm, setRegForm] = useState({
    ownerName: "",
    ownerEmail: "",
    purchaseDate: "",
    purchaseLocation: "",
    warrantyActivated: true,
    marketingOptIn: false,
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleRegister = async () => {
    if (!product?.id || isDemo) return;
    setRegSubmitting(true);
    try {
      await apiRequest("POST", `/api/products/${product.id}/register`, regForm);
      setRegDone(true);
    } catch {
      // Soft-fail: keep the form open so the user can retry.
    } finally {
      setRegSubmitting(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const deadline = useMemo(
    () => (product ? getCategoryDeadline(product.productCategory ?? null) : null),
    [product?.productCategory],
  );

  const summaryInsight = aiInsights?.find(i => i.insightType === "summary")?.content as
    { headline?: string; keyPoints?: string[] } | undefined;
  const sustainabilityInsight = aiInsights?.find(i => i.insightType === "sustainability")?.content as
    { overallScore?: number } | undefined;
  const circularityInsight = aiInsights?.find(i => i.insightType === "circularity")?.content as
    { score?: number; grade?: string } | undefined;
  const riskInsight = aiInsights?.find(i => i.insightType === "risk_assessment")?.content as
    { overallRisk?: string; dataCompleteness?: number } | undefined;

  const version = useMemo(() => "v1.0.0", []);
  const updatedShort = useMemo(() => {
    if (!product?.updatedAt) return "—";
    const d = new Date(product.updatedAt as unknown as string);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }, [product?.updatedAt]);

  if (!isDemo && isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "hsl(var(--paper))" }}>
        <PublicNav />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px" }}>
          <Eyebrow>Loading passport</Eyebrow>
        </div>
      </div>
    );
  }

  if (!isDemo && (error || !product)) {
    return (
      <div style={{ minHeight: "100vh", background: "hsl(var(--paper))" }}>
        <PublicNav />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <Eyebrow>404 · passport</Eyebrow>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "hsl(var(--ink))",
            marginTop: 16,
          }}>
            This passport doesn't exist
          </h1>
          <div style={{ marginTop: 24 }}>
            <Link href="/">
              <BrandButton variant="ink">Return home</BrandButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const heroFields: Array<[string, React.ReactNode]> = [
    ["Composition", product.materials
      ? (product.materials.length > 40 ? product.materials.slice(0, 40) + "…" : product.materials)
      : "—"],
    ["Origin", product.countryOfOrigin ?? "—"],
    ["Recyclability", product.recyclabilityPercent ? `${product.recyclabilityPercent}%` : (circularityInsight?.grade ? `Grade ${circularityInsight.grade}` : "—")],
    ["Hazards", product.hazardousMaterials ? "Declared" : "None"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--paper))", color: "hsl(var(--ink))" }}>
      <PublicNav />

      {isDemo && (
        <div style={{ background: "hsl(var(--yellow))", color: "hsl(var(--yellow-ink))", marginTop: 64 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <Mono style={{ fontSize: 12 }}>This is an example passport · see how photonictag can work for your products.</Mono>
            <Link href="/book-demo">
              <BrandButton variant="ink" size="sm">Book a demo</BrandButton>
            </Link>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: isDemo ? "32px 24px 96px" : "96px 24px" }}>

        {/* ───── Compliance deadline banner (regulatory urgency) ───── */}
        {deadline && (
          <Reveal>
            <div
              style={{
                marginBottom: 28,
                padding: "16px 20px",
                background: deadline.urgent ? "hsl(var(--ink))" : "var(--ink-04)",
                color: deadline.urgent ? "hsl(var(--paper))" : "hsl(var(--ink))",
                border: `1px solid ${deadline.urgent ? "hsl(var(--ink))" : "var(--hairline)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
              data-testid="banner-compliance-deadline"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Icon
                  name="bolt"
                  size={18}
                  stroke={deadline.urgent ? "hsl(var(--yellow))" : "hsl(var(--ink))"}
                />
                <div>
                  <Mono style={{ fontSize: 11, color: deadline.urgent ? "var(--paper-72)" : "var(--fg-muted)" }}>
                    EU compliance deadline
                  </Mono>
                  <div style={{ fontSize: 14, marginTop: 2 }}>
                    <strong>{deadline.date}</strong> · {deadline.description}
                  </div>
                </div>
              </div>
              {deadline.urgent && (
                <BrandBadge tone="accent">Action required</BrandBadge>
              )}
            </div>
          </Reveal>
        )}

        {/* ───── Hero row: dark editor surface + yellow QR chip ───── */}
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28 }}>

            {/* Editor preview (dark) */}
            <div style={{ background: "hsl(var(--ink))", border: "1px solid var(--paper-12)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <Eyebrow color="var(--paper-56)">{product.manufacturer}</Eyebrow>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 40,
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    color: "hsl(var(--paper))",
                    marginTop: 8,
                    lineHeight: 1.05,
                  }} data-testid="text-public-product-name-v2">
                    {product.productName}
                  </div>
                  <Mono style={{ fontSize: 12, color: "var(--paper-56)", marginTop: 10, display: "block" }}>
                    {[product.sku, product.batchNumber, version].filter(Boolean).join(" · ")}
                  </Mono>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <BrandBadge tone="accent">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(var(--ink))" }} />
                    Live
                  </BrandBadge>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                marginTop: 28,
                borderTop: "1px solid var(--paper-12)",
              }}>
                {heroFields.map(([k, v], i) => (
                  <div key={i} style={{
                    padding: "16px 16px 16px 0",
                    borderRight: i < heroFields.length - 1 ? "1px solid var(--paper-12)" : "none",
                  }}>
                    <Eyebrow color="var(--paper-40)" style={{ fontSize: 10 }}>{k}</Eyebrow>
                    <div style={{ color: "hsl(var(--paper))", fontSize: 14, marginTop: 6 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yellow QR chip */}
            <div style={{
              background: "hsl(var(--yellow))",
              color: "hsl(var(--yellow-ink))",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div>
                <Eyebrow color="hsl(var(--yellow-ink))">Scan to view</Eyebrow>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  marginTop: 8,
                }}>
                  Consumer passport
                </div>
              </div>
              <div style={{ background: "hsl(var(--paper))", padding: 14, margin: "20px 0" }}>
                {(product.qrCodeData || qrCode?.qrImageUrl) ? (
                  <img
                    src={product.qrCodeData || qrCode?.qrImageUrl || ""}
                    alt="QR"
                    style={{ width: "100%", aspectRatio: "1/1", display: "block", objectFit: "contain" }}
                    data-testid="img-qr-code-v2"
                  />
                ) : (
                  <div style={{
                    aspectRatio: "1/1",
                    background: "repeating-conic-gradient(hsl(var(--ink)) 0% 25%, hsl(var(--paper)) 0% 50%) 0 0/16px 16px",
                    border: "3px solid hsl(var(--ink))",
                  }} />
                )}
              </div>
              <Mono style={{ fontSize: 11 }}>
                {typeof window !== "undefined" ? window.location.host : "photonictag.eu"}/product/{params.id}
              </Mono>
            </div>
          </div>
        </Reveal>

        {/* ───── Metrics row ───── */}
        <Reveal delay={80}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginTop: 28,
            border: "1px solid var(--hairline)",
          }}>
            {[
              { label: "Carbon", value: product.carbonFootprint ?? "—", unit: product.carbonFootprint ? "kg CO2e" : "" },
              { label: "Repairability", value: product.repairabilityScore ?? "—", unit: product.repairabilityScore ? "/10" : "" },
              { label: "Circularity", value: circularityInsight?.grade ?? (product.recyclabilityPercent ? `${product.recyclabilityPercent}%` : "—"), unit: circularityInsight?.score ? `/${100}` : "" },
              { label: "Risk", value: riskInsight?.overallRisk ?? "Low", unit: riskInsight?.dataCompleteness ? `${riskInsight.dataCompleteness}% complete` : "" },
            ].map((m, i) => (
              <div key={i} style={{
                padding: 28,
                borderRight: i < 3 ? "1px solid var(--hairline)" : "none",
              }}>
                <Eyebrow>{m.label}</Eyebrow>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 44,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  marginTop: 12,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>{m.value}</div>
                {m.unit && <Mono style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 8, display: "block" }}>{m.unit}</Mono>}
              </div>
            ))}
          </div>
        </Reveal>

        {/* ───── Two-column: identity + AI summary ───── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28, marginTop: 28 }}>
          <Reveal delay={120}>
            <section style={{ border: "1px solid var(--hairline)", padding: 28 }}>
              <Eyebrow>Product identity</Eyebrow>
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
                {[
                  ["Manufacturer", product.manufacturer],
                  ["Origin", product.countryOfOrigin ?? "—"],
                  ["Model / SKU", <Mono key="sku">{product.modelNumber ?? product.sku ?? product.batchNumber ?? "—"}</Mono>],
                  ["Manufactured", product.dateOfManufacture
                    ? new Date(product.dateOfManufacture as unknown as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"],
                  ["Category", product.productCategory ?? "General"],
                  ["Updated", <Mono key="upd">{updatedShort}</Mono>],
                ].map(([k, v], i) => (
                  <div key={i}>
                    <Eyebrow style={{ fontSize: 10 }}>{k as string}</Eyebrow>
                    <div style={{ marginTop: 6, fontSize: 15, color: "hsl(var(--ink))" }}>{v}</div>
                  </div>
                ))}
              </div>
              {product.manufacturerAddress && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--hairline-soft)" }}>
                  <Eyebrow style={{ fontSize: 10 }}>Address</Eyebrow>
                  <div style={{ marginTop: 6, fontSize: 13, color: "var(--fg-muted)" }}>{product.manufacturerAddress}</div>
                </div>
              )}
            </section>
          </Reveal>

          <Reveal delay={160}>
            <section style={{
              border: "1px solid hsl(var(--ink))",
              background: "hsl(var(--ink))",
              color: "hsl(var(--paper))",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "100%",
            }}>
              <div>
                <Eyebrow color="var(--paper-56)">AI summary</Eyebrow>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  marginTop: 12,
                  lineHeight: 1.2,
                }}>
                  {summaryInsight?.headline ?? product.productName}
                </div>
              </div>
              {summaryInsight?.keyPoints && summaryInsight.keyPoints.length > 0 && (
                <ul style={{ marginTop: 20, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {summaryInsight.keyPoints.slice(0, 4).map((pt, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--paper-72)" }}>
                      <Icon name="check" size={14} stroke="hsl(var(--yellow))" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        </div>

        {/* ───── Material breakdown ───── */}
        {product.materialBreakdown && Array.isArray(product.materialBreakdown) && (product.materialBreakdown as any[]).length > 0 && (
          <Reveal delay={200}>
            <section style={{ border: "1px solid var(--hairline)", padding: 28, marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                <Eyebrow>Materials &middot; composition</Eyebrow>
                {product.recycledContentPercent != null && (
                  <BrandBadge tone="default">
                    <Mono>{product.recycledContentPercent}% recycled</Mono>
                  </BrandBadge>
                )}
              </div>
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                {(product.materialBreakdown as Array<{ material: string; percentage: number; recyclable?: boolean }>).map((m, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      {m.material}
                      {m.recyclable && <Icon name="check" size={12} stroke="hsl(var(--ink))" />}
                    </div>
                    <div style={{ height: 6, background: "var(--ink-08)", position: "relative" }}>
                      <div style={{
                        position: "absolute",
                        inset: "0 auto 0 0",
                        width: `${Math.min(100, Math.max(0, m.percentage))}%`,
                        background: "hsl(var(--ink))",
                      }} />
                    </div>
                    <Mono style={{ fontSize: 12, textAlign: "right", color: "var(--fg-muted)" }}>{m.percentage}%</Mono>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ───── Trace timeline ───── */}
        {traceEvents && traceEvents.length > 0 && (
          <Reveal delay={240}>
            <section style={{ border: "1px solid var(--hairline)", padding: 28, marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                <Eyebrow>Product journey</Eyebrow>
                <Mono style={{ fontSize: 11, color: "var(--fg-muted)" }}>{traceEvents.length} events</Mono>
              </div>
              <div style={{ marginTop: 24 }}>
                {traceEvents.map((event, i) => (
                  <div key={event.id} style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 1fr",
                    padding: "18px 0",
                    borderTop: i === 0 ? "1px solid var(--hairline)" : "none",
                    borderBottom: "1px solid var(--hairline-soft)",
                    alignItems: "start",
                    gap: 24,
                  }} data-testid={`public-trace-event-v2-${event.id}`}>
                    <Mono style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                      {new Date(event.timestamp as unknown as string).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </Mono>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {eventLabels[event.eventType] ?? event.eventType}
                      </div>
                      {event.description && (
                        <div style={{ marginTop: 4, fontSize: 13, color: "var(--fg-muted)" }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <Mono style={{ fontSize: 12 }}>{event.actor}</Mono>
                      {event.location && (
                        <Mono style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                          {typeof event.location === "object" && (event.location as { name?: string }).name
                            ? (event.location as { name: string }).name
                            : String(event.location)}
                        </Mono>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ───── Regional compliance ───── */}
        {regionalExtensions && regionalExtensions.length > 0 && (
          <Reveal delay={280}>
            <section style={{ border: "1px solid var(--hairline)", padding: 28, marginTop: 28 }}>
              <Eyebrow>Regional compliance</Eyebrow>
              <div style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(4, regionalExtensions.length)}, 1fr)`,
                borderTop: "1px solid var(--hairline)",
              }}>
                {regionalExtensions.map((ext, i) => (
                  <div key={ext.regionCode} style={{
                    padding: "20px 16px 20px 0",
                    borderRight: i < regionalExtensions.length - 1 ? "1px solid var(--hairline)" : "none",
                  }}>
                    <Mono style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--fg-muted)" }}>
                      {regionFlags[ext.regionCode] ?? ext.regionCode}
                    </Mono>
                    <div style={{ fontSize: 14, marginTop: 8 }}>{regionNames[ext.regionCode] ?? ext.regionCode}</div>
                    <div style={{ marginTop: 12 }}>
                      <BrandBadge tone={ext.complianceStatus === "compliant" ? "accent" : "default"}>
                        {ext.complianceStatus === "compliant" ? "Compliant" : "Pending"}
                      </BrandBadge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ───── Register + share (consumer engagement layer) ───── */}
        {!isDemo && (
          <Reveal delay={300}>
            <section
              style={{
                marginTop: 28,
                padding: 28,
                border: "1px solid var(--hairline)",
                background: "var(--ink-04)",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 24,
                alignItems: "center",
              }}
              data-testid="section-register-share-v2"
            >
              <div>
                <Eyebrow>Register this product</Eyebrow>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  marginTop: 8,
                  lineHeight: 1.2,
                }}>
                  Activate your warranty and get end-of-life recycling reminders.
                </div>
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <Mono style={{ fontSize: 12, color: "var(--fg-muted)" }}>Share this passport</Mono>
                  <BrandButton
                    variant="secondary"
                    size="sm"
                    onClick={copyShareLink}
                    data-testid="button-share-copy-v2"
                  >
                    <Icon name={linkCopied ? "check" : "doc"} size={12} />
                    {linkCopied ? "Copied" : "Copy link"}
                  </BrandButton>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent("Verified product passport: " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="button-share-whatsapp-v2"
                    style={{ textDecoration: "none" }}
                  >
                    <BrandButton variant="secondary" size="sm">
                      <Icon name="ext" size={12} /> WhatsApp
                    </BrandButton>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="button-share-linkedin-v2"
                    style={{ textDecoration: "none" }}
                  >
                    <BrandButton variant="secondary" size="sm">
                      <Icon name="ext" size={12} /> LinkedIn
                    </BrandButton>
                  </a>
                </div>
              </div>
              <BrandButton
                variant="primary"
                size="md"
                onClick={() => setShowRegister(true)}
                data-testid="button-register-product-v2"
              >
                Register ownership <Icon name="arrowR" size={14} />
              </BrandButton>
            </section>
          </Reveal>
        )}

        {/* ───── CTA strip ───── */}
        <Reveal delay={320}>
          <section style={{
            marginTop: 28,
            padding: 28,
            background: "hsl(var(--ink))",
            color: "hsl(var(--paper))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}>
            <div>
              <Eyebrow color="var(--paper-56)">Verified passport</Eyebrow>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginTop: 8,
              }}>
                This is a live photonictag passport.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/book-demo">
                <BrandButton variant="primary">Book a demo</BrandButton>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>

      {/* ── Registration dialog ───────────────────────────────── */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register this product</DialogTitle>
            <DialogDescription>
              Activate your warranty and get recycling reminders when this product reaches end of life.
            </DialogDescription>
          </DialogHeader>

          {regDone ? (
            <div className="text-center py-8 space-y-3" data-testid="state-registration-done-v2">
              <div className="text-lg font-semibold">Registered.</div>
              <p className="text-sm text-muted-foreground">
                Your warranty is active. We'll remind you when it's time to recycle this product responsibly.
              </p>
              <BrandButton
                variant="ink"
                size="sm"
                onClick={() => { setShowRegister(false); setRegDone(false); }}
                data-testid="button-reg-done-v2"
              >
                Done
              </BrandButton>
            </div>
          ) : (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reg-name-v2">Name</Label>
                  <Input
                    id="reg-name-v2"
                    className="mt-1"
                    value={regForm.ownerName}
                    onChange={e => setRegForm(f => ({ ...f, ownerName: e.target.value }))}
                    placeholder="Jane Smith"
                    data-testid="input-reg-name-v2"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email-v2">Email</Label>
                  <Input
                    id="reg-email-v2"
                    className="mt-1"
                    type="email"
                    value={regForm.ownerEmail}
                    onChange={e => setRegForm(f => ({ ...f, ownerEmail: e.target.value }))}
                    placeholder="jane@example.com"
                    data-testid="input-reg-email-v2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reg-date-v2">Purchase date</Label>
                  <Input
                    id="reg-date-v2"
                    className="mt-1"
                    type="date"
                    value={regForm.purchaseDate}
                    onChange={e => setRegForm(f => ({ ...f, purchaseDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reg-location-v2">Where purchased</Label>
                  <Input
                    id="reg-location-v2"
                    className="mt-1"
                    value={regForm.purchaseLocation}
                    onChange={e => setRegForm(f => ({ ...f, purchaseLocation: e.target.value }))}
                    placeholder="Amazon, Best Buy…"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-1 text-sm">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded mt-0.5"
                    checked={regForm.warrantyActivated}
                    onChange={e => setRegForm(f => ({ ...f, warrantyActivated: e.target.checked }))}
                    data-testid="checkbox-warranty-v2"
                  />
                  <span>Activate warranty registration</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded mt-0.5"
                    checked={regForm.marketingOptIn}
                    onChange={e => setRegForm(f => ({ ...f, marketingOptIn: e.target.checked }))}
                    data-testid="checkbox-marketing-v2"
                  />
                  <span>Receive product updates from {product?.manufacturer}</span>
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <BrandButton variant="secondary" size="sm" onClick={() => setShowRegister(false)}>
                  Cancel
                </BrandButton>
                <BrandButton
                  variant="ink"
                  size="sm"
                  onClick={handleRegister}
                  disabled={regSubmitting || !regForm.ownerName || !regForm.ownerEmail}
                  data-testid="button-reg-submit-v2"
                >
                  {regSubmitting ? "Registering…" : "Register"}
                </BrandButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
