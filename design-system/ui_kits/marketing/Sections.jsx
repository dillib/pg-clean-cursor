// Marketing sections — editorial, cream-on-paper, yellow-accented.
// Inspired by Slash's visual language: generous whitespace, big imagery cards,
// italic emphasis per headline, minimal black, 20px rounded corners.

// ─────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────

// HeroPattern — ambient backdrop behind the hero text.
// Two layers, both non-distracting:
//   1. Faint dotted grid (ink at 6% alpha, 28px cell) — texture, no motion
//   2. A single yellow radial halo that drifts slowly in the upper-right
// The whole thing is masked to fade out toward the product showcase row,
// so headline + body copy sit on clean cream.
const HeroPattern = () => (
  <div aria-hidden style={{
    position:'absolute', inset:0, pointerEvents:'none',
    WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 78%)',
    maskImage:       'linear-gradient(to bottom, #000 0%, #000 52%, transparent 78%)',
    overflow:'hidden',
  }}>
    {/* Dotted grid */}
    <div style={{
      position:'absolute', inset:0,
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1.2px)',
      backgroundSize: '28px 28px',
      backgroundPosition: '0 0',
    }}/>
    {/* Yellow halo, drifts */}
    <div style={{
      position:'absolute', top:'-12%', right:'-8%', width:760, height:760,
      background: 'radial-gradient(closest-side, rgba(255,230,0,0.55), rgba(255,230,0,0) 70%)',
      filter: 'blur(4px)',
      animation: 'ptHeroHalo 18s ease-in-out infinite alternate',
    }}/>
    {/* Second, smaller halo to give parallax feel */}
    <div style={{
      position:'absolute', top:'38%', left:'-6%', width:420, height:420,
      background: 'radial-gradient(closest-side, rgba(255,230,0,0.28), rgba(255,230,0,0) 70%)',
      filter: 'blur(2px)',
      animation: 'ptHeroHalo2 24s ease-in-out infinite alternate',
    }}/>
    <style>{`
      @keyframes ptHeroHalo  { from { transform: translate(0,0); } to { transform: translate(-40px, 28px); } }
      @keyframes ptHeroHalo2 { from { transform: translate(0,0); } to { transform: translate(30px, -22px); } }
      @media (prefers-reduced-motion: reduce) {
        @keyframes ptHeroHalo  { from, to { transform: none; } }
        @keyframes ptHeroHalo2 { from, to { transform: none; } }
      }
    `}</style>
  </div>
);

