// Motion primitives — restrained, brand-safe. All respect prefers-reduced-motion.
//
// Exports:
//   <Tilt>       — 3D tilt on hover, CSS-only perspective, no framework
//   <Reveal>     — opacity + 8px translate on enter, one-shot IntersectionObserver
//   <Marquee>    — infinite mono ticker (single direction, no blur)
//   <HoverGrain> — canvas grain overlay (for hero backgrounds)

// ── Tilt ────────────────────────────────────────────────────
// Wraps children in a perspective container. Tracks cursor, applies
// rotateX/rotateY. Max 5° tilt — subtle, not a gimmick.
const Tilt = ({ children, max = 5, scale = 1.01, style = {} }) => {
  const ref = React.useRef(null);
  const [t, setT] = React.useState({rx: 0, ry: 0, s: 1});

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;  // 0..1
      const py = (e.clientY - r.top)  / r.height;
      setT({
        rx: (0.5 - py) * max * 2,   // up-down
        ry: (px - 0.5) * max * 2,   // left-right
        s: scale,
      });
    };
    const onLeave = () => setT({rx: 0, ry: 0, s: 1});
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [max, scale]);

  return (
    <div ref={ref} style={{perspective: '1200px', ...style}}>
      <div style={{
        transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.s})`,
        transformStyle: 'preserve-3d',
        transition: 'transform 220ms var(--ease)',
        willChange: 'transform',
      }}>{children}</div>
    </div>
  );
};

// ── Reveal ──────────────────────────────────────────────────
// Intersection-observer driven opacity+translate fade-in.
const Reveal = ({ children, delay = 0, y = 8, as: As = 'div', style = {}, ...rest }) => {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const el = ref.current; if (!el) return;
    // If element is already in view on mount, show it immediately (next frame).
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => setShown(true));
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, {rootMargin: '0px 0px -10% 0px', threshold: 0.01});
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <As ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : `translateY(${y}px)`,
      transition: `opacity 600ms var(--ease) ${delay}ms, transform 600ms var(--ease) ${delay}ms`,
      ...style,
    }} {...rest}>{children}</As>
  );
};

// ── Marquee ─────────────────────────────────────────────────
// Infinite horizontal ticker. Pure CSS animation. Pauses on hover.
const Marquee = ({ children, speed = 40, style = {} }) => (
  <div style={{overflow: 'hidden', position: 'relative', ...style}}>
    <div className="pt-marq" style={{
      display: 'flex',
      whiteSpace: 'nowrap',
      willChange: 'transform',
      animation: `pt-marq ${speed}s linear infinite`,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 48, paddingRight: 48}}>{children}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 48, paddingRight: 48}} aria-hidden>{children}</div>
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

// ── GrainLayer ──────────────────────────────────────────────
// Subtle film grain overlay — absolutely positioned inside a parent.
// Rendered once into a canvas, repeated via background-image.
const GrainLayer = ({ opacity = 0.06, invert = false, style = {} }) => {
  const [bg, setBg] = React.useState('');
  React.useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const x = c.getContext('2d');
    const img = x.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() < 0.5 ? 0 : 255;
      const a = Math.random() * 60;
      img.data[i] = img.data[i+1] = img.data[i+2] = invert ? (255 - v) : v;
      img.data[i+3] = a;
    }
    x.putImageData(img, 0, 0);
    setBg(c.toDataURL('image/png'));
  }, [invert]);
  return (
    <div aria-hidden style={{
      position:'absolute', inset:0, pointerEvents:'none',
      backgroundImage: bg ? `url(${bg})` : 'none',
      opacity, mixBlendMode: invert ? 'screen' : 'multiply',
      ...style,
    }}/>
  );
};

Object.assign(window, { Tilt, Reveal, Marquee, GrainLayer });
