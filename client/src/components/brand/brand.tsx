import * as React from "react";
import { Icon, type IconName } from "./icon";

// Monospaced inline text — Geist Mono with tabular-nums for SKUs, GTINs,
// hashes, timestamps. Load-bearing: any data meant to be compared or
// copy-pasted goes through this.
export function Mono({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-mono)",
        letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, color, style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: color ?? "var(--fg-muted)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "ink" | "paper";
type ButtonSize = "sm" | "md" | "lg";

interface BrandButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  invert?: boolean;
  style?: React.CSSProperties;
}

export function BrandButton({
  variant = "primary",
  size = "md",
  icon,
  invert = false,
  style,
  children,
  ...rest
}: BrandButtonProps) {
  const sizes: Record<ButtonSize, { px: number; fs: number; h: number }> = {
    sm: { px: 12, fs: 13, h: 30 },
    md: { px: 14, fs: 14, h: 36 },
    lg: { px: 20, fs: 15, h: 48 },
  };
  const s = sizes[size];
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: s.h,
    padding: `0 ${s.px}px`,
    fontFamily: "var(--font-sans)",
    fontSize: s.fs,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    border: "1px solid transparent",
    borderRadius: "var(--r-0)", // sharp, per design-system non-negotiable
    cursor: "pointer",
    transition: "all var(--dur-1) var(--ease)",
    whiteSpace: "nowrap",
  };
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary:   { background: "hsl(var(--yellow))", color: "hsl(var(--yellow-ink))", borderColor: "hsl(var(--yellow))" },
    secondary: invert
      ? { background: "transparent", color: "hsl(var(--paper))", borderColor: "var(--paper-24)" }
      : { background: "hsl(var(--paper))", color: "hsl(var(--ink))", borderColor: "var(--ink-24)" },
    ghost:     invert
      ? { background: "transparent", color: "hsl(var(--paper))", borderColor: "transparent" }
      : { background: "transparent", color: "hsl(var(--ink))",   borderColor: "transparent" },
    ink:       { background: "hsl(var(--ink))",   color: "hsl(var(--paper))", borderColor: "hsl(var(--ink))" },
    paper:     { background: "hsl(var(--paper))", color: "hsl(var(--ink))",   borderColor: "hsl(var(--paper))" },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
      {icon && <Icon name={icon} size={14} />}
    </button>
  );
}

type BadgeTone = "default" | "accent" | "solid";

export function BrandBadge({
  children,
  tone = "default",
  invert = false,
  style,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  invert?: boolean;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 8px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "-0.01em",
    borderRadius: "var(--r-0)",
    border: "1px solid",
    whiteSpace: "nowrap",
  };
  const tones: Record<BadgeTone, React.CSSProperties> = {
    default: invert
      ? { color: "var(--paper-72)", background: "transparent", borderColor: "var(--paper-24)" }
      : { color: "var(--ink-72)",   background: "transparent", borderColor: "var(--ink-24)" },
    accent:  { color: "hsl(var(--yellow-ink))", background: "hsl(var(--yellow))", borderColor: "hsl(var(--yellow))" },
    solid:   { color: "hsl(var(--paper))", background: "hsl(var(--ink))", borderColor: "hsl(var(--ink))" },
  };
  return <span style={{ ...base, ...tones[tone], ...style }}>{children}</span>;
}

// Square stamp mark — ink frame, yellow fill, ink inner, yellow dot.
// Invert flips paper/ink for dark surfaces.
export function BrandMark({ size = 28, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", flexShrink: 0 }}>
      <rect width="64" height="64" fill={invert ? "#FFFFFF" : "#000000"} />
      <rect x="12" y="12" width="40" height="40" fill={invert ? "#000000" : "#FFE600"} />
      <rect x="22" y="22" width="20" height="20" fill={invert ? "#FFFFFF" : "#000000"} />
      <rect x="28" y="28" width="8" height="8" fill={invert ? "#000000" : "#FFE600"} />
    </svg>
  );
}

export function Wordmark({ size = 22, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <BrandMark size={size * 1.18} invert={invert} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size,
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: invert ? "hsl(var(--ink))" : "hsl(var(--paper))",
        }}
      >
        photonictag
      </span>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 20,
        padding: "0 5px",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--fg-muted)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-0)",
        background: "hsl(var(--paper))",
      }}
    >
      {children}
    </span>
  );
}

export function DotDivider() {
  return <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-24)", flexShrink: 0 }} />;
}
