// Primitives — shared across all UI kits. Three colors only.
// Expects colors_and_type.css loaded on the page.

// ── Icon ───────────────────────────────────────────────────
const Icon = ({ name, size = 16, stroke = 'currentColor', strokeWidth = 1.75, style = {} }) => {
  const p = { fill: 'none', stroke, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    arrowR:  <path d="M5 12h14M13 6l6 6-6 6" {...p}/>,
    arrowUR: <path d="M7 17L17 7M9 7h8v8" {...p}/>,
    check:   <path d="M5 12l5 5 9-11" {...p}/>,
    x:       <path d="M6 6l12 12M18 6L6 18" {...p}/>,
    plus:    <path d="M12 5v14M5 12h14" {...p}/>,
    minus:   <path d="M5 12h14" {...p}/>,
    chev:    <path d="M6 9l6 6 6-6" {...p}/>,
    chevR:   <path d="M9 6l6 6-6 6" {...p}/>,
    dot:     <circle cx="12" cy="12" r="4" fill={stroke} stroke="none"/>,
    search:  <><circle cx="11" cy="11" r="7" {...p}/><path d="M20 20l-4-4" {...p}/></>,
    bolt:    <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" {...p}/>,
    qr:      <><rect x="3" y="3" width="7" height="7" {...p}/><rect x="14" y="3" width="7" height="7" {...p}/><rect x="3" y="14" width="7" height="7" {...p}/><path d="M14 14h3v3h-3zM20 14v3M14 20h7M20 20v0" {...p}/></>,
    doc:     <><path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" {...p}/><path d="M14 3v5h5" {...p}/></>,
    shield:  <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" {...p}/>,
    lock:    <><rect x="5" y="11" width="14" height="10" rx="1" {...p}/><path d="M8 11V8a4 4 0 118 0v3" {...p}/></>,
    bell:    <><path d="M6 8a6 6 0 1112 0c0 5 2 6 2 8H4c0-2 2-3 2-8z" {...p}/><path d="M10 21a2 2 0 004 0" {...p}/></>,
    menu:    <path d="M4 6h16M4 12h16M4 18h16" {...p}/>,
    grid:    <><rect x="4" y="4" width="7" height="7" {...p}/><rect x="13" y="4" width="7" height="7" {...p}/><rect x="4" y="13" width="7" height="7" {...p}/><rect x="13" y="13" width="7" height="7" {...p}/></>,
    eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></>,
    ext:     <><path d="M14 4h6v6M10 14L20 4M19 13v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5" {...p}/></>,
    terminal:<><path d="M4 7l5 5-5 5M12 17h8" {...p}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0, display:'inline-block', verticalAlign:'-0.15em', ...style}}>{paths[name]}</svg>;
};

