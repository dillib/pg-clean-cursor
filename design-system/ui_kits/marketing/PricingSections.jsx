// Pricing page sections — detailed, editorial, same cream/yellow system.

// ─────────────────────────────────────────────────────────────
// Hero — big price declaration
// ─────────────────────────────────────────────────────────────
const PriceHero = () => (
  <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'80px 32px 72px'}}>
    <div style={{maxWidth:1280, margin:'0 auto', textAlign:'center'}}>
      <Reveal><Eyebrow>Pricing · simple, per-SKU</Eyebrow></Reveal>
      <Reveal delay={80}>
        <h1 style={{fontFamily:'var(--font-display)', fontSize:104, fontWeight:600, letterSpacing:'-0.045em', lineHeight:0.95, margin:'20px auto 0', maxWidth:'14ch'}}>
          Per SKU, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>never per seat</em>.
        </h1>
      </Reveal>
      <Reveal delay={160}>
        <p style={{fontSize:20, color:'var(--fg-muted)', lineHeight:1.55, maxWidth:'54ch', margin:'28px auto 0'}}>
          Invite your compliance team, suppliers, auditors, and the whole regulator's office — it doesn't change the price. You pay for passports, not people.
        </p>
      </Reveal>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// Tier table — 3 plans, detailed features
// ─────────────────────────────────────────────────────────────
const PriceTiers = () => {
  const tiers = [
    {
      name:'Starter', price:'€0', cadence:'forever · up to 50 SKUs',
      desc:'For brands running their first compliance pilot.',
      features:[
        'All ESPR categories · schema & validator',
        'Hosted public viewer',
        'CSV import · manual',
        '1 signing key · shared QTSP',
        '7-day audit log retention',
        'Community Slack',
      ],
      cta:'Start free',
    },
    {
      name:'Growth', price:'€1,900', cadence:'per month · up to 10,000 SKUs',
      desc:'For brands filing their first real season of passports.',
      features:[
        'Everything in Starter',
        'PIM + ERP integrations (Akeneo, Pimcore, SAP, Centra)',
        'Supplier portal · unlimited invitees',
        'API + webhooks · 100k calls/day',
        'eIDAS QTSP · dedicated signing key',
        'SSO (SAML, OIDC) · 4 role templates',
        '99.9% SLA · Email + in-app support',
        '7-year audit log retention',
      ],
      cta:'Start 30-day trial', featured:true,
    },
    {
      name:'Enterprise', price:'Custom', cadence:'unlimited SKUs',
      desc:'For groups with private deployment, audit scope, or strict data residency.',
      features:[
        'Everything in Growth',
        'Private deployment (AWS eu-west / eu-north / eu-central)',
        'Customer-managed encryption keys',
        'SOC 2 Type II + ISO 27001 report · under DPA',
        'Custom MSA + data processing agreement',
        'Named compliance engineer',
        '99.99% SLA · dedicated Slack channel',
        'Unlimited audit log retention',
      ],
      cta:'Contact sales',
    },
  ];
  return (
    <section style={{background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, alignItems:'stretch'}}>
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i*80} y={20}>
              <div style={{
                padding:36, borderRadius:24, height:'100%',
                background: t.featured ? 'var(--yellow)' : 'var(--paper-pure)',
                border:'1px solid', borderColor: t.featured ? 'var(--ink)' : 'var(--hairline)',
                display:'flex', flexDirection:'column',
                position:'relative',
              }}>
                {t.featured && (
                  <div style={{position:'absolute', top:-12, left:24, background:'var(--ink)', color:'var(--yellow)', padding:'4px 12px', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'0.08em', textTransform:'uppercase'}}>
                    Most filed
                  </div>
                )}
                <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.015em'}}>{t.name}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:60, fontWeight:600, letterSpacing:'-0.04em', marginTop:18, lineHeight:1}}>{t.price}</div>
                <div style={{fontSize:13, color: t.featured ? 'var(--ink-72)' : 'var(--fg-muted)', marginTop:10}}>{t.cadence}</div>
                <p style={{fontSize:14.5, color: t.featured ? 'var(--ink-72)' : 'var(--fg-muted)', marginTop:20, lineHeight:1.55}}>{t.desc}</p>
                <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:10, paddingTop:24, borderTop: t.featured ? '1px solid var(--ink-24)' : '1px solid var(--hairline)', flex:1}}>
                  {t.features.map(f => (
                    <div key={f} style={{display:'flex', alignItems:'flex-start', gap:10, fontSize:13.5, color:'var(--ink)', lineHeight:1.5, letterSpacing:'-0.005em'}}>
                      <Icon name="check" size={13} stroke="var(--ink)" strokeWidth={2.4} style={{marginTop:4}}/> {f}
                    </div>
                  ))}
                </div>
                <button style={{
                  marginTop:28, height:52, padding:'0 20px', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                  background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:12,
                  fontFamily:'var(--font-sans)', fontSize:15, fontWeight:500, letterSpacing:'-0.01em',
                  cursor:'pointer', width:'100%',
                }}>{t.cta} <Icon name="arrowR" size={14} stroke="currentColor" strokeWidth={2}/></button>
              </div>
            </Reveal>
          ))}
        </div>
        <Mono style={{textAlign:'center', display:'block', marginTop:28, fontSize:12, color:'var(--fg-subtle)'}}>
          All prices in EUR · VAT reverse-charged for EU VAT-registered customers
        </Mono>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Volume calculator — simple slider
