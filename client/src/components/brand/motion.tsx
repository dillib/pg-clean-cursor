import * as React from "react";

// Intersection-observer driven opacity+translate fade-in.
// Respects prefers-reduced-motion by showing content immediately.
export function Reveal({
  children,
  delay = 0,
  y = 8,
  as: As = "div",
  style,
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => setShown(true));
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = As as any;
  return (
    <Component
      ref={ref as any}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity 600ms var(--ease) ${delay}ms, transform 600ms var(--ease) ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

// Infinite horizontal ticker. Pauses on hover. Reduced-motion disables animation.
export function Marquee({
  children,
  speed = 40,
  style,
}: {
  children: React.ReactNode;
  speed?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ overflow: "hidden", position: "relative", ...style }}>
      <div
        className="pt-marq"
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          willChange: "transform",
          animation: `pt-marq ${speed}s linear infinite`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48, paddingRight: 48 }}>{children}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 48, paddingRight: 48 }} aria-hidden>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes pt-marq { to { transform: translateX(-50%); } }
        .pt-marq:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .pt-marq { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
