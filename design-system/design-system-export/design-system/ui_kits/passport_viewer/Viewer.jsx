// Public Passport Viewer — what a shopper/authority sees after scanning the QR.
// Dual-layered: plain-language for shoppers at the top of every section,
// technical/regulator detail kept but tucked beneath. Black-first, yellow accent.

const ViewerHeader = () => (
  <div style={{background:'var(--ink)', color:'var(--paper)', padding:'88px 20px 24px', position:'relative'}}>
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <BrandMark size={18}/>
        <Mono style={{fontSize:10.5, color:'var(--paper-56)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Digital product passport</Mono>
      </div>
      <span style={{display:'inline-flex', alignItems:'center', gap:5, padding:'2px 7px', background:'var(--yellow)', color:'var(--ink)', fontFamily:'var(--font-mono)', fontSize:10, fontWeight:500, letterSpacing:'0.02em'}}>
        <span style={{width:5, height:5, borderRadius:'50%', background:'var(--ink)'}}/>Verified · 2h ago
      </span>
    </div>
    <Mono style={{fontSize:11, color:'var(--paper-56)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Northfield Textiles</Mono>
    <h1 style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'-0.035em', lineHeight:0.98, margin:'8px 0 18px', color:'var(--paper)'}}>
      Merino Crew<br/>Ink<span style={{color:'var(--yellow)'}}>.</span>
    </h1>
    <p style={{fontSize:14.5, color:'var(--paper-72)', lineHeight:1.55, maxWidth:'40ch', margin:0}}>
      A midweight sweater made mostly from Australian wool, with some recycled plastic bottles for shape. Knit and sewn in Portugal.
    </p>
  </div>
);

// Headline score card — the single most important visual for non-technical users.
// Five traits, each with plain-language label + yellow/neutral bar.
const TrustCard = () => {
  const traits = [
    {label: 'Made from natural fibre',   score: 0.78, detail: '78% certified merino wool'},
    {label: 'Includes recycled material', score: 0.18, detail: '18% recycled PET bottles'},
    {label: 'Repair service available',   score: 1.00, detail: 'Free, for the life of the product'},
    {label: 'Free of harmful chemicals',  score: 1.00, detail: 'No SVHCs · REACH compliant'},
    {label: 'Recyclable at end-of-life',  score: 0.65, detail: 'Grade B · fibre-to-fibre'},
  ];
  return (
    <div style={{padding:'24px 20px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <Eyebrow>What this product is about</Eyebrow>
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:14}}>
        {traits.map((t, i) => (
          <div key={i}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
              <div style={{fontSize:13.5, color:'var(--fg)', letterSpacing:'-0.005em'}}>{t.label}</div>
              <Mono style={{fontSize:11, color:'var(--fg-muted)'}}>{t.detail}</Mono>
            </div>
            <div style={{height:4, background:'var(--ink-08)', position:'relative'}}>
              <div style={{
                position:'absolute', inset:'0 auto 0 0', width:`${t.score*100}%`,
                background: t.score >= 0.9 ? 'var(--yellow)' : 'var(--ink)',
              }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductHero = () => (
  <div style={{padding:'20px 20px 24px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
    <div style={{aspectRatio:'4/3', background:'var(--ink)', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(135deg, transparent 0 12px, var(--paper-08) 12px 13px)'}}/>
      <div style={{position:'absolute', left:14, top:14, right:14, display:'flex', justifyContent:'space-between'}}>
        <Mono style={{fontSize:10, color:'var(--paper-56)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Product image</Mono>
        <Mono style={{fontSize:10, color:'var(--paper-56)'}}>1 of 4</Mono>
      </div>
      <div style={{position:'absolute', left:14, bottom:14, right:14, display:'flex', alignItems:'flex-end', justifyContent:'space-between'}}>
        <div>
          <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Shown</Mono>
          <div style={{color:'var(--paper)', fontSize:13, marginTop:2}}>Ink · size M</div>
        </div>
        <span style={{width:28, height:28, background:'var(--yellow)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
          <Icon name="arrowR" size={14} stroke="#000" strokeWidth={2}/>
        </span>
      </div>
    </div>
  </div>
);

// Materials — visual donut-style fill + pie chips + story.
const Materials = () => {
  const mats = [
    {name:'Merino wool',   pct:78, origin:'Australia', cert:'RWS', color:'var(--ink)'},
    {name:'Recycled PET',  pct:18, origin:'Portugal',  cert:'GRS', color:'var(--yellow)'},
    {name:'Elastane',       pct:4, origin:'Italy',     cert:'—',   color:'var(--ink-40)'},
  ];
  return (
    <div style={{padding:'24px 20px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <Eyebrow>What it's made of</Eyebrow>
      <p style={{fontSize:14, color:'var(--fg-muted)', lineHeight:1.55, marginTop:10, marginBottom:18}}>
        Mostly natural merino wool, with recycled plastic bottles for shape, and a touch of stretch.
      </p>
      <div style={{display:'flex', height:12, marginBottom:18, border:'1px solid var(--ink)'}}>
        {mats.map(m => (
          <div key={m.name} style={{width:`${m.pct}%`, background:m.color}} title={`${m.name} ${m.pct}%`}/>
        ))}
      </div>
      <div style={{display:'flex', flexDirection:'column'}}>
        {mats.map((m, i) => (
          <div key={m.name} style={{display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderTop: i===0 ? 'none' : '1px solid var(--hairline)'}}>
            <div style={{width:12, height:12, background:m.color, border:'1px solid var(--ink)', flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
                <div style={{fontSize:14.5, fontWeight:500, color:'var(--fg)', letterSpacing:'-0.005em'}}>{m.name}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.015em'}}>
                  {m.pct}<span style={{fontSize:11, color:'var(--fg-muted)'}}>%</span>
                </div>
              </div>
              <Mono style={{fontSize:11, color:'var(--fg-muted)', display:'block', marginTop:3}}>
                From {m.origin}{m.cert !== '—' ? ` · ${m.cert} certified` : ''}
              </Mono>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Journey — horizontal stepper with flags, human sentence up top.
const Journey = () => {
  const stops = [
    {flag:'🇦🇺', place:'New South Wales',  role:'Wool shorn',  d:'Feb'},
    {flag:'🇵🇹', place:'Vila Nova de Gaia', role:'Spun into yarn', d:'Mar'},
    {flag:'🇮🇹', place:'Biella',            role:'Dyed',          d:'Mar'},
    {flag:'🇵🇹', place:'Barcelos',          role:'Knit & sewn',   d:'Apr', active:true},
  ];
  return (
    <div style={{padding:'24px 20px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <Eyebrow>Where it's been</Eyebrow>
      <p style={{fontSize:14, color:'var(--fg-muted)', lineHeight:1.55, marginTop:10, marginBottom:20}}>
        Four stops across three countries, all traceable to the farm.
      </p>
      <div style={{position:'relative'}}>
        <div style={{position:'absolute', left:12, right:12, top:10, height:1, background:'var(--hairline)', zIndex:0}}/>
        <div style={{display:'grid', gridTemplateColumns:`repeat(${stops.length}, 1fr)`, gap:0, position:'relative', zIndex:1}}>
          {stops.map((s, i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{
                width:20, height:20, margin:'0 auto 10px',
                background: s.active ? 'var(--yellow)' : 'var(--paper)',
                border: '1px solid var(--ink)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11,
              }}>
                {s.active ? '●' : i+1}
              </div>
              <div style={{fontSize:18, lineHeight:1, marginBottom:4}}>{s.flag}</div>
              <div style={{fontSize:12, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.005em', lineHeight:1.2}}>{s.place}</div>
              <Mono style={{fontSize:10, color:'var(--fg-muted)', display:'block', marginTop:3, lineHeight:1.3}}>{s.role}<br/>{s.d}</Mono>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:20, padding:'12px 14px', background:'var(--ink-04)', display:'flex', gap:10, alignItems:'center'}}>
        <Mono style={{fontSize:11, color:'var(--fg-muted)', flex:1}}>4 tiers · 11 suppliers · all disclosed</Mono>
        <button style={{padding:'5px 9px', fontFamily:'var(--font-mono)', fontSize:11, border:'1px solid var(--ink-24)', background:'var(--paper)', color:'var(--fg)', cursor:'pointer'}}>
          Full supply chain →
        </button>
      </div>
    </div>
  );
};

// Footprint — impact numbers with plain-language comparisons.
const Footprint = () => (
  <div style={{padding:'24px 20px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
    <Eyebrow>Footprint</Eyebrow>
    <p style={{fontSize:14, color:'var(--fg-muted)', lineHeight:1.55, marginTop:10, marginBottom:18}}>
      Measured from raw material to the factory gate. Independently verified.
    </p>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--hairline)', border:'1px solid var(--hairline)'}}>
      {[
        {label:'Carbon',        big:'6.4', unit:'kg CO₂e', plain:'About a 30 km drive in a small car'},
        {label:'Water',          big:'82',  unit:'litres',  plain:'Roughly one short bath'},
        {label:'Recycled content', big:'18', unit:'%',      plain:'From PET bottles collected in Europe'},
        {label:'Expected lifespan', big:'8', unit:'years',    plain:'With the free repair service'},
      ].map((s, i) => (
        <div key={i} style={{background:'var(--paper)', padding:'16px 14px'}}>
          <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{s.label}</Mono>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:6}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, letterSpacing:'-0.03em', lineHeight:1, fontVariantNumeric:'tabular-nums'}}>{s.big}</div>
            <Mono style={{fontSize:11, color:'var(--fg-muted)'}}>{s.unit}</Mono>
          </div>
          <div style={{fontSize:12, color:'var(--fg-muted)', marginTop:8, lineHeight:1.4}}>{s.plain}</div>
        </div>
      ))}
    </div>
  </div>
);

// Care — icon strip, plain labels.
const CareSection = () => (
  <div style={{padding:'24px 20px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
    <Eyebrow>How to care for it</Eyebrow>
    <div style={{marginTop:14, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0, border:'1px solid var(--hairline)'}}>
      {[
        ['30°','Cold wash'],
        ['⊘', 'No tumble dry'],
        ['P', 'Dry-clean safe'],
        ['△', 'No bleach'],
      ].map(([s,l], i) => (
        <div key={i} style={{padding:'14px 8px', textAlign:'center', borderRight: i<3 ? '1px solid var(--hairline)' : 'none'}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', lineHeight:1}}>{s}</div>
          <Mono style={{fontSize:10, color:'var(--fg-muted)', display:'block', marginTop:6}}>{l}</Mono>
        </div>
      ))}
    </div>
    <div style={{marginTop:14, padding:'16px', background:'var(--ink)', color:'var(--paper)', display:'flex', gap:14, alignItems:'center'}}>
      <div style={{flex:1}}>
        <div style={{fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, letterSpacing:'-0.015em'}}>Free repair, for life</div>
        <Mono style={{fontSize:11, color:'var(--paper-56)', display:'block', marginTop:3}}>Ship to Barcelos · 4 weeks turnaround</Mono>
      </div>
      <Button variant="primary" size="sm" icon="arrowR">Book</Button>
    </div>
  </div>
);

// For regulators — structured data, downloadable, collapsed by default feel.
const ForRegulators = () => (
  <div style={{padding:'24px 20px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
      <Eyebrow>For regulators</Eyebrow>
      <Mono style={{fontSize:10.5, color:'var(--fg-subtle)'}}>ESPR · CIRPASS v2</Mono>
    </div>
    <div style={{marginTop:14, border:'1px solid var(--hairline)'}}>
      {[
        ['GTIN',            '4006381333931'],
        ['Passport version', 'v1.4.2 · 19 Apr 2026'],
        ['ESPR scope',       'Textiles · 2024/1781'],
        ['ECHA SCIP',        'No SVHC declared'],
        ['REACH · Annex XVII','Compliant'],
        ['EU 1007/2011',     'Fibre content labelled'],
      ].map(([k, v], i) => (
        <div key={k} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderTop: i===0 ? 'none' : '1px solid var(--hairline)'}}>
          <Mono style={{fontSize:10.5, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{k}</Mono>
          <Mono style={{fontSize:12, color:'var(--fg)'}}>{v}</Mono>
        </div>
      ))}
    </div>
    <div style={{marginTop:14, padding:'14px 16px', border:'1px solid var(--hairline)', background:'var(--ink-04)'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <Icon name="shield" size={14} stroke="var(--fg)"/>
        <div style={{fontSize:13, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.005em'}}>eIDAS qualified signature</div>
      </div>
      <Mono style={{fontSize:11, color:'var(--fg-muted)', display:'block', marginTop:8, lineHeight:1.5}}>
        Buypass AS (QTSP · Norway)<br/>sha256:8b1a9e4d…c2f3c0b4
      </Mono>
      <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
        <button style={{padding:'6px 10px', fontFamily:'var(--font-mono)', fontSize:11, border:'1px solid var(--ink-24)', background:'var(--paper)', color:'var(--fg)', cursor:'pointer'}}>
          Signed PDF ↓
        </button>
        <button style={{padding:'6px 10px', fontFamily:'var(--font-mono)', fontSize:11, border:'1px solid var(--ink-24)', background:'var(--paper)', color:'var(--fg)', cursor:'pointer'}}>
          JSON-LD ↓
        </button>
        <button style={{padding:'6px 10px', fontFamily:'var(--font-mono)', fontSize:11, border:'1px solid var(--ink-24)', background:'var(--paper)', color:'var(--fg)', cursor:'pointer'}}>
          Verify signature
        </button>
      </div>
    </div>
  </div>
);

const ViewerFooter = () => (
  <div style={{padding:'18px 20px 36px', background:'var(--ink)', color:'var(--paper)'}}>
    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
      <BrandMark size={16}/>
      <Mono style={{fontSize:10.5, color:'var(--paper-56)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Hosted on photonictag</Mono>
    </div>
    <Mono style={{fontSize:10.5, color:'var(--paper-40)', display:'block', lineHeight:1.6}}>
      This passport is the responsibility of Northfield Textiles AB.<br/>
      Data verified 2h ago · photonictag.eu/p/TX0448B
    </Mono>
  </div>
);

const Viewer = () => (
  <div style={{background:'var(--paper)'}}>
    <ViewerHeader/>
    <ProductHero/>
    <TrustCard/>
    <Materials/>
    <Journey/>
    <Footprint/>
    <CareSection/>
    <ForRegulators/>
    <ViewerFooter/>
  </div>
);

Object.assign(window, { Viewer, ViewerHeader, TrustCard, ProductHero, Materials, Journey, Footprint, CareSection, ForRegulators, ViewerFooter });