// ─────────────────────────────────────────────────────────────
const PriceCalculator = () => {
  const [skus, setSkus] = React.useState(2500);
  const tierFor = (n) => {
    if (n <= 50) return {name:'Starter', price:0};
    if (n <= 10000) return {name:'Growth', price:1900};
    return {name:'Enterprise', price:null};
  };
  const tier = tierFor(skus);
  return (
    <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:80, alignItems:'center'}}>
        <Reveal>
          <Eyebrow>Volume</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:52, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'14ch'}}>
            Price it, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>in ten seconds</em>.
          </h2>
          <p style={{fontSize:16, color:'var(--fg-muted)', marginTop:20, lineHeight:1.55, maxWidth:'40ch'}}>
            Drag the slider to your catalog size. The tier updates live. Overages at €0.24/SKU/month once you cross the Growth ceiling.
          </p>
        </Reveal>
        <Reveal delay={120} y={20}>
          <div style={{background:'var(--paper-cream)', border:'1px solid var(--hairline)', borderRadius:24, padding:40}}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
              <Mono style={{fontSize:11, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Your catalog size</Mono>
              <Mono style={{fontSize:11, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Matching tier</Mono>
            </div>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:10}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1, fontVariantNumeric:'tabular-nums'}}>{skus.toLocaleString()}</div>
              <div style={{
                padding:'6px 14px', background:'var(--yellow)', border:'1px solid var(--ink)', borderRadius:999,
                fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, letterSpacing:'-0.015em',
              }}>{tier.name}</div>
            </div>
            <input type="range" min="10" max="25000" step="10" value={skus} onChange={e => setSkus(+e.target.value)} style={{
              width:'100%', marginTop:30, accentColor:'var(--ink)',
            }}/>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}>
              <Mono style={{fontSize:11, color:'var(--fg-subtle)'}}>10</Mono>
              <Mono style={{fontSize:11, color:'var(--fg-subtle)'}}>25,000+</Mono>
            </div>
            <div style={{marginTop:32, padding:'20px 22px', background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:14}}>
              <Mono style={{fontSize:10.5, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Monthly cost</Mono>
              <div style={{display:'flex', alignItems:'baseline', gap:10, marginTop:6}}>
                {tier.price === 0 && <span style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'-0.035em'}}>Free</span>}
                {tier.price !== null && tier.price > 0 && <>
                  <span style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'-0.035em'}}>€{tier.price.toLocaleString()}</span>
                  <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>/ month</Mono>
                </>}
                {tier.price === null && <span style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'-0.035em'}}>Let's talk</span>}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Comparison table — all three tiers side-by-side
