import * as React from "react";

export type IconName =
  | "arrowR" | "arrowUR" | "check" | "x" | "plus" | "minus"
  | "chev" | "chevR" | "dot" | "search" | "bolt" | "qr"
  | "doc" | "shield" | "lock" | "bell" | "menu" | "grid"
  | "eye" | "ext" | "terminal";

interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 16, stroke = "currentColor", strokeWidth = 1.75, style, ...rest }: IconProps) {
  const p = {
    fill: "none",
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, React.ReactNode> = {
    arrowR:   <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    arrowUR:  <path d="M7 17L17 7M9 7h8v8" {...p} />,
    check:    <path d="M5 12l5 5 9-11" {...p} />,
    x:        <path d="M6 6l12 12M18 6L6 18" {...p} />,
    plus:     <path d="M12 5v14M5 12h14" {...p} />,
    minus:    <path d="M5 12h14" {...p} />,
    chev:     <path d="M6 9l6 6 6-6" {...p} />,
    chevR:    <path d="M9 6l6 6-6 6" {...p} />,
    dot:      <circle cx="12" cy="12" r="4" fill={stroke as string} stroke="none" />,
    search:   <><circle cx="11" cy="11" r="7" {...p} /><path d="M20 20l-4-4" {...p} /></>,
    bolt:     <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" {...p} />,
    qr:       <><rect x="3" y="3" width="7" height="7" {...p} /><rect x="14" y="3" width="7" height="7" {...p} /><rect x="3" y="14" width="7" height="7" {...p} /><path d="M14 14h3v3h-3zM20 14v3M14 20h7M20 20v0" {...p} /></>,
    doc:      <><path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" {...p} /><path d="M14 3v5h5" {...p} /></>,
    shield:   <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" {...p} />,
    lock:     <><rect x="5" y="11" width="14" height="10" rx="1" {...p} /><path d="M8 11V8a4 4 0 118 0v3" {...p} /></>,
    bell:     <><path d="M6 8a6 6 0 1112 0c0 5 2 6 2 8H4c0-2 2-3 2-8z" {...p} /><path d="M10 21a2 2 0 004 0" {...p} /></>,
    menu:     <path d="M4 6h16M4 12h16M4 18h16" {...p} />,
    grid:     <><rect x="4" y="4" width="7" height="7" {...p} /><rect x="13" y="4" width="7" height="7" {...p} /><rect x="4" y="13" width="7" height="7" {...p} /><rect x="13" y="13" width="7" height="7" {...p} /></>,
    eye:      <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    ext:      <path d="M14 4h6v6M10 14L20 4M19 13v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5" {...p} />,
    terminal: <path d="M4 7l5 5-5 5M12 17h8" {...p} />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "-0.15em", ...style }}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
