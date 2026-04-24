// Regulations page sections — editorial deep-dive on every regulation PhotonicTag covers.
// Visual rhythm mirrors the home page (cream paper, yellow accent, sharp radii).

// ─────────────────────────────────────────────────────────────
// Hero — regulations index
// ─────────────────────────────────────────────────────────────
const RegHero = () => (
  <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'80px 32px 72px'}}>
    <div style={{maxWidth:1280, margin:'0 auto'}}>
      <Reveal>
        <Eyebrow>Regulations · coverage and commitments</Eyebrow>
      </Reveal>
      <Reveal delay={80}>
        <h1 style={{fontFamily:'var(--font-display)', fontSize:96, fontWeight:600, letterSpacing:'-0.045em', lineHeight:0.96, margin:'20px 0 0', maxWidth:'18ch'}}>
          Every rule the EU writes, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>in one place</em>.
        </h1>
      </Reveal>
      <Reveal delay={160}>
        <p style={{fontSize:20, lineHeight:1.55, color:'var(--fg-muted)', maxWidth:'62ch', marginTop:28, marginBottom:40}}>
          PhotonicTag tracks every regulation, Delegated Act, and CIRPASS revision that touches Digital Product Passports. Each entry below tells you what the law requires, what we cover today, and the exact fields you'll need to fill.
        </p>
      </Reveal>
      <Reveal delay={220}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0, borderTop:'1px solid var(--hairline)', paddingTop:32}}>
          {[
            ['11',    'Regulations tracked'],
            ['247',   'Mandatory fields mapped'],
            ['14',    'Delegated Acts monitored'],
            ['< 72h', 'Schema-change turnaround'],
          ].map(([n, l], i) => (
            <div key={l} style={{paddingLeft: i === 0 ? 0 : 32, paddingRight:32, borderLeft: i > 0 ? '1px solid var(--hairline)' : 'none'}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{n}</div>
              <Mono style={{fontSize:12, color:'var(--fg-muted)', marginTop:12, display:'block'}}>{l}</Mono>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Timeline — a horizontal rail of enforcement dates
// ─────────────────────────────────────────────────────────────
const RegTimeline = () => {
  const events = [
    {date:'Feb 2026',   reg:'EU 2023/1542', label:'Batteries',       status:'live'},
    {date:'Jul 2026',   reg:'ESPR',         label:'Textiles',        status:'soon'},
    {date:'Q3 2026',    reg:'CIRPASS v2',   label:'Data model',      status:'soon'},
    {date:'Jan 2027',   reg:'ESPR',         label:'Furniture',       status:'next'},
    {date:'Jun 2027',   reg:'ESPR',         label:'Electronics',     status:'next'},
    {date:'Aug 2027',   reg:'EU 2023/1542', label:'EV batteries',    status:'next'},
    {date:'2028',       reg:'Toys Reg.',    label:"Children's",      status:'planned'},
    {date:'2028',       reg:'Detergents',   label:'Household',       status:'planned'},
  ];
  return (
    <section style={{background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)', padding:'96px 0'}}>
      <div style={{maxWidth:1280, margin:'0 auto', padding:'0 32px'}}>
        <Reveal>
          <Eyebrow>Enforcement timeline · today → 2028</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'22ch'}}>
            What's due, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>and when</em>.
          </h2>
        </Reveal>
      </div>
      {/* Horizontal scrolling rail */}
      <Reveal delay={120}>
        <div style={{marginTop:48, overflowX:'auto', paddingBottom:8}}>
          <div style={{maxWidth:1280, margin:'0 auto', padding:'0 32px', position:'relative', minWidth:1280}}>
            {/* Axis line */}
            <div style={{position:'absolute', left:48, right:48, top:44, height:1, background:'var(--ink-24)'}}/>
            <div style={{display:'grid', gridTemplateColumns:`repeat(${events.length}, minmax(140px, 1fr))`, gap:16, position:'relative'}}>
              {events.map((e, i) => (
                <div key={e.label + i} style={{display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center'}}>
                  <Mono style={{fontSize:12, color:'var(--ink)', fontWeight:500}}>{e.date}</Mono>
                  <div style={{
                    marginTop:14, width:16, height:16, borderRadius:'50%',
                    background: e.status === 'live' ? 'var(--yellow)' : 'var(--paper-pure)',
                    border: '2px solid var(--ink)',
                    boxShadow: e.status === 'live' ? '0 0 0 4px rgba(255,230,0,0.35)' : 'none',
                  }}/>
                  <div style={{marginTop:14, fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, letterSpacing:'-0.015em', color:'var(--ink)'}}>{e.label}</div>
                  <Mono style={{fontSize:10, color:'var(--fg-subtle)', marginTop:4, letterSpacing:'0.05em', textTransform:'uppercase'}}>{e.reg}</Mono>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Deep-dive panel — one per regulation. Editorial, detailed.
// ─────────────────────────────────────────────────────────────

// Content blocks used by the deep-dive panels below.
const REG_DATA = [
  {
    id:'espr-textiles',
    chip:'In force · Jul 2026',
    chipTone:'yellow',
    reg:'ESPR · Regulation (EU) 2024/1781',
    title:'Textiles & Apparel',
    lede:'The first ESPR Delegated Act. Covers every garment, accessory and home textile placed on the EU market.',
    timing:[
      {k:'Published',        v:'18 Jul 2024'},
      {k:'Delegated Act',    v:'Apr 2026 (draft adopted)'},
      {k:'Filing window',    v:'1 Jul 2026'},
      {k:'Transition',       v:'6 months to sell existing stock'},
    ],
    fields:[
      {group:'Identity',     items:['GTIN-13','Model name','Manufacturer GLN','EU Representative','Country of origin']},
      {group:'Materials',    items:['Fibre composition (%)','Recycled content (%)','Dyes & finishes','Trims & hardware','Chemical substances (REACH/SCIP)']},
      {group:'Supply chain', items:['Tier 1 factory','Tier 2 fabric mill','Tier 3 yarn/fibre','Country at each tier','ILO declarations']},
      {group:'Circularity',  items:['Care instructions','Repair guidance','Fibre-to-fibre recyclability grade','Take-back scheme','End-of-life']},
    ],
    coverage:'live',
    notes:'PhotonicTag ships a Textiles template pre-mapped to Akeneo and Centra. The SCIP check hits ECHA live; if a new SVHC lands overnight, the passport flags by morning.',
  },
  {
    id:'eu-batteries',
    chip:'Live · Feb 2026',
    chipTone:'yellow',
    reg:'Regulation (EU) 2023/1542',
    title:'Batteries & Accumulators',
    lede:'Applies to all batteries placed on the EU market. Phased: portable → LMT → EV → industrial.',
    timing:[
      {k:'Published',        v:'12 Jul 2023'},
      {k:'Portable',         v:'18 Feb 2026 — live'},
      {k:'LMT batteries',    v:'18 Aug 2026'},
      {k:'EV batteries',     v:'18 Aug 2027'},
    ],
    fields:[
      {group:'Identity',     items:['Battery ID','Manufacturer','Manufacturing facility','Place on market date']},
      {group:'Chemistry',    items:['Electrochemical couple','Mass of key materials','Cobalt, lithium, nickel, lead (%)','Critical raw materials']},
      {group:'Performance',  items:['Nominal capacity','Expected lifetime','Internal resistance','Cycle count','Thermal behaviour']},
      {group:'Supply chain', items:['Raw material due diligence','Third-party verification body','CO₂ footprint (kgCO₂e/kWh)','Recycled content']},
    ],
    coverage:'live',
    notes:'Portable chemistry is live and actively filing. EV-battery extension is in private beta — contact sales for early access.',
  },
  {
    id:'espr-furniture',
    chip:'Planned · Jan 2027',
    chipTone:'plain',
    reg:'ESPR · Regulation (EU) 2024/1781',
    title:'Furniture (home & office)',
    lede:'Covers seating, tables, storage, and office furniture. Emphasis on wood origin, finishes, and decade-long spares.',
    timing:[
      {k:'Working plan',     v:'Adopted May 2025'},
      {k:'Delegated Act',    v:'Expected Q4 2026'},
      {k:'Filing window',    v:'1 Jan 2027 (proposed)'},
      {k:'Spare-parts',      v:'10 years minimum'},
    ],
    fields:[
      {group:'Identity',     items:['Product code','Designer / brand','Country of assembly','Intended use class']},
      {group:'Materials',    items:['Wood species + FSC/PEFC','Panel composition','Foams & fillings','Textiles covers','Metal content']},
      {group:'Finishes',     items:['Lacquers & stains','VOC declarations','Flame retardants','Biocidal treatments']},
      {group:'Repair',       items:['Spare-parts list','Spare-parts availability','Disassembly guide','Recyclability grade']},
    ],
    coverage:'ok',
    notes:'Schema tracks the published working plan. We\'ll migrate drafts automatically when the Delegated Act is adopted.',
  },
  {
    id:'espr-electronics',
    chip:'Planned · Jun 2027',
    chipTone:'plain',
    reg:'ESPR · Regulation (EU) 2024/1781',
    title:'Consumer Electronics',
    lede:'Phones, tablets, small kitchen appliances, and consumer IT. Builds on the existing Ecodesign Directive.',
    timing:[
      {k:'Working plan',     v:'Adopted May 2025'},
      {k:'Delegated Act',    v:'Expected H1 2027'},
      {k:'Filing window',    v:'Jun 2027 (proposed)'},
      {k:'Repair score',     v:'Mandatory · Class A–E'},
    ],
    fields:[
      {group:'Identity',     items:['Model','Serial range','CE mark body','Energy class']},
      {group:'Materials',    items:['Bill of materials','Critical raw materials (%)','Conflict minerals','Recycled content']},
      {group:'Repair',       items:['Repair score','Spare-parts catalogue','Average repair cost','Firmware support window']},
      {group:'End-of-life',  items:['WEEE category','Take-back route','Battery removal instructions','Recycler network']},
    ],
    coverage:'wip',
    notes:'Electronics schema is in draft. Join the beta cohort to co-design the fields.',
  },
  {
    id:'cirpass',
    chip:'Data model · Q3 2026',
    chipTone:'plain',
    reg:'CIRPASS v2 · Commission-backed consortium',
    title:'CIRPASS data model',
    lede:'The cross-regulation data model every DPP serializes into. Built on JSON-LD, aligned with GS1 Digital Link.',
    timing:[
      {k:'v1 frozen',        v:'Oct 2023'},
      {k:'v2 draft',         v:'Mar 2026'},
      {k:'v2 ratification',  v:'Q3 2026 (expected)'},
      {k:'JSON-LD context',  v:'versioned, semver'},
    ],
    fields:[
      {group:'Core',         items:['@context','productId','regulatoryContext','issuer','issuanceDate']},
      {group:'Supply',       items:['supplyChainActor[]','facility[]','materialFlow[]','certification[]']},
      {group:'Trust',        items:['signature','timestamp','verificationMethod','revocationList']},
      {group:'Presentation', items:['viewerHints','consumerLocale[]','regulatorBundle']},
    ],
    coverage:'wip',
    notes:'Every passport we issue is valid under both v1.1 and the v2 draft. When v2 ratifies, nothing in your catalog breaks.',
  },
];

const RegPanel = ({ data, idx }) => {
  const flip = idx % 2 === 1;
  const chipBg = data.chipTone === 'yellow' ? 'var(--yellow)' : 'var(--paper-pure)';
  const chipBorder = data.chipTone === 'yellow' ? 'var(--ink)' : 'var(--hairline)';
  return (
    <section
      data-screen-label={`Regulation · ${data.title}`}
      style={{
        background: idx % 2 === 0 ? 'var(--paper)' : 'var(--paper-cream)',
        borderBottom:'1px solid var(--hairline)',
        padding:'96px 32px',
      }}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        {/* Anchor target spacer */}
        <div id={data.id} style={{scrollMarginTop:96}}/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:80, alignItems:'flex-start'}}>

          {/* LEFT: lede column */}
          <div style={{order: flip ? 2 : 1, position:'sticky', top:96}}>
            <Reveal>
              <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', borderRadius:999, background:chipBg, border:'1px solid', borderColor:chipBorder}}>
                {data.chipTone === 'yellow' && <span style={{width:5, height:5, borderRadius:'50%', background:'var(--ink)'}}/>}
                <Mono style={{fontSize:11, color:'var(--ink)', letterSpacing:'0.04em', fontWeight:500}}>{data.chip}</Mono>
              </div>
              <Mono style={{fontSize:11, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:20, display:'block'}}>{data.reg}</Mono>
              <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:10, maxWidth:'14ch'}}>
                {data.title}
              </h2>
              <p style={{fontSize:17, color:'var(--fg-muted)', marginTop:20, lineHeight:1.55, maxWidth:'40ch'}}>
                {data.lede}
              </p>

              {/* Timing table */}
              <div style={{marginTop:32, paddingTop:24, borderTop:'1px solid var(--hairline)'}}>
                <Eyebrow>Key dates</Eyebrow>
                <div style={{marginTop:12, display:'flex', flexDirection:'column'}}>
                  {data.timing.map((t, i) => (
                    <div key={t.k} style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', padding:'10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hairline-soft)'}}>
                      <Mono style={{fontSize:12, color:'var(--fg-subtle)'}}>{t.k}</Mono>
                      <div style={{fontSize:14, color:'var(--ink)', letterSpacing:'-0.005em'}}>{t.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ops note */}
              <div style={{marginTop:28, padding:'18px 20px', background: data.coverage === 'live' ? 'var(--yellow)' : 'var(--paper-pure)', border:'1px solid', borderColor: data.coverage === 'live' ? 'var(--ink)' : 'var(--hairline)', borderRadius:12}}>
                <Mono style={{fontSize:10, color:'var(--ink-72)', letterSpacing:'0.08em', textTransform:'uppercase'}}>PhotonicTag status</Mono>
                <p style={{fontSize:14, color:'var(--ink)', marginTop:6, lineHeight:1.5, letterSpacing:'-0.005em'}}>{data.notes}</p>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: fields grid */}
          <div style={{order: flip ? 1 : 2}}>
            <Reveal delay={120}>
              <Eyebrow>Mandatory data points · what you'll fill</Eyebrow>
              <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                {data.fields.map((f, gi) => (
                  <div key={f.group} style={{
                    background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:14, padding:'20px 20px 22px',
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                      <div style={{fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, letterSpacing:'-0.015em', color:'var(--ink)'}}>{f.group}</div>
                      <Mono style={{fontSize:11, color:'var(--fg-subtle)'}}>{f.items.length}</Mono>
                    </div>
                    <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:8}}>
                      {f.items.map(it => (
                        <div key={it} style={{display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:'var(--ink-72)', lineHeight:1.45, letterSpacing:'-0.005em'}}>
                          <span style={{flexShrink:0, width:4, height:4, borderRadius:'50%', background:'var(--ink-40)', marginTop:8}}/>
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Example payload */}
              <div style={{marginTop:16, background:'var(--ink)', color:'var(--paper-pure)', borderRadius:14, padding:'20px 22px 22px', fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.7, overflowX:'auto'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                  <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Example payload · JSON-LD</Mono>
                  <span style={{marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:6, padding:'2px 8px', background:'var(--paper-08)', borderRadius:999}}>
                    <span style={{width:5, height:5, borderRadius:'50%', background:'var(--yellow)'}}/>
                    <Mono style={{fontSize:10, color:'var(--paper-72)'}}>validates</Mono>
                  </span>
                </div>
                <pre style={{margin:0, color:'var(--paper-72)', whiteSpace:'pre', fontFamily:'inherit', fontSize:12}}>{regPayloadFor(data.id)}</pre>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

// Tiny payload samples, one per regulation.
const regPayloadFor = (id) => {
  if (id === 'espr-textiles') return `{
  "@context": "https://cirpass.eu/v2",
  "regulation": "ESPR/2024/1781#textiles",
  "productId": "urn:gtin:4006381333931",
  "materials": [
    { "fibre": "Merino wool",  "pct": 78 },
    { "fibre": "rPET",         "pct": 18, "recycled": true },
    { "fibre": "Elastane",     "pct":  4 }
  ],
  "repair": { "instructions": "url", "grade": "B" },
  "takeBack": { "scheme": "TextilesEU", "since": "2025-11" }
}`;
  if (id === 'eu-batteries') return `{
  "@context": "https://cirpass.eu/v2",
  "regulation": "EU/2023/1542",
  "batteryId": "LB-55-X-2026-000442",
  "chemistry": "NMC811",
  "capacity": { "nominal_wh": 55.0, "voltage_v": 3.7 },
  "footprint": { "kgco2e_per_kwh": 68.4, "verifier": "TÜV Rheinland" },
  "recycledContent": { "cobalt_pct": 14, "nickel_pct": 6, "lithium_pct": 0 }
}`;
  if (id === 'espr-furniture') return `{
  "@context": "https://cirpass.eu/v2",
  "regulation": "ESPR/2024/1781#furniture",
  "productId": "urn:brand:FO-OAK-CHAIR-01",
  "wood": [{ "species": "Quercus robur", "origin": "PL", "cert": "FSC 100%" }],
  "finish": { "voc_g_per_l": 38, "brand": "Osmo", "biocide": false },
  "spares": { "availableUntil": "2037-01-31", "items": 6 }
}`;
  if (id === 'espr-electronics') return `{
  "@context": "https://cirpass.eu/v2",
  "regulation": "ESPR/2024/1781#electronics",
  "productId": "urn:model:HX-PHN-14",
  "repairScore": "B",
  "firmwareSupportUntil": "2032-06-01",
  "spares": { "screen": 39.00, "battery": 29.00, "mainboard": 89.00 },
  "weee": { "category": "4", "takeBack": "url" }
}`;
  return `{
  "@context": "https://cirpass.eu/v2",
  "productId": "urn:gtin:…",
  "regulatoryContext": ["ESPR/2024/1781", "EU/2023/1542"],
  "issuer":    { "did": "did:web:photonictag.eu" },
  "signature": { "type": "eidas", "qtsp": "Buypass AS" }
}`;
};

// ─────────────────────────────────────────────────────────────
// Index nav — sticky sidebar TOC
// ─────────────────────────────────────────────────────────────
const RegIndexNav = () => (
  <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'36px 32px'}}>
    <div style={{maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
      <Mono style={{fontSize:11, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Jump to →</Mono>
      {REG_DATA.map(d => (
        <a key={d.id} href={`#${d.id}`} style={{
          padding:'6px 12px', background:'var(--paper-cream)', border:'1px solid var(--hairline)', borderRadius:999,
          fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.005em',
        }}>
          {d.title}
        </a>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Compliance commitment — editorial block at the bottom
// ─────────────────────────────────────────────────────────────
const RegCommitment = () => (
  <section style={{background:'var(--ink)', color:'var(--paper-pure)', padding:'128px 32px'}}>
    <div style={{maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:80, alignItems:'center'}}>
      <Reveal>
        <Eyebrow color="var(--paper-56)">Our commitment</Eyebrow>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:72, fontWeight:600, letterSpacing:'-0.04em', lineHeight:0.98, marginTop:18, maxWidth:'14ch', color:'var(--paper-pure)'}}>
          Regulation changes? <em style={{fontStyle:'italic', color:'var(--yellow)'}}>Your drafts migrate</em>.
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <div style={{display:'flex', flexDirection:'column', gap:20}}>
          {[
            ['72-hour SLA on schema changes', 'When a Delegated Act or CIRPASS revision is published, the affected fields ship to your tenant within 72 hours — migration included.'],
            ['Backwards-compatible by default', 'Every passport you publish today validates against v1.1 today and v2 on ratification. No re-issuance, no downtime.'],
            ['Regulator read-only access', 'Invite your national authority with a read-only role. They see the same source-of-truth you see — with full audit trail.'],
            ['Monitored by a public tracker', 'We maintain a public page showing every regulation we track, its coverage status, and the date it shipped. No black box.'],
          ].map(([h, d]) => (
            <div key={h} style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'flex-start', paddingTop:20, borderTop:'1px solid var(--paper-12)'}}>
              <div style={{width:36, height:36, background:'var(--yellow)', color:'var(--ink)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Icon name="check" size={16} stroke="var(--ink)" strokeWidth={2.4}/>
              </div>
              <div>
                <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, letterSpacing:'-0.015em', color:'var(--paper-pure)'}}>{h}</div>
                <p style={{fontSize:14, color:'var(--paper-72)', marginTop:8, lineHeight:1.55}}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Exported composite
// ─────────────────────────────────────────────────────────────
const RegulationsAllPanels = () => REG_DATA.map((d, i) => <RegPanel key={d.id} data={d} idx={i}/>);

Object.assign(window, {
  RegHero, RegTimeline, RegIndexNav, RegPanel, RegulationsAllPanels, RegCommitment, REG_DATA,
});
