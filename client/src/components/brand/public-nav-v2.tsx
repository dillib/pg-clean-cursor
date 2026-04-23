import * as React from "react";
import { Link, useLocation } from "wouter";
import { QrCode } from "lucide-react";
import { BrandButton } from "./brand";
import { Icon } from "./icon";

/* ------------------------------------------------------------ *
 * public-nav-v2
 * ------------------------------------------------------------
 * Photonictag-system nav for the new public pages (landing-v2,
 * /platform, /industries). Hairline, sharp, ink on paper.
 * Includes an Industries & Use Cases dropdown — hover on desktop,
 * click to toggle on keyboard / small screens.
 * ------------------------------------------------------------ */

export const industriesMenu: { slug: string; label: string; deadline: string }[] = [
  { slug: "batteries", label: "Batteries & Energy Storage", deadline: "Feb 2027" },
  { slug: "textiles", label: "Textiles & Fashion", deadline: "Late 2027" },
  { slug: "electronics", label: "Consumer Electronics", deadline: "2027–2028" },
  { slug: "automotive", label: "Automotive & EV Components", deadline: "Rolling" },
  { slug: "packaging", label: "Industrial Packaging", deadline: "2028" },
  { slug: "furniture", label: "Furniture & Home Goods", deadline: "2028–2029" },
  { slug: "construction", label: "Construction Materials", deadline: "2029–2030" },
  { slug: "chemicals", label: "Chemicals & Pharmaceuticals", deadline: "Per ESPR" },
];

function NavLogo() {
  return (
    <Link href="/">
      <div
        className="flex items-center gap-2 cursor-pointer"
        data-testid="nav-v2-logo"
      >
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shadow-sm">
          <QrCode className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">PhotonicTag</span>
      </div>
    </Link>
  );
}

export function PublicNavV2() {
  const [loc] = useLocation();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const openNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const linkStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 14,
    fontFamily: "var(--font-sans)",
    color: "hsl(var(--ink))",
    textDecoration: "none",
    padding: "6px 2px",
    borderBottom: `2px solid ${active ? "hsl(var(--yellow))" : "transparent"}`,
    transition: "color var(--dur-1) var(--ease)",
    whiteSpace: "nowrap",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "hsl(var(--paper) / 0.92)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <NavLogo />

        <div className="hidden md:flex" style={{ alignItems: "center", gap: 28 }}>
          <Link href="/platform">
            <a style={linkStyle(loc === "/platform")} data-testid="nav-v2-link-platform">
              Platform
            </a>
          </Link>

          <div
            ref={wrapRef}
            onMouseEnter={openNow}
            onMouseLeave={scheduleClose}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              style={{
                ...linkStyle(loc.startsWith("/industries")),
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
              data-testid="nav-v2-btn-industries"
            >
              Industries
              <Icon name="chev" size={14} stroke="hsl(var(--ink))" />
            </button>

            {open && (
              <div
                role="menu"
                onMouseEnter={openNow}
                onMouseLeave={scheduleClose}
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  minWidth: 380,
                  background: "hsl(var(--paper))",
                  border: "1px solid var(--hairline)",
                  boxShadow: "var(--lift-2)",
                  padding: 8,
                  zIndex: 60,
                }}
                data-testid="nav-v2-menu-industries"
              >
                <div
                  style={{
                    padding: "8px 10px 6px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--ink-72)",
                  }}
                >
                  Explore by industry
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  {industriesMenu.map((it) => (
                    <Link key={it.slug} href={`/industries#${it.slug}`}>
                      <a
                        onClick={() => setOpen(false)}
                        data-testid={`nav-v2-industry-${it.slug}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          padding: "10px 12px",
                          textDecoration: "none",
                          color: "hsl(var(--ink))",
                          transition: "background var(--dur-1) var(--ease)",
                        }}
                        className="hover-elevate"
                      >
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{it.label}</span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--ink-72)",
                          }}
                        >
                          {it.deadline}
                        </span>
                      </a>
                    </Link>
                  ))}
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--hairline)",
                    marginTop: 6,
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link href="/industries">
                    <a
                      onClick={() => setOpen(false)}
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "hsl(var(--ink))",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      data-testid="nav-v2-industry-all"
                    >
                      All industries
                      <Icon name="arrowR" size={12} />
                    </a>
                  </Link>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--ink-72)",
                    }}
                  >
                    {industriesMenu.length} sectors
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link href="/pricing">
            <a style={linkStyle(loc === "/pricing")} data-testid="nav-v2-link-pricing">
              Pricing
            </a>
          </Link>
          <Link href="/contact">
            <a style={linkStyle(loc === "/contact")} data-testid="nav-v2-link-contact">
              Contact
            </a>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login">
            <a style={{ fontSize: 14, color: "hsl(var(--ink))", textDecoration: "none" }} data-testid="nav-v2-signin">
              Sign in
            </a>
          </Link>
          <Link href="/book-demo">
            <a data-testid="nav-v2-book-demo">
              <BrandButton variant="primary" size="sm">
                Book a demo
              </BrandButton>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
