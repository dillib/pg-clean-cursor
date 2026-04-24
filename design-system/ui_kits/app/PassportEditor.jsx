// Passport Editor — the main authoring surface.
// Three-column layout: section nav · field editor · live preview & validation.
// Uses the same cream/yellow/ink system as the rest of the app.

// Hook for responsive behaviour — switches at 860 px.
const useIsMobile = (bp = 860) => {
  const [m, setM] = React.useState(() => typeof window !== 'undefined' && window.innerWidth <= bp);
  React.useEffect(() => {
    const onR = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [bp]);
  return m;
};

const PassportEditor = () => {
  const [section, setSection] = React.useState('materials');
  const [dirty, setDirty] = React.useState(true);
  const isMobile = useIsMobile();

  return (
    <main style={{flex:1, minWidth:0, background:'var(--paper)', display:'flex', flexDirection:'column'}}>
      <EditorHeader dirty={dirty} isMobile={isMobile}/>
      <EditorProgress isMobile={isMobile}/>
      {isMobile ? (
        <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
          <EditorSectionNav active={section} onChange={setSection} isMobile/>
          <EditorFields section={section} onDirty={() => setDirty(true)} isMobile/>
          <EditorSidecar isMobile/>
        </div>
      ) : (
        <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'180px minmax(480px, 1fr) 320px', overflowX:'auto'}}>
          <EditorSectionNav active={section} onChange={setSection}/>
          <EditorFields section={section} onDirty={() => setDirty(true)}/>
          <EditorSidecar/>
        </div>
      )}
    </main>
  );
};

