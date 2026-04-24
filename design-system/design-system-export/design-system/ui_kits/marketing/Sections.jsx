// Marketing site sections — black-first, yellow accent, editorial.

const Hero = () => (
  <section style={{background:'var(--ink)', color:'var(--paper)', position:'relative', overflow:'hidden', borderBottom:'1px solid var(--paper-12)'}}>
    <GrainLayer opacity={0.05} invert/>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto', padding:'120px 32px 128px', position:'relative'}}>
      <Reveal>
      <div style={{display:'inline-flex', alignItems:'center', gap:10, padding:'5px 12px 5px 6px', border:'1px solid var(--paper-12)', borderRadius:2, marginBottom:32}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:6, background:'var(--yellow)', color:'var(--ink)', padding:'3px 8px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:500}}>
          <span style={{width:5, height:5, borderRadius:'50%', background:'var(--ink)'}}/>Live
        </span>
        <Mono style={{fontSize:11, color:'var(--paper-72)'}}>CIRPASS v2 · ESPR Textiles · 72 days to filing</Mono>
      </div>
      <h1 style={{fontFamily:'var(--font-display)', fontSize:120, fontWeight:600, letterSpacing:'-0.045em', lineHeight:0.92, margin:0, color:'var(--paper)', maxWidth:'13ch'}}>
        EU DPP, without the panic<span style={{color:'var(--yellow)'}}>.</span>
      </h1>
      <p style={{fontSize:20, lineHeight:1.5, color:'var(--paper-72)', maxWidth:'56ch', marginTop:32, marginBottom:36}}>
        Issue, host, and update Digital Product Passports for every SKU. Audit-grade provenance, regulator-ready exports, and a public viewer the end-customer actually understands.
      </p>
      <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
        <Button variant="primary" size="lg" icon="arrowR">Start free audit</Button>
        <Button variant="secondary" size="lg" invert>Book a 20-min demo</Button>
        <Mono style={{marginLeft:12, fontSize:12, color:'var(--paper-40)'}}>No credit card · Import 50 SKUs in 6 min</Mono>
      </div>
      </Reveal>

      {/* Hero deck — signature LiveStamp + passport preview */}
      <Reveal delay={120} y={16}>
      <div style={{marginTop:88, display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:1, background:'var(--paper-12)', border:'1px solid var(--paper-12)'}}>
        <Tilt max={3} scale={1} style={{background:'var(--ink)'}}>
        <div style={{background:'var(--ink)', padding:'28px 32px'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, paddingBottom:18, borderBottom:'1px solid var(--paper-12)'}}>
            <BrandMark size={20}/>
            <Mono style={{fontSize:11, color:'var(--paper-56)'}}>app.photonictag.eu/passports/TX-0448-B</Mono>
            <Mono style={{marginLeft:'auto', fontSize:11, color:'var(--yellow)'}}>● v1.4.2 · verified</Mono>
          </div>
          <div style={{marginTop:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:28}}>
            <div>
              <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Northfield Textiles</Mono>
              <div style={{fontFamily:'var(--font-display)', fontSize:30, fontWeight:600, letterSpacing:'-0.025em', color:'var(--paper)', marginTop:6}}>Merino Crew Ink</div>
              <Mono style={{fontSize:12, color:'var(--paper-56)', marginTop:4, display:'block'}}>TX-0448-B · GTIN 4006381333931</Mono>
              <div style={{marginTop:22, display:'flex', flexDirection:'column', gap:10}}>
                {[
                  ['Materials','78% Merino · 18% rPET · 4% Elastane'],
                  ['Supply chain','4 tiers · 11 suppliers · AU → PT → IT'],
                  ['Recyclability','Grade B · end-of-life protocol'],
                  ['ECHA SCIP','No SVHCs declared · checked 2h ago'],
                ].map(([k,v]) => (
                  <div key={k}>
                    <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{k}</Mono>
                    <div style={{color:'var(--paper)', fontSize:13, marginTop:3}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div style={{background:'var(--yellow)', padding:16, color:'var(--ink)'}}>
                <Mono style={{fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase'}}>Scan to view</Mono>
                <div style={{width:'100%', aspectRatio:'1/1', background:'repeating-conic-gradient(var(--ink) 0% 25%, var(--yellow) 0% 50%) 0 0/14px 14px', border:'2px solid var(--ink)', marginTop:8}}/>
                <Mono style={{fontSize:10, marginTop:8, display:'block', textAlign:'center'}}>photonictag.eu/p/TX0448B</Mono>
              </div>
              <div style={{padding:'12px 14px', border:'1px solid var(--paper-12)'}}>
                <Mono style={{fontSize:10, color:'var(--yellow)', letterSpacing:'0.08em', textTransform:'uppercase'}}>eIDAS timestamp</Mono>
                <Mono style={{fontSize:11, color:'var(--paper-72)', display:'block', marginTop:4}}>Buypass AS QTSP<br/>token 8b1a9…4f3c</Mono>
              </div>
            </div>
          </div>
        </div>
        </Tilt>
        {/* SIGNATURE MOMENT — live stamping animation */}
        <div style={{background:'var(--ink)', display:'flex', flexDirection:'column'}}>
          <LiveStamp height={520}/>
        </div>
      </div>
      </Reveal>
    </div>
  </section>
);

const LogoBar = () => (
  <div style={{borderBottom:'1px solid var(--hairline)', padding:'28px 32px', background:'var(--paper)'}}>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto', display:'flex', alignItems:'center', gap:32}}>
      <Mono style={{fontSize:11, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0}}>Filing on behalf of →</Mono>
      <Marquee speed={45} style={{flex:1}}>
        {['NORTHFIELD','KASTNER & SÖHNE','LUMEN BATT','FOUR OAKS','HELIX ELEC.','VOLTA CELL','SEAHOUSE','MIRATEX','CORRIGAN OPTICS','BAUMANN MÖBEL'].map(n => (
          <span key={n} style={{color:'var(--ink-72)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:14, letterSpacing:'-0.01em', whiteSpace:'nowrap'}}>{n}</span>
        ))}
      </Marquee>
    </div>
  </div>
);

const BigStatement = () => (
  <section style={{background:'var(--yellow)', color:'var(--ink)', padding:'140px 32px', borderBottom:'1px solid var(--ink-24)'}}>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto'}}>
      <Eyebrow color="var(--ink-72)">The problem</Eyebrow>
      <h2 style={{fontFamily:'var(--font-display)', fontSize:88, fontWeight:600, letterSpacing:'-0.04em', lineHeight:0.96, color:'var(--ink)', marginTop:18, maxWidth:'16ch'}}>
        By July 1, 2026, every textile SKU sold in the EU needs a passport. Most brands have <span style={{textDecoration:'line-through', textDecorationThickness:6, textUnderlineOffset:4}}>none</span>.
      </h2>
      <div style={{marginTop:56, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:0}}>
        {[
          {k:'ESPR', v:'2024/1781', d:'First category (textiles) goes live July 2026. Batteries already live.'},
          {k:'Fines', v:'€50K+', d:'Per non-compliant SKU on EU market. Each member state enforces separately.'},
          {k:'Data fields', v:'140+', d:'Per passport. Sourced across your supply chain. Signed, timestamped.'},
        ].map((s, i) => (
          <div key={s.k} style={{padding:'24px 28px 0 0', borderTop:'1px solid var(--ink)', borderRight: i < 2 ? '1px solid var(--ink-24)' : 'none', paddingRight:i<2?32:0, paddingLeft:i>0?32:0}}>
            <Mono style={{fontSize:11, color:'var(--ink-72)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{s.k}</Mono>
            <div style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:700, letterSpacing:'-0.03em', color:'var(--ink)', marginTop:8, lineHeight:1}}>{s.v}</div>
            <p style={{fontSize:14, color:'var(--ink-72)', marginTop:14, lineHeight:1.55, maxWidth:'34ch'}}>{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const RegulationGrid = () => {
  const rows = [
    {reg:'ESPR · 2024/1781', name:'Textiles', st:'ok', from:'2026-07-01', days:72},
    {reg:'EU · 2023/1542', name:'Batteries', st:'live', from:'2026-02-18', days:'Live'},
    {reg:'EU · 2023/1542', name:'EV + Industrial', st:'ok', from:'2027-08-18', days:485},
    {reg:'ESPR · 2024/1781', name:'Furniture', st:'ok', from:'2027-01-01', days:256},
    {reg:'ESPR · 2024/1781', name:'Electronics', st:'wip', from:'2027-06-01', days:407},
    {reg:'CIRPASS', name:'Data model v2', st:'wip', from:'2026-Q3', days:'Draft'},
    {reg:'Detergents', name:'Household', st:'planned', from:'2028', days:'—'},
    {reg:'Toys', name:"Children's", st:'planned', from:'2028', days:'—'},
  ];
  return (
    <section style={{padding:'128px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:'var(--container-w)', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48, gap:40}}>
          <div>
            <Eyebrow>Regulation coverage</Eyebrow>
            <h2 style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'18ch'}}>Every ESPR category, in order of enforcement.</h2>
          </div>
          <p style={{fontSize:16, color:'var(--fg-muted)', maxWidth:'34ch', lineHeight:1.55}}>We track CIRPASS drafts and Delegated Acts. When the schema changes, your drafts migrate — we don't.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0, border:'1px solid var(--hairline)'}}>
          {rows.map((r, i) => {
            const col = i % 4; const row = Math.floor(i / 4);
            return (
              <div key={r.name} style={{padding:'22px 20px 18px', borderRight: col < 3 ? '1px solid var(--hairline)' : 'none', borderBottom: row < 1 ? '1px solid var(--hairline)' : 'none', position:'relative', background:'var(--paper)'}}>
                {r.st === 'live' && <span style={{position:'absolute', top:0, left:0, right:0, height:3, background:'var(--yellow)'}}/>}
                <Mono style={{fontSize:10, color:'var(--fg-subtle)', textTransform:'uppercase', letterSpacing:'0.1em'}}>{r.reg}</Mono>
                <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'var(--fg)', marginTop:8}}>{r.name}</div>
                <Mono style={{fontSize:11, color:'var(--fg-muted)', marginTop:4, display:'block'}}>{r.from}</Mono>
                <div style={{marginTop:20, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <Badge tone={r.st==='live'?'accent':r.st==='ok'?'solid':'default'}>{r.st==='live'?'Live':r.st==='ok'?'Supported':r.st==='wip'?'In progress':'Planned'}</Badge>
                  <Mono style={{fontSize:13, color: typeof r.days === 'number' ? 'var(--fg)' : 'var(--fg-muted)'}}>{typeof r.days === 'number' ? `${r.days}d` : r.days}</Mono>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FeatureSplit = () => (
  <section style={{padding:'128px 32px', background:'var(--ink)', color:'var(--paper)', borderBottom:'1px solid var(--paper-12)'}}>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:72, alignItems:'center'}}>
      <div>
        <Eyebrow color="var(--yellow)">Audit trail</Eyebrow>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, marginBottom:22, color:'var(--paper)'}}>Every edit. Every field. Defensible to the last byte.</h2>
        <p style={{fontSize:17, color:'var(--paper-72)', marginBottom:28, lineHeight:1.55}}>Immutable log of who changed what, when, and why. Hash-chained per passport. Exportable as signed PDF for EU market surveillance authorities.</p>
        <ul style={{listStyle:'none', padding:0, margin:0}}>
          {[
            ['Per-field change history', 'since first draft · keystroke-level'],
            ['SHA-256 hash chain', 'verifiable offline · no server needed'],
            ['eIDAS-qualified timestamp', 'on every publish · Buypass, GlobalSign, D-Trust'],
          ].map(([t,d]) => (
            <li key={t} style={{display:'flex', alignItems:'flex-start', gap:14, padding:'16px 0', borderTop:'1px solid var(--paper-12)'}}>
              <span style={{width:24, height:24, background:'var(--yellow)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2}}>
                <Icon name="check" size={14} stroke="#000" strokeWidth={2.4}/>
              </span>
              <div>
                <div style={{fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, letterSpacing:'-0.015em', color:'var(--paper)'}}>{t}</div>
                <div style={{fontSize:14, color:'var(--paper-56)', marginTop:2}}>{d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div style={{background:'var(--ink)', border:'1px solid var(--paper-12)', padding:'22px 24px', fontFamily:'var(--font-mono)', fontSize:12.5, lineHeight:1.75, color:'var(--paper-72)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, paddingBottom:14, marginBottom:10, borderBottom:'1px solid var(--paper-12)'}}>
          <span style={{width:8, height:8, background:'var(--yellow)'}}/>
          <Mono style={{color:'var(--paper)', fontSize:12}}>audit.log · TX-0448-B</Mono>
          <Mono style={{marginLeft:'auto', color:'var(--paper-40)', fontSize:11}}>tail -f</Mono>
        </div>
        {[
          ['2026-04-19 14:32:07Z','s.karlsson@northfield.eu','PUBLISH','TX-0448-B v1.4.1 → v1.4.2', 'y'],
          ['2026-04-19 14:31:52Z','s.karlsson@northfield.eu','EDIT   ','materials.wool.pct 72 → 78'],
          ['2026-04-19 14:31:44Z','s.karlsson@northfield.eu','EDIT   ','materials.wool.origin "unknown" → "AU · RWS"'],
          ['2026-04-19 14:28:01Z','system                  ','FAIL   ','GTIN checksum invalid · 4006381333931X'],
          ['2026-04-19 14:12:44Z','m.oduya@northfield.eu   ','REVIEW ','requested Auditor sign-off on BT-1102-A'],
          ['2026-04-19 09:04:11Z','system                  ','STAMP  ','eIDAS Buypass AS · token 8b1a9…4f3c', 'y'],
        ].map(([t,u,a,m,y]) => (
          <div key={t}><span style={{color:'var(--paper-40)'}}>{t}</span> <span style={{color:'var(--paper)'}}>{u}</span> <span style={{color: y ? 'var(--yellow)' : 'var(--paper-72)'}}>{a}</span> <span>{m}</span></div>
        ))}
      </div>
    </div>
  </section>
);

const Steps = () => (
  <section style={{padding:'128px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto'}}>
      <Eyebrow>From catalog to compliant</Eyebrow>
      <h2 style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'20ch'}}>Four steps. One weekend. Your first 50 SKUs live by Monday.</h2>
      <div style={{marginTop:64, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0, border:'1px solid var(--hairline)'}}>
        {[
          {n:'01', t:'Import', d:'Drop a CSV, connect your PIM, or paste 50 rows. We normalize GTINs, detect materials, flag conflicts.', time:'~6 min'},
          {n:'02', t:'Enrich', d:'Invite suppliers to fill their fields directly. No spreadsheet ping-pong. We track who owes what.', time:'async'},
          {n:'03', t:'Publish', d:'We validate against ESPR + CIRPASS, run SCIP cross-check, timestamp with eIDAS QTSP.', time:'<5 s/SKU'},
          {n:'04', t:'Monitor', d:'Regulation changes flow to your drafts. Expiring certs alert. Your auditor gets read-only.', time:'ongoing'},
        ].map((s, i) => (
          <div key={s.n} style={{padding:'28px 24px', borderRight: i < 3 ? '1px solid var(--hairline)' : 'none'}}>
            <Mono style={{fontSize:11, color:'var(--yellow-ink)', letterSpacing:'0.12em', background:'var(--yellow)', padding:'2px 8px'}}>{s.n}</Mono>
            <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, letterSpacing:'-0.02em', color:'var(--fg)', marginTop:16}}>{s.t}</div>
            <p style={{fontSize:14, color:'var(--fg-muted)', marginTop:10, lineHeight:1.55}}>{s.d}</p>
            <Mono style={{fontSize:11, color:'var(--fg-subtle)', marginTop:18, display:'block', paddingTop:14, borderTop:'1px solid var(--hairline)'}}>Time · {s.time}</Mono>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Quote = () => (
  <section style={{padding:'128px 32px', background:'var(--paper)', borderBottom:'1px solid var(--hairline)'}}>
    <div style={{maxWidth:960, margin:'0 auto'}}>
      <div style={{fontFamily:'var(--font-display)', fontSize:180, fontWeight:700, lineHeight:0.6, color:'var(--yellow)', letterSpacing:'-0.05em'}}>"</div>
      <blockquote style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:500, letterSpacing:'-0.025em', lineHeight:1.15, color:'var(--fg)', margin:'24px 0 0', maxWidth:'22ch'}}>
        We migrated 1,247 SKUs in a weekend. Our auditor signed off without a single follow-up question.
      </blockquote>
      <div style={{marginTop:40, display:'flex', alignItems:'center', gap:16}}>
        <div style={{width:44, height:44, background:'var(--ink)', color:'var(--yellow)', fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center'}}>SK</div>
        <div>
          <div style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--fg)'}}>Signe Karlsson</div>
          <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>Compliance lead · Northfield Textiles · 47k SKU catalog</Mono>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const tiers = [
    {name:'Starter', price:'€0', sub:'Up to 50 SKUs · community support', features:['ESPR Textiles + Furniture','Public passport viewer','CSV import','SHA-256 audit trail'], cta:'Start free'},
    {name:'Growth', price:'€1,900', sub:'per month · up to 10,000 SKUs', features:['All ESPR categories','API + webhooks','SSO + 4 roles','eIDAS qualified timestamps','99.9% SLA'], cta:'Start 30-day trial', featured:true},
    {name:'Enterprise', price:'Custom', sub:'Unlimited SKUs · dedicated infra', features:['Private deployment (EU regions)','SOC 2 + ISO 27001 report','DPA + custom MSA','Named compliance engineer'], cta:'Contact sales'},
  ];
  return (
    <section style={{padding:'128px 32px', background:'var(--ink)', color:'var(--paper)', borderBottom:'1px solid var(--paper-12)'}}>
      <div style={{maxWidth:'var(--container-w)', margin:'0 auto'}}>
        <div style={{textAlign:'center', maxWidth:680, margin:'0 auto 56px'}}>
          <Eyebrow color="var(--yellow)">Pricing</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, marginBottom:16, color:'var(--paper)'}}>Priced per SKU, not per seat.</h2>
          <p style={{fontSize:17, color:'var(--paper-72)', lineHeight:1.55}}>No user-count games. Invite your whole compliance team, your suppliers, and your auditors.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:0, border:'1px solid var(--paper-12)'}}>
          {tiers.map((t, i) => (
            <div key={t.name} style={{
              padding:'36px 32px',
              background: t.featured ? 'var(--yellow)' : 'var(--ink)',
              color: t.featured ? 'var(--ink)' : 'var(--paper)',
              borderRight: i < 2 ? '1px solid var(--paper-12)' : 'none',
              position:'relative',
            }}>
              {t.featured && <span style={{position:'absolute', top:16, right:16, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:500, color:'var(--ink)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Most chosen</span>}
              <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.015em'}}>{t.name}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.03em', marginTop:16, lineHeight:1}}>{t.price}</div>
              <div style={{fontSize:13.5, color: t.featured ? 'var(--ink-72)' : 'var(--paper-56)', marginTop:8}}>{t.sub}</div>
              <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:10, paddingTop:20, borderTop: t.featured ? '1px solid var(--ink-24)' : '1px solid var(--paper-12)'}}>
                {t.features.map(f => (
                  <div key={f} style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color: t.featured ? 'var(--ink)' : 'var(--paper-72)'}}>
                    <Icon name="check" size={13} stroke={t.featured ? '#000' : 'var(--yellow)'} strokeWidth={2.4}/> {f}
                  </div>
                ))}
              </div>
              <div style={{marginTop:28}}>
                {t.featured
                  ? <Button variant="ink" size="lg" style={{width:'100%', justifyContent:'center'}}>{t.cta}</Button>
                  : <Button variant="secondary" size="lg" invert style={{width:'100%', justifyContent:'center'}}>{t.cta}</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section style={{padding:'112px 32px', background:'var(--yellow)', color:'var(--ink)'}}>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:40, flexWrap:'wrap'}}>
      <div style={{flex:1, minWidth:360}}>
        <Eyebrow color="var(--ink-72)">Next window · ESPR Textiles · 2026-07-01</Eyebrow>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:80, fontWeight:600, letterSpacing:'-0.04em', lineHeight:0.95, marginTop:12, marginBottom:16, color:'var(--ink)'}}>72 days.<br/>Plenty, if you start Monday.</h2>
        <p style={{fontSize:17, color:'var(--ink-72)', maxWidth:'48ch', lineHeight:1.5}}>Import your SKUs, map your suppliers, publish. Your auditor gets read-only access on day one.</p>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:10, flexShrink:0}}>
        <Button variant="ink" size="lg" icon="arrowR">Start free audit</Button>
        <Button variant="secondary" size="lg">Read the ESPR briefing</Button>
      </div>
    </div>
  </section>
);

Object.assign(window, { Hero, LogoBar, BigStatement, RegulationGrid, FeatureSplit, Steps, Quote, Pricing, CTA });