const Hero = () => (
  <section style={{background:'var(--paper)', color:'var(--ink)', borderBottom:'1px solid var(--hairline)', position:'relative', overflow:'hidden'}}>
    {/* Ambient pattern — faint dotted grid + slow yellow halo. Sits behind
        the text block only, fades out toward the bottom so the product
        showcase reads clean. Mask keeps the text area breathable. */}
    <HeroPattern/>
    <div style={{maxWidth:1280, margin:'0 auto', padding:'80px 32px 32px', position:'relative'}}>
      {/* Eyebrow chip — explicit regulation + deadline */}
      <Reveal>
        <div style={{display:'inline-flex', alignItems:'center', gap:10, padding:'6px 14px 6px 8px', background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:999, marginBottom:40}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, background:'var(--yellow)', color:'var(--ink)', padding:'3px 10px', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:500, letterSpacing:'0.02em'}}>
            <span style={{width:5, height:5, borderRadius:'50%', background:'var(--ink)'}}/>ESPR 2024/1781
          </span>
          <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>Textiles · Phase 1 filing window opens in 72 days</Mono>
        </div>
      </Reveal>

      {/* Big headline — clearer value prop */}
      <Reveal delay={60}>
        <h1 style={{fontFamily:'var(--font-display)', fontSize:104, fontWeight:600, letterSpacing:'-0.045em', lineHeight:0.95, margin:0, maxWidth:'14ch'}}>
          Ship to the EU,<br/>
          <em style={{fontStyle:'italic', color:'var(--ink-72)', fontWeight:500}}>fully compliant</em>.
        </h1>
      </Reveal>

      <Reveal delay={120}>
        <p style={{fontSize:20, lineHeight:1.5, color:'var(--fg-muted)', maxWidth:'58ch', marginTop:28, marginBottom:20}}>
          PhotonicTag issues the Digital Product Passport that every SKU sold into the EU will need by 2027. One platform, every ESPR category, regulator-ready exports — so your team spends weeks, not years, getting there.
        </p>
      </Reveal>

      {/* Explicit audience bar — who this is for, said out loud */}
      <Reveal delay={150}>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:36, flexWrap:'wrap'}}>
          <Mono style={{fontSize:11, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Built for →</Mono>
          <Mono style={{fontSize:12.5, color:'var(--ink-72)', padding:'4px 10px', border:'1px solid var(--hairline)', borderRadius:999, background:'var(--paper-pure)'}}>Heads of Compliance</Mono>
          <Mono style={{fontSize:12.5, color:'var(--ink-72)', padding:'4px 10px', border:'1px solid var(--hairline)', borderRadius:999, background:'var(--paper-pure)'}}>Sustainability Leads</Mono>
          <Mono style={{fontSize:12.5, color:'var(--ink-72)', padding:'4px 10px', border:'1px solid var(--hairline)', borderRadius:999, background:'var(--paper-pure)'}}>Operations</Mono>
          <Mono style={{fontSize:12.5, color:'var(--ink-72)', padding:'4px 10px', border:'1px solid var(--hairline)', borderRadius:999, background:'var(--paper-pure)'}}>Engineering</Mono>
        </div>
      </Reveal>

      {/* Email + CTA — sharpened primary action */}
      <Reveal delay={180}>
        <form onSubmit={e => e.preventDefault()} style={{display:'flex', gap:10, alignItems:'center', maxWidth:560, marginBottom:20, flexWrap:'wrap'}}>
          <input
            type="email" placeholder="you@company.com"
            style={{
              flex:1, minWidth:240, height:52, padding:'0 18px',
              fontFamily:'var(--font-sans)', fontSize:15, color:'var(--ink)',
              background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:12,
              outline:'none',
            }}
          />
          <button type="submit" style={{
            height:52, padding:'0 22px', display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:12,
            fontFamily:'var(--font-sans)', fontSize:15, fontWeight:500, letterSpacing:'-0.01em',
            cursor:'pointer',
          }}>
            Check my SKUs for free <Icon name="arrowR" size={14} stroke="currentColor" strokeWidth={2}/>
          </button>
          <a href="#demo" style={{
            height:52, padding:'0 20px', display:'inline-flex', alignItems:'center', gap:8,
            background:'transparent', color:'var(--ink)', border:'1px solid var(--ink)', borderRadius:12,
            fontFamily:'var(--font-sans)', fontSize:15, fontWeight:500, letterSpacing:'-0.01em',
            cursor:'pointer', textDecoration:'none',
          }}>
            Book a 20-min walkthrough
          </a>
        </form>
        <Mono style={{fontSize:12, color:'var(--fg-subtle)', marginBottom:56, display:'block'}}>
          Upload a CSV · See which regulations apply · No credit card · SOC 2 Type II
        </Mono>
      </Reveal>

      {/* Big stat line — pivoted from vanity metric ("14,204 issued") to
          the thing that actually sells: the cost of NOT having this. */}
      <Reveal delay={240}>
        <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'24px 32px', paddingTop:36, borderTop:'1px solid var(--hairline)', alignItems:'baseline'}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:72, fontWeight:600, letterSpacing:'-0.045em', lineHeight:1, fontVariantNumeric:'tabular-nums'}}>
            4<span style={{color:'var(--ink-56)'}}>%</span>
          </div>
          <div style={{fontSize:16, color:'var(--fg-muted)', maxWidth:'46ch', lineHeight:1.5}}>
            is the maximum ESPR fine — a percentage of <em>annual revenue</em>, levied per non-compliant SKU sold into the EU. A single textiles line missing its passport in Q1 2027 can cost more than three years of PhotonicTag.
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1, fontVariantNumeric:'tabular-nums', color:'var(--ink-72)'}}>
            14,204
          </div>
          <div style={{fontSize:15, color:'var(--fg-muted)', maxWidth:'46ch', lineHeight:1.5}}>
            passports already issued — across <Mono style={{fontSize:13, color:'var(--ink)'}}>textiles</Mono>, <Mono style={{fontSize:13, color:'var(--ink)'}}>batteries</Mono>, <Mono style={{fontSize:13, color:'var(--ink)'}}>furniture</Mono> and <Mono style={{fontSize:13, color:'var(--ink)'}}>electronics</Mono>. One import, one audit, one vendor relationship.
          </div>
        </div>
      </Reveal>
    </div>

    {/* Hero product showcase — big imagery row */}
    <Reveal delay={300} y={24}>
      <div style={{maxWidth:1280, margin:'0 auto', padding:'0 32px 88px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16}}>
          {/* Left: passport preview card */}
          <HeroPassportCard/>
          {/* Right: LiveStamp animation */}
          <div style={{background:'var(--ink)', borderRadius:20, overflow:'hidden'}}>
            <LiveStamp height={520}/>
          </div>
        </div>
      </div>
    </Reveal>
  </section>
);

// Big passport preview card used in hero.
const HeroPassportCard = () => (
  <Tilt max={2} scale={1} style={{borderRadius:20, overflow:'hidden'}}>
    <div style={{background:'var(--paper-cream)', borderRadius:20, border:'1px solid var(--hairline)', padding:'28px 32px 32px', height:520, display:'flex', flexDirection:'column'}}>
      {/* URL bar */}
      <div style={{display:'flex', alignItems:'center', gap:10, paddingBottom:18, borderBottom:'1px solid var(--hairline)'}}>
        <BrandMark size={20}/>
        <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>app.photonictag.eu/passports/TX-0448-B</Mono>
        <Mono style={{marginLeft:'auto', fontSize:11, color:'var(--ink-72)'}}>
          <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--yellow)', marginRight:6, border:'1px solid var(--ink)'}}/>
          v1.4.2 verified
        </Mono>
      </div>

      <div style={{marginTop:24, display:'grid', gridTemplateColumns:'1fr 0.85fr', gap:28, flex:1}}>
        <div>
          <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Northfield Textiles</Mono>
          <div style={{fontFamily:'var(--font-display)', fontSize:34, fontWeight:600, letterSpacing:'-0.03em', color:'var(--ink)', marginTop:6, lineHeight:1}}>
            Merino Crew <em style={{color:'var(--ink-56)', fontStyle:'italic'}}>Ink</em>
          </div>
          <Mono style={{fontSize:12, color:'var(--fg-muted)', marginTop:6, display:'block'}}>TX-0448-B · GTIN 4006381333931</Mono>
          <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:14}}>
            {[
              ['Materials','78% Merino · 18% rPET · 4% Elastane'],
              ['Supply chain','4 tiers · 11 suppliers · AU → PT → IT'],
              ['Recyclability','Grade B · fibre-to-fibre protocol'],
              ['ECHA SCIP','No SVHCs declared · checked 2h ago'],
            ].map(([k,v]) => (
              <div key={k}>
                <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{k}</Mono>
                <div style={{color:'var(--ink)', fontSize:13.5, marginTop:3, letterSpacing:'-0.005em'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {/* QR tile */}
          <div style={{background:'var(--yellow)', padding:16, color:'var(--ink)', borderRadius:12}}>
            <Mono style={{fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase'}}>Scan to view</Mono>
            <div style={{width:'100%', aspectRatio:'1/1', background:'repeating-conic-gradient(var(--ink) 0% 25%, var(--yellow) 0% 50%) 0 0/14px 14px', border:'2px solid var(--ink)', marginTop:8, borderRadius:4}}/>
            <Mono style={{fontSize:10, marginTop:8, display:'block', textAlign:'center'}}>photonictag.eu/p/TX0448B</Mono>
          </div>
          <div style={{padding:'12px 14px', background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:12}}>
            <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>eIDAS timestamp</Mono>
            <Mono style={{fontSize:11, color:'var(--fg-muted)', display:'block', marginTop:4, lineHeight:1.5}}>
              Buypass AS QTSP<br/>token 8b1a9…4f3c
            </Mono>
          </div>
        </div>
      </div>
    </div>
  </Tilt>
);

// ─────────────────────────────────────────────────────────────
// Logo bar — filing on behalf of
// ─────────────────────────────────────────────────────────────
const LogoBar = () => (
  <section style={{borderBottom:'1px solid var(--hairline)', padding:'28px 32px', background:'var(--paper)'}}>
    <div style={{maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:32}}>
      <Mono style={{fontSize:11, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0}}>Filing on behalf of →</Mono>
      <Marquee speed={45} style={{flex:1}}>
        {['NORTHFIELD','KASTNER & SÖHNE','LUMEN BATT','FOUR OAKS','HELIX ELEC.','VOLTA CELL','SEAHOUSE','MIRATEX','CORRIGAN OPTICS','BAUMANN MÖBEL'].map(n => (
          <span key={n} style={{color:'var(--ink-72)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:14, letterSpacing:'-0.01em', whiteSpace:'nowrap'}}>{n}</span>
        ))}
      </Marquee>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Who it's for — horizontal card row (Slash "industries we serve")
// ─────────────────────────────────────────────────────────────
const WhoItsFor = () => {
  // Ordered by mandated enforcement date — earliest first.
  const cards = [
    {tag:'Batteries',  title:'Energy storage',    line:'Chemistry, cobalt origin, lifecycle and refurb pathways.',      img:'battery',     reg:'EU 2023/1542', date:'Feb 2026', status:'live'},
    {tag:'Textiles',   title:'Fashion & apparel', line:'Fibre composition, care labels, repair guidance, take-back.',   img:'textile',     reg:'ESPR',         date:'Jul 2026', status:'soon'},
    {tag:'Furniture',  title:'Home & office',     line:'Wood origin, finishes, VOCs, decade-long spares.',              img:'furniture',   reg:'ESPR',         date:'Jan 2027', status:'next'},
    {tag:'Electronics',title:'Consumer tech',     line:'Repairability index, spare-parts, end-of-life protocols.',      img:'electronics', reg:'ESPR',         date:'Jun 2027', status:'next'},
  ];
  return (
    <section style={{padding:'128px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <Eyebrow>Who it's for · ordered by enforcement date</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:16, maxWidth:'22ch'}}>
            Built for <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>every</em> category, in the order the EU mandates them.
          </h2>
        </Reveal>
        <div style={{marginTop:56, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
          {cards.map((c, i) => (
            <Reveal key={c.tag} delay={i*80}>
              <div style={{
                background:'var(--paper-pure)', borderRadius:20, border:'1px solid var(--hairline)',
                padding:'20px 20px 24px', height:'100%', display:'flex', flexDirection:'column', position:'relative',
                overflow:'hidden',
              }}>
                {/* Timeline chip top-right */}
                <div style={{position:'absolute', top:14, right:14, display:'inline-flex', alignItems:'center', gap:6, padding:'3px 9px', borderRadius:999, zIndex:2,
                  background: c.status === 'live' ? 'var(--yellow)' : 'var(--paper-cream)',
                  border: '1px solid', borderColor: c.status === 'live' ? 'var(--ink)' : 'var(--hairline)',
                }}>
                  {c.status === 'live' && <span style={{width:5, height:5, borderRadius:'50%', background:'var(--ink)'}}/>}
                  <Mono style={{fontSize:10, color:'var(--ink)', letterSpacing:'0.04em', fontWeight:500}}>{c.date}</Mono>
                </div>
                <CategoryIllustration kind={c.img}/>
                <div style={{marginTop:20, display:'flex', alignItems:'center', gap:8, minHeight:14}}>
                  <Mono style={{fontSize:10, color:'var(--ink)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600}}>{c.tag}</Mono>
                  <span style={{width:2, height:2, borderRadius:'50%', background:'var(--ink-24)'}}/>
                  <Mono style={{fontSize:10, color:'var(--ink-72)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{c.reg}</Mono>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'var(--ink)', marginTop:8, lineHeight:1.2}}>{c.title}</div>
                <p style={{fontSize:13.5, color:'var(--fg-muted)', marginTop:10, lineHeight:1.5, flex:1}}>{c.line}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// Small yellow-tinted illustrations for category cards
const CategoryIllustration = ({ kind }) => {
  const bg = 'var(--paper-yellow)';
  const ink = 'var(--ink)';
  const common = {width:'100%', aspectRatio:'4/3', background:bg, borderRadius:14, position:'relative', overflow:'hidden', border:'1px solid var(--hairline)'};
  if (kind === 'textile')    return <div style={common}><svg viewBox="0 0 160 120" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}><path d="M20 30 Q40 10 60 30 T100 30 T140 30 M20 50 Q40 30 60 50 T100 50 T140 50 M20 70 Q40 50 60 70 T100 70 T140 70 M20 90 Q40 70 60 90 T100 90 T140 90" stroke={ink} strokeWidth="1.5" fill="none"/></svg></div>;
  if (kind === 'battery')    return <div style={common}><svg viewBox="0 0 160 120" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}><rect x="30" y="40" width="90" height="40" fill="none" stroke={ink} strokeWidth="2" rx="4"/><rect x="120" y="52" width="6" height="16" fill={ink}/><rect x="38" y="48" width="20" height="24" fill={ink}/><rect x="62" y="48" width="20" height="24" fill={ink}/><rect x="86" y="48" width="20" height="24" fill="none" stroke={ink}/></svg></div>;
  if (kind === 'electronics')return <div style={common}><svg viewBox="0 0 160 120" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}><rect x="25" y="30" width="110" height="60" fill="none" stroke={ink} strokeWidth="2" rx="6"/><rect x="20" y="90" width="120" height="4" fill={ink}/><circle cx="80" cy="60" r="4" fill={ink}/></svg></div>;
  if (kind === 'furniture')  return <div style={common}><svg viewBox="0 0 160 120" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}><path d="M40 30 L40 80 M120 30 L120 80 M30 80 L130 80 L125 100 M35 100 L30 80" stroke={ink} strokeWidth="2" fill="none"/><line x1="40" y1="50" x2="120" y2="50" stroke={ink} strokeWidth="2"/></svg></div>;
  return <div style={common}/>;
};

// ─────────────────────────────────────────────────────────────
// Foundation — 2-up big product feature section (Slash's "strong financial foundation")
// ─────────────────────────────────────────────────────────────
const Foundation = () => (
  <section style={{padding:'128px 32px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
    <div style={{maxWidth:1280, margin:'0 auto'}}>
      <Reveal>
        <Eyebrow>The foundation</Eyebrow>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.04em', lineHeight:0.98, marginTop:18, maxWidth:'20ch'}}>
          A single source of truth for <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>every</em> product you sell.
        </h2>
      </Reveal>

      <div style={{marginTop:64, display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:16}}>
        {/* Big card — catalog */}
        <Reveal delay={80} y={20}>
          <div style={{background:'var(--paper-pure)', borderRadius:24, border:'1px solid var(--hairline)', padding:40, height:520, display:'flex', flexDirection:'column'}}>
            <div style={{flex:1}}>
              <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Catalog</Mono>
              <div style={{fontFamily:'var(--font-display)', fontSize:36, fontWeight:600, letterSpacing:'-0.03em', marginTop:12, maxWidth:'18ch', lineHeight:1.08}}>
                Every SKU, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>mapped</em>.
              </div>
              <p style={{fontSize:15, color:'var(--fg-muted)', marginTop:14, lineHeight:1.55, maxWidth:'42ch'}}>
                Import from CSV or your PIM in minutes. Detect materials, flag missing fields, and suggest fixes before the regulator does.
              </p>
            </div>
            {/* Mini table visual */}
            <CatalogMini/>
          </div>
        </Reveal>

        {/* Side column — two stacked cards */}
        <div style={{display:'grid', gridTemplateRows:'1fr 1fr', gap:16}}>
          <Reveal delay={160} y={20}>
            <div style={{background:'var(--yellow)', borderRadius:24, padding:32, height:252, position:'relative', overflow:'hidden'}}>
              <Mono style={{fontSize:10, color:'var(--ink-72)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Public viewer</Mono>
              <div style={{fontFamily:'var(--font-display)', fontSize:26, fontWeight:600, letterSpacing:'-0.025em', marginTop:10, color:'var(--ink)', lineHeight:1.1}}>
                One URL, <em style={{fontStyle:'italic'}}>every</em> audience.
              </div>
              <p style={{fontSize:13.5, color:'var(--ink-72)', marginTop:10, lineHeight:1.5, maxWidth:'32ch'}}>
                Shoppers see plain language. Regulators get a downloadable signed PDF — from the same link.
              </p>
              <ViewerThumb/>
            </div>
          </Reveal>
          <Reveal delay={240} y={20}>
            <div style={{background:'var(--ink)', color:'var(--paper-pure)', borderRadius:24, padding:32, height:252, position:'relative', overflow:'hidden'}}>
              <Mono style={{fontSize:10, color:'var(--paper-56)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Audit trail</Mono>
              <div style={{fontFamily:'var(--font-display)', fontSize:26, fontWeight:600, letterSpacing:'-0.025em', marginTop:10, lineHeight:1.1}}>
                Defensible to the <em style={{fontStyle:'italic', color:'var(--yellow)'}}>last byte</em>.
              </div>
              <p style={{fontSize:13.5, color:'var(--paper-72)', marginTop:10, lineHeight:1.5, maxWidth:'32ch'}}>
                Immutable log, hash-chained per passport, eIDAS-timestamped on every publish.
              </p>
              <AuditThumb/>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

const CatalogMini = () => (
  <div style={{marginTop:28, border:'1px solid var(--hairline)', borderRadius:14, overflow:'hidden', background:'var(--paper)'}}>
    <div style={{display:'grid', gridTemplateColumns:'1.2fr 1.6fr 1fr 0.8fr', padding:'10px 16px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
      {['SKU','Product','Regulation','Status'].map(h => (
        <Mono key={h} style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{h}</Mono>
      ))}
    </div>
    {[
      ['TX-0448-B','Merino Crew Ink',        'ESPR Textiles','Live',    true],
      ['TX-0449-W','Merino Crew Chalk',      'ESPR Textiles','Draft',   false],
      ['BT-2200-R','Lumen Batt 55Wh',        'EU 2023/1542', 'Live',    true],
      ['FN-0010-X','Oak dining chair',       'ESPR Furniture','Review', false],
    ].map(([sku, name, reg, st, live], i) => (
      <div key={sku} style={{display:'grid', gridTemplateColumns:'1.2fr 1.6fr 1fr 0.8fr', padding:'12px 16px', borderTop: i===0 ? 'none' : '1px solid var(--hairline-soft)', alignItems:'center'}}>
        <Mono style={{fontSize:12, color:'var(--ink)'}}>{sku}</Mono>
        <div style={{fontSize:13, color:'var(--ink)', letterSpacing:'-0.005em'}}>{name}</div>
        <Mono style={{fontSize:11.5, color:'var(--fg-muted)'}}>{reg}</Mono>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, padding:'2px 8px', borderRadius:999,
          background: live ? 'var(--yellow)' : 'var(--paper-cream)',
          color: live ? 'var(--ink)' : 'var(--fg-muted)',
          border: live ? '1px solid var(--yellow)' : '1px solid var(--hairline)',
          justifySelf:'start',
        }}>{st}</span>
      </div>
    ))}
  </div>
);

const ViewerThumb = () => (
  <div style={{position:'absolute', bottom:-18, right:-18, width:160, height:200, background:'var(--ink)', color:'var(--paper-pure)', borderRadius:18, padding:14, transform:'rotate(4deg)', boxShadow:'0 18px 40px rgba(0,0,0,0.15)'}}>
    <Mono style={{fontSize:9, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Northfield</Mono>
    <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, letterSpacing:'-0.02em', marginTop:4, lineHeight:1}}>Merino Crew <em style={{color:'var(--yellow)', fontStyle:'italic'}}>Ink</em></div>
    <div style={{marginTop:10, background:'var(--paper-08)', height:48, borderRadius:6}}/>
    <div style={{marginTop:8, background:'var(--paper-08)', height:4, width:'80%', borderRadius:2}}/>
    <div style={{marginTop:6, background:'var(--paper-08)', height:4, width:'60%', borderRadius:2}}/>
    <div style={{marginTop:6, background:'var(--yellow)', height:4, width:'40%', borderRadius:2}}/>
  </div>
);

const AuditThumb = () => (
  <div style={{position:'absolute', bottom:-4, left:-4, right:-4, fontFamily:'var(--font-mono)', fontSize:10, lineHeight:1.75, color:'var(--paper-56)', paddingLeft:32, paddingRight:32}}>
    <div><span style={{color:'var(--paper-40)'}}>14:32:07</span> <span style={{color:'var(--yellow)'}}>PUBLISH</span> v1.4.1 → v1.4.2</div>
    <div><span style={{color:'var(--paper-40)'}}>14:31:52</span> EDIT    materials.wool.pct 72 → 78</div>
    <div><span style={{color:'var(--paper-40)'}}>14:28:01</span> <span style={{color:'var(--yellow)'}}>STAMP</span>   eIDAS · Buypass AS</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Capabilities — 3-col smaller feature cards (Slash "Amplified with modern capabilities")
// ─────────────────────────────────────────────────────────────
const Capabilities = () => {
  const feats = [
    {tag:'Schema',      t:'CIRPASS v2, built in',    d:'Drafts migrate when the schema changes. We track Delegated Acts so you don\'t have to.', icon:'doc'},
    {tag:'Integrations',t:'PIM, ERP, WMS — covered', d:'Akeneo, Pimcore, SAP, Shopify, Centra. Two-way sync. Webhooks for everything.',          icon:'bolt'},
    {tag:'Roles',       t:'Suppliers, in their lane',d:'Invite a Tier-3 supplier to fill exactly three fields. No spreadsheets. No ping-pong.',  icon:'shield'},
    {tag:'Alerts',      t:'Regulation diffs → drafts',d:'A new Delegated Act lands, we flag affected SKUs and queue a review in your inbox.',    icon:'bell'},
    {tag:'API',         t:'REST + webhooks',         d:'Read, write, validate. Typed SDKs for TypeScript and Python. Full OpenAPI spec.',        icon:'terminal'},
    {tag:'Signatures',  t:'eIDAS QTSP on publish',   d:'Buypass, GlobalSign, D-Trust. Every passport is signed, timestamped, verifiable offline.', icon:'lock'},
  ];
  return (
    <section style={{padding:'128px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <Eyebrow>Capabilities</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:16, maxWidth:'22ch'}}>
            Everything your compliance team asks for — <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>and doesn't</em>.
          </h2>
        </Reveal>
        <div style={{marginTop:56, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
          {feats.map((f, i) => (
            <Reveal key={f.tag} delay={(i%3)*60}>
              <div style={{background:'var(--paper-pure)', borderRadius:20, border:'1px solid var(--hairline)', padding:28, height:'100%'}}>
                <div style={{
                  width:44, height:44, background:'var(--yellow)', borderRadius:12,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  border:'1px solid var(--ink)',
                }}>
                  <Icon name={f.icon} size={20} stroke="var(--ink)" strokeWidth={2}/>
                </div>
                <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:20, display:'block'}}>{f.tag}</Mono>
                <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, letterSpacing:'-0.02em', marginTop:6, lineHeight:1.2}}>{f.t}</div>
                <p style={{fontSize:13.5, color:'var(--fg-muted)', marginTop:10, lineHeight:1.55}}>{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Customer quote — big editorial split (Slash customer stories)
// ─────────────────────────────────────────────────────────────
const CustomerQuote = () => (
  <section style={{padding:'128px 32px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
    <div style={{maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:64, alignItems:'center'}}>
      {/* Left: portrait card */}
      <Reveal y={24}>
        <div style={{background:'var(--yellow)', borderRadius:24, aspectRatio:'4/5', position:'relative', overflow:'hidden', border:'1px solid var(--ink)'}}>
          {/* Simple portrait placeholder */}
          <svg viewBox="0 0 200 260" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
            <rect x="0" y="0" width="200" height="260" fill="var(--yellow)"/>
            <circle cx="100" cy="100" r="40" fill="var(--ink)"/>
            <path d="M30 260 Q30 170 100 170 Q170 170 170 260 Z" fill="var(--ink)"/>
          </svg>
          <div style={{position:'absolute', left:24, bottom:24, right:24, display:'flex', alignItems:'center', gap:10, background:'var(--paper-pure)', padding:'12px 14px', borderRadius:12}}>
            <Mono style={{fontSize:11, color:'var(--ink)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600}}>Northfield</Mono>
            <span style={{width:4, height:4, borderRadius:'50%', background:'var(--ink-24)'}}/>
            <Mono style={{fontSize:11, color:'var(--fg-muted)'}}>47,000 SKUs</Mono>
          </div>
        </div>
      </Reveal>
      {/* Right: quote */}
      <Reveal delay={120}>
        <div>
          <Eyebrow>Customer story</Eyebrow>
          <blockquote style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:500, letterSpacing:'-0.025em', lineHeight:1.15, color:'var(--ink)', margin:'20px 0 0', maxWidth:'22ch'}}>
            We migrated 1,247 SKUs in a weekend. Our auditor signed off <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>without a single follow-up question</em>.
          </blockquote>
          <div style={{marginTop:36, display:'flex', alignItems:'center', gap:16}}>
            <div style={{width:44, height:44, background:'var(--ink)', color:'var(--yellow)', fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:999}}>SK</div>
            <div>
              <div style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--ink)'}}>Signe Karlsson</div>
              <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>Compliance lead · Northfield Textiles</Mono>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Stats row — 4 big numbers (Slash's stats block)
// ─────────────────────────────────────────────────────────────
const StatsRow = () => {
  const stats = [
    {big:'14,204', sub:'passports issued'},
    {big:'<5 s',    sub:'median publish time'},
    {big:'99.98%', sub:'validator uptime'},
    {big:'27',     sub:'EU member states served'},
  ];
  return (
    <section style={{padding:'96px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0}}>
        {stats.map((s, i) => (
          <Reveal key={s.sub} delay={i*60}>
            <div style={{padding:'0 32px', borderLeft: i > 0 ? '1px solid var(--hairline)' : 'none'}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:72, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{s.big}</div>
              <Mono style={{fontSize:12, color:'var(--fg-muted)', marginTop:14, display:'block'}}>{s.sub}</Mono>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// How it works — 4 steps, image-forward cards
// ─────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    {n:'01', t:'Import',    d:'Drop a CSV, connect your PIM, or paste 50 rows. We normalize GTINs, detect materials, flag conflicts.', time:'~6 min'},
    {n:'02', t:'Enrich',    d:'Invite suppliers to fill their fields directly. No spreadsheet ping-pong. We track who owes what.',      time:'async'},
    {n:'03', t:'Publish',   d:'We validate against ESPR + CIRPASS, run SCIP cross-check, timestamp with eIDAS QTSP.',                    time:'<5 s/SKU'},
    {n:'04', t:'Monitor',   d:'Regulation changes flow to your drafts. Expiring certs alert. Your auditor gets read-only.',             time:'ongoing'},
  ];
  return (
    <section style={{padding:'128px 32px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <Eyebrow>From catalog to compliant</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:16, maxWidth:'20ch'}}>
            Four steps. One weekend. Your first 50 SKUs <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>live by Monday</em>.
          </h2>
        </Reveal>
        <div style={{marginTop:56, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i*80}>
              <div style={{background:'var(--paper-pure)', borderRadius:20, border:'1px solid var(--hairline)', padding:28, height:'100%'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                  <Mono style={{fontSize:11, background:'var(--yellow)', color:'var(--ink)', padding:'3px 10px', borderRadius:999, letterSpacing:'0.08em'}}>{s.n}</Mono>
                  <Mono style={{fontSize:11, color:'var(--fg-subtle)'}}>{s.time}</Mono>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'var(--ink)'}}>{s.t}</div>
                <p style={{fontSize:13.5, color:'var(--fg-muted)', marginTop:10, lineHeight:1.55}}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Regulation coverage — grouped by status, ordered by enforcement
// ─────────────────────────────────────────────────────────────
const RegulationGrid = () => {
  const rows = [
    {reg:'EU · 2023/1542',   name:'Batteries',        st:'live',    from:'2026-02-18', days:'Live · 0d'},
    {reg:'ESPR · 2024/1781', name:'Textiles',         st:'ok',      from:'2026-07-01', days:'72d'},
    {reg:'ESPR · 2024/1781', name:'Furniture',        st:'ok',      from:'2027-01-01', days:'256d'},
    {reg:'EU · 2023/1542',   name:'EV batteries',     st:'ok',      from:'2027-08-18', days:'485d'},
    {reg:'ESPR · 2024/1781', name:'Electronics',      st:'wip',     from:'2027-06-01', days:'407d'},
    {reg:'CIRPASS',          name:'Data model v2',    st:'wip',     from:'2026-Q3',    days:'Draft'},
    {reg:'Detergents',       name:'Household',        st:'planned', from:'2028',       days:'—'},
    {reg:'Toys',             name:"Children's",       st:'planned', from:'2028',       days:'—'},
  ];

  const groups = [
    {key:'live',    label:'In force',       desc:'Filed passports already serving real shoppers.'},
    {key:'ok',      label:'Supported',      desc:'Full schema + validation ready. Import anytime.'},
    {key:'wip',     label:'In progress',    desc:'Tracking the Delegated Act; beta access available.'},
    {key:'planned', label:'On the roadmap', desc:'Scheduled once the regulation text is final.'},
  ];

  const statusMeta = {
    live:    {chip:'Live',        bg:'var(--yellow)',      fg:'var(--ink)',      border:'var(--ink)'},
    ok:      {chip:'Supported',   bg:'var(--paper-pure)',  fg:'var(--ink)',      border:'var(--hairline)'},
    wip:     {chip:'In progress', bg:'var(--paper-pure)',  fg:'var(--ink)',      border:'var(--hairline)'},
    planned: {chip:'Planned',     bg:'var(--paper-cream)', fg:'var(--ink-72)',   border:'var(--hairline)'},
  };

  return (
    <section style={{padding:'128px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48, gap:40, flexWrap:'wrap'}}>
            <div>
              <Eyebrow>Regulation coverage</Eyebrow>
              <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'20ch'}}>
                Every ESPR category, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>in order of enforcement</em>.
              </h2>
            </div>
            <p style={{fontSize:16, color:'var(--fg-muted)', maxWidth:'34ch', lineHeight:1.55}}>
              We track CIRPASS drafts and Delegated Acts. When the schema changes, your drafts migrate — we don't.
            </p>
          </div>
        </Reveal>

        {/* Grouped by status, each group is a labelled row. */}
        <div style={{display:'flex', flexDirection:'column', gap:40}}>
          {groups.map((g, gi) => {
            const items = rows.filter(r => r.st === g.key);
            if (!items.length) return null;
            const meta = statusMeta[g.key];
            return (
              <div key={g.key}>
                {/* Group header */}
                <Reveal>
                  <div style={{display:'flex', alignItems:'baseline', gap:16, marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--hairline)'}}>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:8,
                      padding:'4px 12px', borderRadius:999,
                      background: meta.bg, color: meta.fg,
                      border:'1px solid', borderColor: meta.border,
                      fontFamily:'var(--font-mono)', fontSize:11, fontWeight:500, letterSpacing:'0.04em',
                    }}>
                      {g.key === 'live' && <span style={{width:6, height:6, borderRadius:'50%', background:'var(--ink)'}}/>}
                      {g.label}
                    </span>
                    <Mono style={{fontSize:12, color:'var(--fg-subtle)'}}>{items.length} {items.length === 1 ? 'category' : 'categories'}</Mono>
                    <p style={{fontSize:14, color:'var(--fg-muted)', marginLeft:'auto', marginRight:0, margin:0, maxWidth:'42ch', textAlign:'right', lineHeight:1.4}}>{g.desc}</p>
                  </div>
                </Reveal>
                {/* Group cards */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
                  {items.map((r, i) => (
                    <Reveal key={r.name} delay={(gi*80) + (i*50)}>
                      <div style={{
                        background: r.st === 'live' ? 'var(--yellow)' : 'var(--paper-pure)',
                        border:'1px solid', borderColor: r.st === 'live' ? 'var(--ink)' : 'var(--hairline)',
                        borderRadius:16, padding:'18px 18px 18px 20px', position:'relative', height:'100%',
                        display:'flex', flexDirection:'column', gap:14,
                        opacity: r.st === 'planned' ? 0.88 : 1,
                      }}>
                        {/* Card head: regulation + countdown */}
                        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10}}>
                          <Mono style={{fontSize:10.5, color: r.st === 'live' ? 'var(--ink)' : 'var(--ink-72)', textTransform:'uppercase', letterSpacing:'0.1em', lineHeight:1.4, fontWeight:600}}>{r.reg}</Mono>
                          <Mono style={{fontSize:11, color:'var(--ink)', fontWeight:500, whiteSpace:'nowrap', flexShrink:0}}>{r.days}</Mono>
                        </div>
                        {/* Card body: name + date */}
                        <div>
                          <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, letterSpacing:'-0.02em', color:'var(--ink)', lineHeight:1.1}}>{r.name}</div>
                          {(() => {
                            // Compute urgency from `days` if it's a number; urgent ≤ 120 days → yellow alert chip
                            const daysNum = typeof r.days === 'string' && r.days.endsWith('d') ? parseInt(r.days, 10) : NaN;
                            const urgent = !isNaN(daysNum) && daysNum <= 120;
                            const live = r.st === 'live';
                            return (
                              <div style={{
                                marginTop:10, display:'inline-flex', alignItems:'center', gap:8,
                                padding:'5px 10px',
                                background: live ? 'var(--ink)' : urgent ? 'var(--yellow)' : 'var(--paper-cream)',
                                color: live ? 'var(--yellow)' : 'var(--ink)',
                                border:'1px solid', borderColor: live ? 'var(--ink)' : urgent ? 'var(--ink)' : 'var(--hairline)',
                                borderRadius:6,
                              }}>
                                {urgent && !live && <span style={{width:6, height:6, borderRadius:'50%', background:'var(--ink)', display:'inline-block'}}/>}
                                <Mono style={{fontSize:12, letterSpacing:'0.02em', fontWeight:600, color:'inherit'}}>
                                  {live ? 'LIVE' : 'Enforces'} {r.from}
                                </Mono>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                  {/* Fill remaining columns with subtle placeholders so the grid stays 4-wide */}
                  {items.length < 4 && Array.from({length: 4 - items.length}).map((_, i) => (
                    <div key={`gap-${i}`}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Pricing — two-column, minimal (Slash style)
// ─────────────────────────────────────────────────────────────
const Pricing = () => {
  const tiers = [
    {
      name:'Growth', price:'€1,900', cadence:'per month · up to 10,000 SKUs',
      desc:'For brands publishing their first passports.',
      features:['All ESPR categories','API + webhooks','SSO + 4 roles','eIDAS qualified timestamps','99.9% SLA','Email support'],
      cta:'Start 30-day trial', featured:true,
    },
    {
      name:'Enterprise', price:'Custom', cadence:'unlimited SKUs · dedicated infra',
      desc:'For groups with private deployment or audit scope.',
      features:['Private deployment (EU regions)','SOC 2 + ISO 27001 report','DPA + custom MSA','Named compliance engineer','Dedicated channel'],
      cta:'Contact sales',
    },
  ];
  return (
    <section style={{padding:'128px 32px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center', maxWidth:640, margin:'0 auto 56px'}}>
            <Eyebrow>Pricing</Eyebrow>
            <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, marginBottom:16}}>
              Priced per SKU, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>not per seat</em>.
            </h2>
            <p style={{fontSize:17, color:'var(--fg-muted)', lineHeight:1.55}}>
              Invite your whole compliance team, suppliers, and auditors — the price doesn't change.
            </p>
          </div>
        </Reveal>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i*100} y={24}>
              <div style={{
                padding:36, borderRadius:24,
                background: t.featured ? 'var(--yellow)' : 'var(--paper-pure)',
                border:'1px solid', borderColor: t.featured ? 'var(--ink)' : 'var(--hairline)',
                height:'100%', display:'flex', flexDirection:'column',
              }}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.015em', color:'var(--ink)'}}>{t.name}</div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.04em', marginTop:20, lineHeight:1, color:'var(--ink)'}}>{t.price}</div>
                  <div style={{fontSize:13, color: t.featured ? 'var(--ink-72)' : 'var(--fg-muted)', marginTop:10}}>{t.cadence}</div>
                  <p style={{fontSize:14.5, color: t.featured ? 'var(--ink-72)' : 'var(--fg-muted)', marginTop:20, lineHeight:1.55}}>{t.desc}</p>
                  <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:10, paddingTop:24, borderTop: t.featured ? '1px solid var(--ink-24)' : '1px solid var(--hairline)'}}>
                    {t.features.map(f => (
                      <div key={f} style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--ink)'}}>
                        <Icon name="check" size={13} stroke="var(--ink)" strokeWidth={2.4}/> {f}
                      </div>
                    ))}
                  </div>
                </div>
                <button style={{
                  marginTop:32, height:52, padding:'0 20px', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                  background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:12,
                  fontFamily:'var(--font-sans)', fontSize:15, fontWeight:500, letterSpacing:'-0.01em',
                  cursor:'pointer', width:'100%',
                }}>{t.cta} <Icon name="arrowR" size={14} stroke="currentColor" strokeWidth={2}/></button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Final CTA — yellow slab with email field
// ─────────────────────────────────────────────────────────────
const CTA = () => (
  <section style={{padding:'128px 32px', background:'var(--yellow)', color:'var(--ink)'}}>
    <div style={{maxWidth:1100, margin:'0 auto', textAlign:'center'}}>
      <Reveal>
        <Eyebrow color="var(--ink-72)">Start your compliance program</Eyebrow>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:88, fontWeight:600, letterSpacing:'-0.045em', lineHeight:0.96, marginTop:16, marginBottom:20, color:'var(--ink)', maxWidth:'17ch', marginLeft:'auto', marginRight:'auto'}}>
          One passport per SKU. <em style={{fontStyle:'italic', color:'var(--ink-72)'}}>Audit-ready</em> from day one.
        </h2>
        <p style={{fontSize:18, color:'var(--ink-72)', maxWidth:'54ch', margin:'0 auto 36px', lineHeight:1.55}}>
          Import your catalog, enrich from suppliers, publish with an eIDAS-qualified signature. Every edit tracked, every field regulator-defensible — the filing window takes care of itself.
        </p>
      </Reveal>
      <Reveal delay={120}>
        <form onSubmit={e => e.preventDefault()} style={{display:'flex', gap:10, alignItems:'center', maxWidth:560, margin:'0 auto', flexWrap:'wrap', justifyContent:'center'}}>
          <input
            type="email" placeholder="you@company.eu"
            style={{
              flex:1, minWidth:240, height:56, padding:'0 20px',
              fontFamily:'var(--font-sans)', fontSize:15, color:'var(--ink)',
              background:'var(--paper-pure)', border:'1px solid var(--ink)', borderRadius:14,
              outline:'none',
            }}
          />
          <button type="submit" style={{
            height:56, padding:'0 24px', display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:14,
            fontFamily:'var(--font-sans)', fontSize:15, fontWeight:500, letterSpacing:'-0.01em',
            cursor:'pointer',
          }}>
            Start free audit <Icon name="arrowR" size={14} stroke="currentColor" strokeWidth={2}/>
          </button>
        </form>
      </Reveal>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{background:'var(--ink)', color:'var(--paper-pure)', padding:'72px 32px 40px'}}>
    <div style={{maxWidth:1280, margin:'0 auto'}}>

      {/* ── Top: brand + nav columns ───────────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr 1fr', gap:40, paddingBottom:48}}>
        <div>
          <Wordmark size={20} invert/>
          <p style={{fontSize:13.5, color:'var(--paper-56)', marginTop:16, lineHeight:1.55, maxWidth:'30ch'}}>
            Digital product passports for every SKU you sell into the European Union.
          </p>
        </div>
        {[
          ['Platform', ['Catalog','Passport viewer','Audit trail','API','Integrations']],
          ['Regulations', ['ESPR Textiles','EU Batteries','ESPR Furniture','CIRPASS v2']],
          ['Company', ['About','Security','Pricing','Customers']],
          ['Resources', ['Docs','Status','Changelog','Blog']],
        ].map(([title, items]) => (
          <div key={title}>
            <Mono style={{fontSize:10.5, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{title}</Mono>
            <ul style={{listStyle:'none', padding:0, margin:'14px 0 0', display:'flex', flexDirection:'column', gap:8}}>
              {items.map(x => (
                <li key={x} style={{fontSize:13.5, color:'var(--paper-72)'}}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Compliance badges row ──────────────────────────── */}
      <div style={{paddingTop:28, paddingBottom:28, borderTop:'1px solid var(--paper-12)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
        <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Compliance</Mono>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, flex:1}}>
          {[
            ['SOC 2 Type II',   'AICPA'],
            ['ISO 27001',        'since 2024'],
            ['GDPR · Art. 27',   'EU rep'],
            ['eIDAS · QTSP',     'qualified sigs'],
            ['EU residency',     'ieu-north-1 · ieu-west-1'],
            ['DPF',              'US ↔ EU transfer'],
          ].map(([k, v]) => (
            <div key={k} style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 11px', border:'1px solid var(--paper-12)', borderRadius:999}}>
              <span style={{width:5, height:5, borderRadius:'50%', background:'var(--yellow)'}}/>
              <Mono style={{fontSize:10.5, color:'var(--paper-pure)'}}>{k}</Mono>
              <Mono style={{fontSize:10.5, color:'var(--paper-40)'}}>{v}</Mono>
            </div>
          ))}
        </div>
      </div>

      {/* ── Legal entities ─────────────────────────────────── */}
      <div style={{paddingTop:28, paddingBottom:28, borderTop:'1px solid var(--paper-12)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48}}>
        {[
          {flag:'US', name:'PhotonicTag, Inc.', detail:'Delaware C-Corp · EIN 92-3188104', addr:'548 Market St #94821, San Francisco CA 94104'},
          {flag:'EU', name:'PhotonicTag AB',    detail:'Stockholm · org.nr 559213-0442',   addr:'Sveavägen 44, 111 34 Stockholm · GDPR Art. 27 representative'},
        ].map(e => (
          <div key={e.flag} style={{display:'flex', gap:14, alignItems:'flex-start'}}>
            <div style={{
              flexShrink:0,
              width:30, height:20, borderRadius:3,
              background:'var(--yellow)', color:'var(--ink)',
              fontFamily:'var(--font-mono)', fontSize:10.5, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center',
              letterSpacing:'0.05em',
              marginTop:2,
            }}>{e.flag}</div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, letterSpacing:'-0.01em', color:'var(--paper-pure)'}}>{e.name}</div>
              <Mono style={{fontSize:11.5, color:'var(--paper-72)', marginTop:4, display:'block', lineHeight:1.5}}>{e.detail}</Mono>
              <Mono style={{fontSize:11.5, color:'var(--paper-40)', marginTop:2, display:'block', lineHeight:1.5}}>{e.addr}</Mono>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom: copyright + legal links ────────────────── */}
      <div style={{paddingTop:22, borderTop:'1px solid var(--paper-12)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16}}>
        <Mono style={{fontSize:11, color:'var(--paper-40)'}}>
          © 2026 PhotonicTag, Inc. &amp; PhotonicTag AB · All rights reserved
        </Mono>
        <div style={{display:'flex', gap:24}}>
          {['Privacy','Terms','Security','DPA','Sub-processors'].map(x => (
            <Mono key={x} style={{fontSize:11, color:'var(--paper-56)'}}>{x}</Mono>
          ))}
        </div>
      </div>

    </div>
  </footer>
);

Object.assign(window, {
  Hero, HeroPassportCard, LogoBar, WhoItsFor, CategoryIllustration,
  Foundation, CatalogMini, ViewerThumb, AuditThumb,
  Capabilities, CustomerQuote, StatsRow, HowItWorks, RegulationGrid,
  Pricing, CTA, Footer,
});