// ── Header ────────────────────────────────────────────────
const EditorHeader = ({ dirty, isMobile }) => (
  <div style={{padding: isMobile ? '16px 16px 14px' : '20px 24px 18px', borderBottom:'1px solid var(--hairline)', display:'flex', alignItems:'flex-start', gap: isMobile ? 12 : 24, flexWrap:'wrap'}}>
    <div style={{flex:1, minWidth: isMobile ? 0 : 240}}>
      <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
        <Mono style={{fontSize:11, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>TX-0448-B{!isMobile && ' · GTIN 4006381333931'}</Mono>
        <span style={{width:3, height:3, borderRadius:'50%', background:'var(--ink-24)'}}/>
        <Mono style={{fontSize:11, color:'var(--fg-muted)'}}>ESPR Textiles</Mono>
      </div>
      <div style={{marginTop:8, display:'flex', alignItems:'baseline', gap:14, flexWrap:'wrap'}}>
        <h1 style={{fontFamily:'var(--font-display)', fontSize: isMobile ? 22 : 28, fontWeight:600, letterSpacing:'-0.025em', margin:0}}>
          Merino Crew <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>Ink</em>
        </h1>
        <Badge tone="default">v1.4.2 → v1.5.0</Badge>
        {dirty && <Mono style={{fontSize:11, color:'var(--ink-72)'}}>· unsaved</Mono>}
      </div>
    </div>
    <div style={{display:'flex', gap:8, flexShrink:0, paddingTop:4, flexWrap:'wrap'}}>
      {!isMobile && <Button variant="secondary" size="sm" icon="eye">Preview public</Button>}
      {!isMobile && <Button variant="secondary" size="sm" icon="terminal">View JSON-LD</Button>}
      <Button variant="primary" size="sm" icon="check">{isMobile ? 'Publish' : 'Validate + publish'}</Button>
    </div>
  </div>
);

// ── Progress rail ─────────────────────────────────────────
const EditorProgress = ({ isMobile }) => {
  const steps = [
    {k:'Identity',     done:12, total:12, status:'ok'},
    {k:'Materials',    done:9,  total:11, status:'wip'},
    {k:'Supply chain', done:7,  total:9,  status:'wip'},
    {k:'Circularity',  done:4,  total:8,  status:'todo'},
    {k:'Signing',      done:0,  total:3,  status:'todo'},
  ];
  const totalDone = steps.reduce((a, s) => a + s.done, 0);
  const totalAll  = steps.reduce((a, s) => a + s.total, 0);
  const pct = Math.round(totalDone / totalAll * 100);

  if (isMobile) {
    return (
      <div style={{padding:'14px 16px', borderBottom:'1px solid var(--hairline)', background:'var(--paper-cream)', display:'flex', flexDirection:'column', gap:12}}>
        {/* Row 1: percentage + field count */}
        <div style={{display:'flex', alignItems:'baseline', gap:10}}>
          <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Completion</Mono>
          <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums', lineHeight:1}}>{pct}%</div>
          <Mono style={{fontSize:11, color:'var(--fg-muted)', marginLeft:'auto'}}>{totalDone}/{totalAll} fields</Mono>
        </div>
        {/* Row 2: bar, full width */}
        <div style={{display:'flex', gap:3, height:8}}>
          {steps.map(s => (
            <div key={s.k} style={{flex:s.total, display:'flex', gap:1}}>
              {Array.from({length: s.total}).map((_, i) => (
                <div key={i} style={{flex:1, background: i < s.done ? 'var(--ink)' : 'var(--ink-08)', borderRadius:1}}/>
              ))}
            </div>
          ))}
        </div>
        {/* Row 3: step chips with name + points, horizontally scrollable */}
        <div style={{display:'flex', gap:6, overflowX:'auto', margin:'0 -16px', padding:'2px 16px', scrollbarWidth:'none'}}>
          {steps.map(s => (
            <div key={s.k} style={{
              flexShrink:0, display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px',
              background: s.status === 'ok' ? 'var(--ink)' : 'var(--paper-pure)',
              color: s.status === 'ok' ? 'var(--paper-pure)' : s.status === 'wip' ? 'var(--ink)' : 'var(--ink-72)',
              border: s.status === 'ok' ? 'none' : '1px solid var(--hairline)', borderRadius:999,
            }}>
              <span style={{fontFamily:'var(--font-sans)', fontSize:12, fontWeight:500, letterSpacing:'-0.005em'}}>{s.k}</span>
              <Mono style={{fontSize:10.5, color: s.status === 'ok' ? 'var(--paper-56)' : 'var(--fg-subtle)'}}>{s.done}/{s.total}</Mono>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'12px 24px', borderBottom:'1px solid var(--hairline)', background:'var(--paper-cream)', display:'flex', alignItems:'center', gap:20}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <Mono style={{fontSize:11, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Completion</Mono>
        <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{pct}%</div>
        <Mono style={{fontSize:11, color:'var(--fg-muted)'}}>{totalDone}/{totalAll} fields</Mono>
      </div>
      <div style={{flex:1, display:'flex', gap:3, height:8}}>
        {steps.map(s => (
          <div key={s.k} style={{flex:s.total, display:'flex', gap:1}}>
            {Array.from({length: s.total}).map((_, i) => (
              <div key={i} style={{
                flex:1,
                background: i < s.done ? 'var(--ink)' : 'var(--ink-08)',
                borderRadius:1,
              }}/>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:'flex', gap:14}}>
        {steps.map(s => (
          <Mono key={s.k} style={{fontSize:11, color: s.status === 'ok' ? 'var(--ink)' : s.status === 'wip' ? 'var(--ink-72)' : 'var(--fg-subtle)'}}>
            {s.k} <span style={{color:'var(--fg-subtle)'}}>{s.done}/{s.total}</span>
          </Mono>
        ))}
      </div>
    </div>
  );
};

// ── Section nav (left column) ─────────────────────────────
const EditorSectionNav = ({ active, onChange, isMobile }) => {
  const sections = [
    {key:'identity',    label:'Identity',     badge:null,   ok:true},
    {key:'materials',   label:'Materials',    badge:'2',    ok:false},
    {key:'supply',      label:'Supply chain', badge:'2',    ok:false},
    {key:'care',        label:'Care & repair', badge:null,  ok:true},
    {key:'circularity', label:'Circularity',  badge:'4',    ok:false},
    {key:'chemicals',   label:'Chemicals',    badge:'!',    ok:false, warn:true},
    {key:'signing',     label:'Signing',      badge:null,   ok:false, locked:true},
  ];

  if (isMobile) {
    return (
      <nav style={{borderBottom:'1px solid var(--hairline)', background:'var(--paper)', display:'flex', gap:4, overflowX:'auto', padding:'10px 16px', scrollbarWidth:'none'}}>
        {sections.map(s => (
          <button key={s.key} onClick={() => onChange(s.key)} style={{
            flexShrink:0, display:'inline-flex', alignItems:'center', gap:6, padding:'7px 12px',
            fontFamily:'var(--font-sans)', fontSize:13, fontWeight:500, letterSpacing:'-0.005em',
            color: active === s.key ? 'var(--paper-pure)' : 'var(--ink-72)',
            background: active === s.key ? 'var(--ink)' : 'var(--paper-cream)',
            border:'1px solid ' + (active === s.key ? 'var(--ink)' : 'var(--hairline)'),
            borderRadius:999, cursor:'pointer',
          }}>
            <span style={{
              width:5, height:5, borderRadius:'50%',
              background: s.warn ? 'var(--yellow)' : s.ok ? (active === s.key ? 'var(--yellow)' : 'var(--ink)') : 'var(--ink-24)',
              border: s.warn ? '1px solid ' + (active === s.key ? 'var(--paper-pure)' : 'var(--ink)') : 'none',
            }}/>
            <span>{s.label}</span>
            {s.badge && <Mono style={{fontSize:10, padding:'1px 6px', borderRadius:999, background: s.warn ? 'var(--yellow)' : (active === s.key ? 'rgba(255,255,255,0.18)' : 'var(--ink-08)'), color: s.warn ? 'var(--ink)' : (active === s.key ? 'var(--paper-pure)' : 'var(--ink)')}}>{s.badge}</Mono>}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <aside style={{borderRight:'1px solid var(--hairline)', background:'var(--paper)', padding:'14px 10px', display:'flex', flexDirection:'column', gap:1}}>
      <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase', padding:'6px 12px 10px'}}>Sections</Mono>
      {sections.map(s => (
        <button key={s.key} onClick={() => onChange(s.key)} style={{
          display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
          fontSize:13.5, textAlign:'left', letterSpacing:'-0.005em',
          color: active === s.key ? 'var(--ink)' : 'var(--ink-72)',
          background: active === s.key ? 'var(--paper-cream)' : 'transparent',
          border:'none', borderRadius:6, cursor:'pointer',
        }}>
          <span style={{
            width:6, height:6, borderRadius:'50%', flexShrink:0,
            background: s.warn ? 'var(--yellow)' : s.ok ? 'var(--ink)' : 'var(--ink-24)',
            border: s.warn ? '1px solid var(--ink)' : 'none',
          }}/>
          <span style={{flex:1}}>{s.label}</span>
          {s.locked && <Icon name="lock" size={12} stroke="var(--fg-subtle)"/>}
          {s.badge && <Mono style={{fontSize:10.5, padding:'1px 7px', borderRadius:999, background: s.warn ? 'var(--yellow)' : 'var(--ink-08)', color:'var(--ink)', letterSpacing:'0.04em'}}>{s.badge}</Mono>}
        </button>
      ))}
      <div style={{marginTop:24, padding:'14px', background:'var(--yellow)', border:'1px solid var(--ink)', borderRadius:8}}>
        <Mono style={{fontSize:10, color:'var(--ink-72)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Delegated Act</Mono>
        <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, letterSpacing:'-0.01em', color:'var(--ink)', marginTop:4, lineHeight:1.35}}>3 new fields landed Apr 14 — Chemicals.REACH</div>
        <a href="#" style={{display:'inline-block', marginTop:8, fontSize:12, color:'var(--ink)', textDecoration:'underline', textDecorationThickness:1}}>Review diff →</a>
      </div>
    </aside>
  );
};

// ── Field editor (middle column) ──────────────────────────
const EditorFields = ({ section, onDirty, isMobile }) => {
  // We'll show the Materials section as the canonical example — it's the most
  // visually rich and covers the key field types (table, percentage, toggle,
  // linked cert, textarea, locked-by-supplier).
  const [fibres, setFibres] = React.useState([
    {name:'Merino wool',   pct:78, recycled:false, source:'AU', cert:'RWS'},
    {name:'rPET',          pct:18, recycled:true,  source:'PT', cert:'GRS'},
    {name:'Elastane',      pct:4,  recycled:false, source:'IT', cert:null},
  ]);
  const pctTotal = fibres.reduce((a, f) => a + f.pct, 0);
  return (
    <section style={{padding: isMobile ? '20px 16px' : '28px 28px', minWidth:0, overflow:'auto'}}>
      <Eyebrow>Materials · fibre composition</Eyebrow>
      <h2 style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, letterSpacing:'-0.025em', marginTop:8, marginBottom:8}}>
        What's it <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>made of</em>?
      </h2>
      <p style={{fontSize:13.5, color:'var(--fg-muted)', lineHeight:1.55, maxWidth:'60ch', marginTop:0}}>
        Declare every fibre above 1%. Percentages must sum to 100%. Recycled content requires a chain-of-custody cert.
      </p>

      {/* Fibre table — on mobile each fibre becomes a stacked card so the name + % are well-placed */}
      <div style={{marginTop:24, border:'1px solid var(--hairline)', borderRadius:12, overflow:'hidden', background:'var(--paper-pure)'}}>
        {!isMobile && (
          <div style={{display:'grid', gridTemplateColumns:'1.8fr 90px 70px 70px 120px 40px', padding:'10px 16px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)', alignItems:'center'}}>
            {['Fibre','% by mass','Recycled','Origin','Certification',''].map(h => (
              <Mono key={h} style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{h}</Mono>
            ))}
          </div>
        )}
        {fibres.map((f, i) => isMobile ? (
          <div key={i} style={{padding:'14px 14px 12px', borderTop: i === 0 ? 'none' : '1px solid var(--hairline-soft)', display:'flex', flexDirection:'column', gap:10}}>
            {/* Name + percentage + remove */}
            <div style={{display:'flex', gap:10, alignItems:'stretch'}}>
              <input defaultValue={f.name} style={{...fieldInputStyle, flex:1, height:40, fontSize:14, fontWeight:500}}/>
              <div style={{position:'relative', width:92}}>
                <input defaultValue={f.pct} style={{...fieldInputStyle, height:40, paddingRight:24, fontFamily:'var(--font-mono)', fontSize:15, fontVariantNumeric:'tabular-nums', textAlign:'right'}}/>
                <span style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--fg-subtle)'}}>%</span>
              </div>
              <button aria-label="remove" style={{width:40, height:40, background:'transparent', border:'1px solid var(--hairline)', borderRadius:6, color:'var(--fg-subtle)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Icon name="x" size={13}/>
              </button>
            </div>
            {/* Meta row: recycled + origin + cert, with labels so each is self-explanatory */}
            <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:12, alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <FieldToggle on={f.recycled}/>
                <Mono style={{fontSize:11, color:'var(--fg-muted)', letterSpacing:'0.04em'}}>Recycled</Mono>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6, justifySelf:'end'}}>
                <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Origin</Mono>
                <input defaultValue={f.source} style={{...fieldInputStyle, width:56, height:28, fontFamily:'var(--font-mono)', textTransform:'uppercase', textAlign:'center'}}/>
              </div>
              {f.cert
                ? <div style={{display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', background:'var(--paper-cream)', border:'1px solid var(--hairline)', borderRadius:6}}>
                    <Mono style={{fontSize:11, color:'var(--ink)'}}>{f.cert}</Mono>
                    <span style={{width:5, height:5, borderRadius:'50%', background:'var(--yellow)', border:'1px solid var(--ink)'}}/>
                  </div>
                : <button style={{padding:'5px 10px', fontFamily:'var(--font-sans)', fontSize:12, background:'transparent', border:'1px dashed var(--ink-24)', borderRadius:6, color:'var(--fg-muted)', cursor:'pointer'}}>+ Cert</button>
              }
            </div>
          </div>
        ) : (
          <div key={i} style={{display:'grid', gridTemplateColumns:'1.8fr 90px 70px 70px 120px 40px', padding:'10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--hairline-soft)', alignItems:'center', gap:8}}>
            <input defaultValue={f.name} style={fieldInputStyle}/>
            <div style={{position:'relative'}}>
              <input defaultValue={f.pct} style={{...fieldInputStyle, paddingRight:22, fontFamily:'var(--font-mono)', fontVariantNumeric:'tabular-nums'}}/>
              <span style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--fg-subtle)'}}>%</span>
            </div>
            <FieldToggle on={f.recycled}/>
            <input defaultValue={f.source} style={{...fieldInputStyle, fontFamily:'var(--font-mono)', textTransform:'uppercase'}}/>
            {f.cert
              ? <div style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', background:'var(--paper-cream)', border:'1px solid var(--hairline)', borderRadius:6}}>
                  <Mono style={{fontSize:11, color:'var(--ink)'}}>{f.cert}</Mono>
                  <span style={{width:5, height:5, borderRadius:'50%', background:'var(--yellow)', border:'1px solid var(--ink)'}}/>
                </div>
              : <button style={{padding:'5px 10px', fontFamily:'var(--font-sans)', fontSize:12, background:'transparent', border:'1px dashed var(--ink-24)', borderRadius:6, color:'var(--fg-muted)', cursor:'pointer'}}>+ Link cert</button>
            }
            <button style={{width:28, height:28, background:'transparent', border:'none', color:'var(--fg-subtle)', cursor:'pointer', justifySelf:'center'}}>
              <Icon name="x" size={12}/>
            </button>
          </div>
        ))}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderTop:'1px solid var(--hairline)', background:'var(--paper-cream)'}}>
          <button style={{padding:'4px 10px', fontFamily:'var(--font-sans)', fontSize:12.5, background:'transparent', border:'1px dashed var(--ink-24)', borderRadius:6, color:'var(--ink-72)', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6}}>
            <Icon name="plus" size={11}/> Add fibre
          </button>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <Mono style={{fontSize:11, color:'var(--fg-subtle)', letterSpacing:'0.04em', textTransform:'uppercase'}}>Sum</Mono>
            <Mono style={{fontSize:14, fontWeight:500, color: pctTotal === 100 ? 'var(--ink)' : 'var(--yellow-ink)', background: pctTotal === 100 ? 'transparent' : 'var(--yellow)', padding: pctTotal === 100 ? 0 : '2px 8px', borderRadius:4, fontVariantNumeric:'tabular-nums'}}>
              {pctTotal}%
            </Mono>
          </div>
        </div>
      </div>

      {/* Secondary fields — care tag text + external cert link */}
      <div style={{marginTop:28, display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16}}>
        <FieldBlock label="Care tag text" hint="Shown on the physical label. Max 120 chars.">
          <textarea defaultValue="Merino wool blend. Wash cold, lay flat to dry. Do not bleach." rows={3} style={{...fieldInputStyle, padding:'10px 12px', resize:'vertical', lineHeight:1.5, fontFamily:'var(--font-sans)'}}/>
        </FieldBlock>
        <FieldBlock label="Country of assembly" hint="ISO 3166 · two-letter code.">
          <input defaultValue="PT" style={{...fieldInputStyle, fontFamily:'var(--font-mono)', textTransform:'uppercase', padding:'10px 12px'}}/>
        </FieldBlock>
      </div>

      {/* Locked-by-supplier field (greyed with lock icon) */}
      <div style={{marginTop:16, padding:'16px 20px', background:'var(--paper-cream)', border:'1px solid var(--hairline)', borderRadius:10}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <Icon name="lock" size={12} stroke="var(--fg-subtle)"/>
              <Mono style={{fontSize:11, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Tier-3 · Lanificio Brunello</Mono>
            </div>
            <div style={{marginTop:6, fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, letterSpacing:'-0.015em'}}>Yarn dye process · <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>awaiting supplier</em></div>
            <Mono style={{fontSize:11, color:'var(--fg-muted)', marginTop:4, display:'block'}}>Last nudged 2d ago · due Apr 30</Mono>
          </div>
          <Button variant="secondary" size="sm" icon="bell">Remind</Button>
        </div>
      </div>
    </section>
  );
};

const fieldInputStyle = {
  width:'100%', height:32, padding:'0 10px',
  fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink)',
  background:'var(--paper)', border:'1px solid var(--hairline)', borderRadius:6,
  outline:'none', letterSpacing:'-0.005em',
};

const FieldToggle = ({ on }) => (
  <button style={{
    width:34, height:20, padding:2, borderRadius:999,
    background: on ? 'var(--ink)' : 'var(--ink-12)',
    border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center',
  }}>
    <span style={{
      width:16, height:16, borderRadius:'50%',
      background: on ? 'var(--yellow)' : 'var(--paper-pure)',
      transform: on ? 'translateX(14px)' : 'translateX(0)',
      transition:'transform 160ms var(--ease)',
    }}/>
  </button>
);

const FieldBlock = ({ label, hint, children }) => (
  <label style={{display:'flex', flexDirection:'column', gap:6}}>
    <div style={{display:'flex', alignItems:'baseline', gap:10}}>
      <div style={{fontSize:13, fontWeight:500, color:'var(--ink)', letterSpacing:'-0.005em'}}>{label}</div>
      {hint && <Mono style={{fontSize:11, color:'var(--fg-subtle)'}}>{hint}</Mono>}
    </div>
    {children}
  </label>
);

// ── Sidecar (right column) — validation + preview + audit ─
const EditorSidecar = ({ isMobile }) => {
  const issues = [
    {lvl:'err',  field:'chemicals.svhc',     msg:'New SVHC added to ECHA list 14 Apr.', fix:'Re-declare'},
    {lvl:'warn', field:'circularity.takeBack', msg:'Scheme URL returns 404.',          fix:'Update'},
    {lvl:'warn', field:'supply.tier3.dye',    msg:'Supplier hasn\'t confirmed.',        fix:'Remind'},
  ];
  return (
    <aside style={{
      borderLeft: isMobile ? 'none' : '1px solid var(--hairline)',
      borderTop: isMobile ? '1px solid var(--hairline)' : 'none',
      background:'var(--paper-cream)', display:'flex', flexDirection:'column', minHeight:0,
    }}>
      {/* Validation summary */}
      <div style={{padding:'18px 22px', borderBottom:'1px solid var(--hairline)'}}>
        <Eyebrow>Validation · live</Eyebrow>
        <div style={{marginTop:10, display:'flex', alignItems:'baseline', gap:14}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:34, fontWeight:600, letterSpacing:'-0.03em', lineHeight:1}}>
            <span style={{color: issues.filter(i => i.lvl === 'err').length ? 'var(--ink)' : 'var(--ink-56)'}}>1</span>
            <span style={{color:'var(--fg-subtle)'}}>·</span>
            <span style={{color:'var(--ink-72)'}}>2</span>
          </div>
          <div style={{fontSize:12, color:'var(--fg-muted)', lineHeight:1.4}}>
            <div>1 blocker · 2 warnings</div>
            <div>Publish on fix</div>
          </div>
        </div>
        <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:8}}>
          {issues.map((i, ix) => (
            <div key={ix} style={{padding:'10px 12px', background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:8}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{
                  width:8, height:8, borderRadius:'50%',
                  background: i.lvl === 'err' ? 'var(--ink)' : 'var(--yellow)',
                  border: i.lvl === 'warn' ? '1px solid var(--ink)' : 'none',
                }}/>
                <Mono style={{fontSize:10.5, color:'var(--fg-subtle)', letterSpacing:'0.06em', textTransform:'uppercase'}}>{i.field}</Mono>
              </div>
              <div style={{fontSize:12.5, color:'var(--ink)', marginTop:5, letterSpacing:'-0.005em', lineHeight:1.4}}>{i.msg}</div>
              <button style={{marginTop:8, padding:'3px 10px', fontFamily:'var(--font-sans)', fontSize:11.5, background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:999, cursor:'pointer'}}>{i.fix}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Public preview thumb */}
      <div style={{padding:'18px 22px', borderBottom:'1px solid var(--hairline)'}}>
        <Eyebrow>Public viewer · preview</Eyebrow>
        <div style={{marginTop:12, padding:'14px 14px 16px', background:'var(--ink)', color:'var(--paper-pure)', borderRadius:12}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:'var(--yellow)'}}/>
            <Mono style={{fontSize:9.5, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>photonictag.eu/p/TX0448B</Mono>
          </div>
          <div style={{marginTop:10, fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15}}>
            Merino Crew <em style={{color:'var(--yellow)', fontStyle:'italic'}}>Ink</em>
          </div>
          <Mono style={{fontSize:10, color:'var(--paper-56)', marginTop:3, display:'block'}}>Northfield Textiles</Mono>
          <div style={{marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
            {['Wool 78%','rPET 18%','Elastane 4%','Origin PT'].map(x => (
              <Mono key={x} style={{fontSize:10, color:'var(--paper-72)', padding:'4px 6px', background:'var(--paper-08)', borderRadius:4}}>{x}</Mono>
            ))}
          </div>
          <div style={{marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <Mono style={{fontSize:9.5, color:'var(--paper-40)'}}>v1.5.0-draft</Mono>
            <div style={{width:32, height:32, background:'var(--yellow)', border:'2px solid var(--ink)'}}/>
          </div>
        </div>
      </div>

      {/* Audit trail (mini) */}
      <div style={{padding:'18px 22px', flex:1, overflow:'auto'}}>
        <Eyebrow>Audit · last 6</Eyebrow>
        <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:1, fontFamily:'var(--font-mono)', fontSize:11}}>
          {[
            ['14:32', 'EDIT',    'materials.wool.pct  72 → 78',  'Signe K.'],
            ['14:31', 'EDIT',    'materials.rPET.pct  22 → 18',  'Signe K.'],
            ['14:28', 'LINK',    'materials.rPET.cert GRS-#884', 'Signe K.'],
            ['11:02', 'FILL',    'care.washInstruction',          'Marta O.'],
            ['09:41', 'NUDGE',   'supply.tier3.dye',              'system'],
            ['Apr 14','SCHEMA', '+ chemicals.svhc.v2',            'system'],
          ].map((r, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'42px 50px 1fr', gap:8, padding:'4px 0', color:'var(--fg-muted)', borderTop: i === 0 ? 'none' : '1px solid var(--hairline-soft)'}}>
              <span style={{color:'var(--fg-subtle)'}}>{r[0]}</span>
              <span style={{color: r[1] === 'SCHEMA' ? 'var(--yellow-ink)' : 'var(--ink-72)', fontWeight:500}}>{r[1]}</span>
              <span style={{color:'var(--ink)', letterSpacing:'-0.005em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { PassportEditor });