// ─────────────────────────────────────────────────────────────
const PriceCompare = () => {
  const groups = [
    {label:'Passports', rows:[
      ['SKU limit',              '50',                '10,000',              'Unlimited'],
      ['Categories',             'All ESPR',          'All ESPR',            'All ESPR + beta'],
      ['CIRPASS v2',             true,                true,                  true],
      ['Schema migration SLA',   '—',                 '72 hours',            '24 hours'],
    ]},
    {label:'Integrations', rows:[
      ['CSV import',             true,                true,                  true],
      ['PIM / ERP sync',         '—',                 'Akeneo · SAP · Centra', 'Custom + above'],
      ['API + webhooks',         '1k / day',          '100k / day',          'Unlimited'],
      ['Terraform provider',     '—',                 true,                  true],
    ]},
    {label:'Trust & signing', rows:[
      ['eIDAS QTSP signature',   'Shared',            'Dedicated',           'BYO key'],
      ['Hash-chained audit log', '7 days',            '7 years',             'Unlimited'],
      ['Regulator read-only',    '—',                 true,                  true],
    ]},
    {label:'Security', rows:[
      ['SSO (SAML, OIDC)',       '—',                 true,                  true],
      ['Custom roles',           '1',                 '4',                   'Unlimited'],
      ['SOC 2 Type II report',   '—',                 true,                  true],
      ['Private deployment',     '—',                 '—',                   true],
    ]},
    {label:'Support', rows:[
      ['Community Slack',        true,                true,                  true],
      ['Email support',          '—',                 '< 24h',               '< 4h'],
      ['Named compliance eng.',  '—',                 '—',                   true],
      ['SLA',                    '—',                 '99.9%',               '99.99%'],
    ]},
  ];
  const Cell = ({ v }) => {
    if (v === true)  return <Icon name="check" size={14} stroke="var(--ink)" strokeWidth={2.4}/>;
    if (v === '—')   return <span style={{color:'var(--fg-subtle)'}}>—</span>;
    return <Mono style={{fontSize:13, color:'var(--ink)', letterSpacing:'-0.005em'}}>{v}</Mono>;
  };
  return (
    <section style={{background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <Eyebrow>Compare plans · every line</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'20ch'}}>
            What changes, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>at each tier</em>.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{marginTop:48, background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:20, overflow:'hidden'}}>
            {/* Header row */}
            <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr', padding:'18px 28px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
              <Mono style={{fontSize:10.5, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Feature</Mono>
              {['Starter','Growth','Enterprise'].map((n, i) => (
                <div key={n} style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, letterSpacing:'-0.015em', color:'var(--ink)', position:'relative'}}>
                  {n}
                  {n === 'Growth' && <span style={{marginLeft:8, display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--yellow)', border:'1px solid var(--ink)', verticalAlign:'middle'}}/>}
                </div>
              ))}
            </div>
            {groups.map((g, gi) => (
              <div key={g.label}>
                <div style={{padding:'14px 28px 10px', background:'var(--paper)', borderTop: gi === 0 ? 'none' : '1px solid var(--hairline)', borderBottom:'1px solid var(--hairline-soft)'}}>
                  <Mono style={{fontSize:11, color:'var(--ink)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600}}>{g.label}</Mono>
                </div>
                {g.rows.map((r, ri) => (
                  <div key={r[0]} style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr', padding:'14px 28px', borderTop: ri === 0 ? 'none' : '1px solid var(--hairline-soft)', alignItems:'center'}}>
                    <div style={{fontSize:14, color:'var(--ink-72)', letterSpacing:'-0.005em'}}>{r[0]}</div>
                    <Cell v={r[1]}/>
                    <Cell v={r[2]}/>
                    <Cell v={r[3]}/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────
const PriceFAQ = () => {
  const faqs = [
    {q:'What counts as a "SKU"?', a:'One unique product variant. Colours, sizes, and packs of the same thing count separately if they file separately. If you sell a T-shirt in 3 colours × 5 sizes, that\'s 15 SKUs.'},
    {q:'Do my suppliers need a seat?', a:'No. Suppliers get a free, scoped invite to fill only their fields. There\'s no cap on supplier invitees on any plan.'},
    {q:'What if I go over my SKU limit?', a:'Growth has a soft ceiling at 10,000. Overages bill at €0.24/SKU/month. We\'ll email you at 80%, 90%, and 100% — no surprise invoices.'},
    {q:'Can I cancel? Export my data?', a:'Yes, monthly. On cancellation we keep your passports live for the required 10-year retention window and hand you a full JSON-LD + signature bundle.'},
    {q:'Is there a non-profit rate?', a:'Yes — registered non-profits and public-sector regulators get Growth free. Email hello@photonictag.eu with your registration number.'},
    {q:'Can I try Enterprise features?', a:'Book a sandbox. We\'ll spin up a private-deployment preview on eu-west in 48 hours with a scoped dataset. No contract required.'},
  ];
  return (
    <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:80, alignItems:'flex-start'}}>
        <Reveal>
          <Eyebrow>Questions · answered</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'14ch'}}>
            The <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>fine print</em>.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{display:'flex', flexDirection:'column'}}>
            {faqs.map((f, i) => (
              <div key={f.q} style={{padding:'22px 0', borderTop: i === 0 ? '1px solid var(--hairline)' : '1px solid var(--hairline-soft)'}}>
                <div style={{fontFamily:'var(--font-display)', fontSize:19, fontWeight:600, letterSpacing:'-0.02em', color:'var(--ink)'}}>{f.q}</div>
                <p style={{fontSize:14.5, color:'var(--fg-muted)', marginTop:10, lineHeight:1.55, maxWidth:'58ch'}}>{f.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

Object.assign(window, { PriceHero, PriceTiers, PriceCalculator, PriceCompare, PriceFAQ });