// ── Mono ───────────────────────────────────────────────────
const Mono = ({ children, style = {} }) => (
  <span style={{fontFamily:'var(--font-mono)', letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums', ...style}}>{children}</span>
);

// ── Eyebrow ───────────────────────────────────────────────
const Eyebrow = ({ children, color }) => (
  <div style={{fontFamily:'var(--font-mono)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color: color || 'var(--fg-muted)'}}>{children}</div>
);

// ── Button ─────────────────────────────────────────────────
// Variants:
//   primary  — yellow chip on black/white
//   secondary — hairline on bg
//   ghost    — no border
//   ink      — solid black chip (for dark use the inverse)
const Button = ({ variant = 'primary', size = 'md', children, icon, style = {}, onClick, invert = false }) => {
  const sizes = { sm: {py: 6,  px: 12, fs: 13, h: 30}, md: {py: 8,  px: 14, fs: 14, h: 36}, lg: {py: 12, px: 20, fs: 15, h: 48} };
  const s = sizes[size];
  const base = { display:'inline-flex', alignItems:'center', gap:8, height:s.h, padding:`0 ${s.px}px`, fontFamily:'var(--font-sans)', fontSize:s.fs, fontWeight:500, letterSpacing:'-0.01em', border:'1px solid transparent', borderRadius:'var(--r-1)', cursor:'pointer', transition:'all var(--dur-1) var(--ease)', whiteSpace:'nowrap' };
  const v = {
    primary:   { background:'var(--yellow)', color:'var(--yellow-ink)',  borderColor:'var(--yellow)' },
    secondary: invert
      ? { background:'transparent', color:'var(--paper)', borderColor:'var(--paper-24)' }
      : { background:'var(--paper)', color:'var(--ink)', borderColor:'var(--ink-24)' },
    ghost:     invert
      ? { background:'transparent', color:'var(--paper)', borderColor:'transparent' }
      : { background:'transparent', color:'var(--ink)',   borderColor:'transparent' },
    ink:       { background:'var(--ink)',    color:'var(--paper)',       borderColor:'var(--ink)' },
    paper:     { background:'var(--paper)',  color:'var(--ink)',         borderColor:'var(--paper)' },
  };
  return (
    <button onClick={onClick} style={{...base, ...v[variant], ...style}}>
      {children}
      {icon && <Icon name={icon} size={14}/>}
    </button>
  );
};

// ── Badge ─────────────────────────────────────────────────
// Two tones only: default (hairline) and accent (yellow).
const Badge = ({ children, tone = 'default', invert = false, style = {} }) => {
  const base = { display:'inline-flex', alignItems:'center', gap:6, padding:'3px 8px', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'-0.01em', borderRadius:'var(--r-1)', border:'1px solid', whiteSpace:'nowrap' };
  const tones = {
    default: invert
      ? { color:'var(--paper-72)', background:'transparent', borderColor:'var(--paper-24)' }
      : { color:'var(--ink-72)',   background:'transparent', borderColor:'var(--ink-24)' },
    accent:    { color:'var(--yellow-ink)', background:'var(--yellow)', borderColor:'var(--yellow)' },
    solid:     { color:'var(--paper)', background:'var(--ink)', borderColor:'var(--ink)' },
  };
  return <span style={{...base, ...tones[tone], ...style}}>{children}</span>;
};

// ── BrandMark (svg) ───────────────────────────────────────
const BrandMark = ({ size = 28, invert = false }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{display:'block', flexShrink:0}}>
    <rect width="64" height="64" fill={invert ? '#FFFFFF' : '#000000'}/>
    <rect x="12" y="12" width="40" height="40" fill={invert ? '#000000' : '#FFDF00'}/>
    <rect x="22" y="22" width="20" height="20" fill={invert ? '#FFFFFF' : '#000000'}/>
    <rect x="28" y="28" width="8"  height="8"  fill={invert ? '#000000' : '#FFDF00'}/>
  </svg>
);

// ── Wordmark (inline) ─────────────────────────────────────
const Wordmark = ({ size = 22, invert = false }) => (
  <div style={{display:'inline-flex', alignItems:'center', gap:10}}>
    <BrandMark size={size * 1.18} invert={invert}/>
    <span style={{fontFamily:'var(--font-display)', fontSize: size, fontWeight:600, letterSpacing:'-0.035em', color: invert ? 'var(--ink)' : 'var(--paper)'}}>photonictag</span>
  </div>
);

// ── KBD ───────────────────────────────────────────────────
const Kbd = ({ children }) => (
  <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:20, height:20, padding:'0 5px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-muted)', border:'1px solid var(--hairline)', borderRadius:'var(--r-1)', background:'var(--paper)'}}>{children}</span>
);

// ── Helper: dot row ───────────────────────────────────────
const DotDivider = () => <span style={{width:3, height:3, borderRadius:'50%', background:'var(--ink-24)', flexShrink:0}}/>;

Object.assign(window, { Icon, Mono, Eyebrow, Button, Badge, BrandMark, Wordmark, Kbd, DotDivider });
