// Developers page — API-first landing. Code-forward, editorial, same visual language.

// ─────────────────────────────────────────────────────────────
// Hero — big headline + terminal-style code card
// ─────────────────────────────────────────────────────────────
const DevHero = () => (
  <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'80px 32px 88px', position:'relative', overflow:'hidden'}}>
    <div style={{maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center'}}>
      <div>
        <Reveal>
          <div style={{display:'inline-flex', alignItems:'center', gap:10, padding:'6px 14px 6px 8px', background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:999, marginBottom:32}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:6, background:'var(--yellow)', color:'var(--ink)', padding:'3px 10px', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:500}}>
              <span style={{width:5, height:5, borderRadius:'50%', background:'var(--ink)'}}/>v2.4
            </span>
            <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>api.photonictag.eu · OpenAPI 3.1</Mono>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 style={{fontFamily:'var(--font-display)', fontSize:88, fontWeight:600, letterSpacing:'-0.045em', lineHeight:0.96, margin:0, maxWidth:'14ch'}}>
            Ship passports from <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>your stack</em>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p style={{fontSize:19, color:'var(--fg-muted)', marginTop:24, lineHeight:1.55, maxWidth:'48ch'}}>
            REST + webhooks. Typed SDKs for TypeScript, Python, Go. Every field validated against CIRPASS v2 before it leaves your server.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div style={{marginTop:36, display:'flex', gap:12, flexWrap:'wrap'}}>
            <button style={{
              height:48, padding:'0 22px', display:'inline-flex', alignItems:'center', gap:8,
              background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:12,
              fontFamily:'var(--font-sans)', fontSize:14.5, fontWeight:500, cursor:'pointer',
            }}>
              <Icon name="terminal" size={14} stroke="currentColor" strokeWidth={2}/> Get an API key
            </button>
            <button style={{
              height:48, padding:'0 22px', display:'inline-flex', alignItems:'center', gap:8,
              background:'var(--paper-pure)', color:'var(--ink)', border:'1px solid var(--hairline)', borderRadius:12,
              fontFamily:'var(--font-sans)', fontSize:14.5, fontWeight:500, cursor:'pointer',
            }}>
              <Icon name="doc" size={14} stroke="currentColor" strokeWidth={2}/> Read the docs
            </button>
          </div>
        </Reveal>
      </div>

      {/* Terminal card */}
      <Reveal delay={120} y={20}>
        <DevTerminal/>
      </Reveal>
    </div>
  </section>
);

// Terminal-like code card — cycles through 3 snippets.
const DevTerminal = () => {
  const samples = [
    {
      lang:'ts',
      title:'issue a passport',
      code:
`import { PhotonicTag } from '@photonictag/sdk';

const pt = new PhotonicTag({ apiKey: process.env.PT_KEY });

const passport = await pt.passports.create({
  productId: 'urn:gtin:4006381333931',
  regulation: 'ESPR/2024/1781#textiles',
  materials: [
    { fibre: 'Merino wool', pct: 78 },
    { fibre: 'rPET',        pct: 18, recycled: true },
    { fibre: 'Elastane',    pct:  4 },
  ],
});

// → { id: 'pt_TX0448B', version: 'v1.0.0', status: 'draft' }`,
    },
    {
      lang:'py',
      title:'publish + sign',
      code:
`from photonictag import PhotonicTag

pt = PhotonicTag(api_key=os.environ["PT_KEY"])

draft = pt.passports.get("pt_TX0448B")
published = pt.passports.publish(
    draft.id,
    qtsp="buypass",          # eIDAS-qualified signature
    timestamp_policy="1.3.6.1.4.1.22234.1.3",
)

# → status=published · hash=0x8b1a9f…4f3c
# → viewer=https://photonictag.eu/p/TX0448B`,
    },
    {
      lang:'sh',
      title:'CLI',
      code:
`$ pt passports create \\
    --file ./passports/TX-0448-B.yaml \\
    --regulation espr-textiles

→ pt_TX0448B   draft    (8 fields missing)
$ pt lint pt_TX0448B
→ materials.trims   required          ×
→ supplyChain.tier2 required          ×
$ pt publish pt_TX0448B --qtsp buypass
✓ validates · signs · timestamps
✓ live at photonictag.eu/p/TX0448B`,
    },
  ];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI(x => (x + 1) % samples.length), 5200);
    return () => clearInterval(id);
  }, []);
  const s = samples[i];
  return (
    <div style={{background:'var(--ink)', color:'var(--paper-pure)', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.14)'}}>
      {/* Tab strip */}
      <div style={{display:'flex', alignItems:'center', gap:0, padding:'14px 18px 0', borderBottom:'1px solid var(--paper-08)'}}>
        {samples.map((x, xi) => (
          <button key={x.lang} onClick={() => setI(xi)} style={{
            padding:'10px 14px',
            background: xi === i ? 'var(--paper-08)' : 'transparent',
            color: xi === i ? 'var(--paper-pure)' : 'var(--paper-56)',
            border:'none', borderRadius:'10px 10px 0 0',
            fontFamily:'var(--font-mono)', fontSize:11.5, letterSpacing:'0.04em', textTransform:'uppercase',
            cursor:'pointer',
          }}>
            {x.lang} · {x.title}
          </button>
        ))}
        <span style={{marginLeft:'auto', padding:'0 6px'}}>
          <Mono style={{fontSize:10, color:'var(--paper-40)'}}>⌘K</Mono>
        </span>
      </div>
      {/* Code body */}
      <pre style={{margin:0, padding:'22px 24px 26px', fontFamily:'var(--font-mono)', fontSize:13, lineHeight:1.7, color:'var(--paper-72)', whiteSpace:'pre', overflowX:'auto', minHeight:340}}>
        {s.code}
      </pre>
      {/* Status bar */}
      <div style={{display:'flex', alignItems:'center', gap:14, padding:'10px 18px', borderTop:'1px solid var(--paper-08)', background:'var(--paper-04)'}}>
        <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
          <span style={{width:6, height:6, borderRadius:'50%', background:'var(--yellow)'}}/>
          <Mono style={{fontSize:10, color:'var(--paper-72)', letterSpacing:'0.06em', textTransform:'uppercase'}}>ready</Mono>
        </span>
        <Mono style={{fontSize:10, color:'var(--paper-40)'}}>EU-WEST · 127 ms</Mono>
        <Mono style={{marginLeft:'auto', fontSize:10, color:'var(--paper-40)'}}>tab {i + 1}/{samples.length}</Mono>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SDK grid — 6 languages/tools
// ─────────────────────────────────────────────────────────────
const DevSDKGrid = () => {
  const sdks = [
    {tag:'TypeScript',  install:'npm i @photonictag/sdk',         desc:'First-party typed client. ESM + CJS.',   status:'v2.4.0', ready:true},
    {tag:'Python',      install:'pip install photonictag',        desc:'Sync + async. Type stubs. 3.10+.',       status:'v2.4.0', ready:true},
    {tag:'Go',          install:'go get github.com/pt/sdk/go',    desc:'Context-aware. Streaming validator.',    status:'v1.8.2', ready:true},
    {tag:'CLI',         install:'brew install photonictag',       desc:'Bulk import, lint, publish.',            status:'v0.14',  ready:true},
    {tag:'Terraform',   install:'registry.terraform.io/pt/pt',    desc:'Manage passports as infrastructure.',    status:'beta',   ready:false},
    {tag:'GraphQL',     install:'api.photonictag.eu/graphql',     desc:'Federation-ready. Subscriptions on webhooks.', status:'beta',   ready:false},
  ];
  return (
    <section style={{background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <Eyebrow>SDKs + tooling</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:56, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'22ch'}}>
            Your stack, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>first-class</em>.
          </h2>
        </Reveal>
        <div style={{marginTop:48, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
          {sdks.map((s, i) => (
            <Reveal key={s.tag} delay={(i % 3) * 60}>
              <div style={{background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:20, padding:'24px 24px 22px', height:'100%', display:'flex', flexDirection:'column'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>{s.tag}</div>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'3px 9px', borderRadius:999,
                    background: s.ready ? 'var(--yellow)' : 'var(--paper-cream)',
                    border:'1px solid', borderColor: s.ready ? 'var(--ink)' : 'var(--hairline)',
                    color:'var(--ink)', letterSpacing:'0.04em',
                  }}>{s.status}</span>
                </div>
                <div style={{marginTop:18, padding:'12px 14px', background:'var(--ink)', color:'var(--paper-pure)', borderRadius:10, fontFamily:'var(--font-mono)', fontSize:12.5, letterSpacing:'-0.005em'}}>
                  <span style={{color:'var(--yellow)'}}>$</span> {s.install}
                </div>
                <p style={{fontSize:13.5, color:'var(--fg-muted)', marginTop:14, lineHeight:1.5, flex:1}}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// API reference strip — 4 example endpoints
// ─────────────────────────────────────────────────────────────
const DevApiRef = () => {
  const eps = [
    {m:'POST',   p:'/v2/passports',                 d:'Create a draft passport',          rate:'1k/min'},
    {m:'POST',   p:'/v2/passports/:id/publish',     d:'Sign + publish · eIDAS QTSP',      rate:'100/min'},
    {m:'GET',    p:'/v2/passports/:id',             d:'Fetch one, any version',           rate:'10k/min'},
    {m:'GET',    p:'/v2/schema/:regulation',        d:'JSON-Schema for a regulation',     rate:'—'},
    {m:'POST',   p:'/v2/webhooks',                  d:'Subscribe to passport events',     rate:'—'},
    {m:'GET',    p:'/v2/audit/:passport_id',        d:'Full hash-chained audit trail',    rate:'1k/min'},
  ];
  const methodColor = {POST:'var(--yellow)', GET:'var(--paper-cream)', DELETE:'var(--ink)'};
  return (
    <section style={{background:'var(--paper)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:40, flexWrap:'wrap', marginBottom:40}}>
            <div>
              <Eyebrow>API reference</Eyebrow>
              <h2 style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'22ch'}}>
                REST, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>properly</em>.
              </h2>
            </div>
            <Mono style={{fontSize:12, color:'var(--fg-muted)', maxWidth:'32ch', textAlign:'right', lineHeight:1.5}}>
              Every endpoint. Cursor pagination, idempotency keys, retries on 5xx. Full OpenAPI at /openapi.json.
            </Mono>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div style={{background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:20, overflow:'hidden'}}>
            {/* Header row */}
            <div style={{display:'grid', gridTemplateColumns:'90px 1.4fr 1.8fr 0.7fr', padding:'12px 24px', background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)'}}>
              {['Method','Path','Description','Rate limit'].map(h => (
                <Mono key={h} style={{fontSize:10.5, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{h}</Mono>
              ))}
            </div>
            {eps.map((e, i) => (
              <div key={e.p} style={{display:'grid', gridTemplateColumns:'90px 1.4fr 1.8fr 0.7fr', padding:'16px 24px', borderTop: i === 0 ? 'none' : '1px solid var(--hairline-soft)', alignItems:'center'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--font-mono)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:6, letterSpacing:'0.04em',
                  background: methodColor[e.m], color: e.m === 'DELETE' ? 'var(--paper-pure)' : 'var(--ink)',
                  border: '1px solid var(--ink-12)', justifySelf:'start',
                }}>{e.m}</span>
                <Mono style={{fontSize:13, color:'var(--ink)'}}>{e.p}</Mono>
                <div style={{fontSize:13.5, color:'var(--ink-72)', letterSpacing:'-0.005em'}}>{e.d}</div>
                <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>{e.rate}</Mono>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Webhook events card
// ─────────────────────────────────────────────────────────────
const DevWebhooks = () => {
  const events = [
    {n:'passport.published', d:'Fired when a passport leaves draft.',             retry:'exp'},
    {n:'passport.edited',    d:'Any field change, scoped by field path.',         retry:'exp'},
    {n:'regulation.changed', d:'We migrated your drafts. Here\'s the diff.',      retry:'forever'},
    {n:'supplier.filled',    d:'A Tier-N supplier completed their assigned row.', retry:'exp'},
    {n:'cert.expiring',      d:'A linked cert (FSC, OEKO-TEX, etc.) hits 90d.',    retry:'exp'},
    {n:'signature.invalid',  d:'Downstream verifier rejected your QTSP bundle.',  retry:'none'},
  ];
  return (
    <section style={{background:'var(--paper-cream)', borderBottom:'1px solid var(--hairline)', padding:'112px 32px'}}>
      <div style={{maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:64, alignItems:'flex-start'}}>
        <div style={{position:'sticky', top:96}}>
          <Reveal>
            <Eyebrow>Webhooks</Eyebrow>
            <h2 style={{fontFamily:'var(--font-display)', fontSize:52, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'16ch'}}>
              Every meaningful event, <em style={{fontStyle:'italic', color:'var(--ink-56)'}}>delivered</em>.
            </h2>
            <p style={{fontSize:16, color:'var(--fg-muted)', marginTop:20, lineHeight:1.55, maxWidth:'40ch'}}>
              HMAC-signed payloads, retries on 5xx, dead-letter queue you can replay from the dashboard. Event replay is first-class, not an afterthought.
            </p>
            {/* Example curl */}
            <div style={{marginTop:28, background:'var(--ink)', color:'var(--paper-pure)', borderRadius:14, padding:'18px 20px', fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.75}}>
              <span style={{color:'var(--paper-40)'}}># replay last 24h of events</span>
              <br/>
              <span style={{color:'var(--yellow)'}}>$</span> pt webhooks replay <span style={{color:'var(--paper-72)'}}>--since 24h</span>
              <br/>
              <span style={{color:'var(--paper-40)'}}>→ 4,218 events queued</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div style={{display:'flex', flexDirection:'column', gap:0, background:'var(--paper-pure)', border:'1px solid var(--hairline)', borderRadius:20, overflow:'hidden'}}>
            {events.map((e, i) => (
              <div key={e.n} style={{padding:'20px 24px', borderTop: i === 0 ? 'none' : '1px solid var(--hairline-soft)', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center'}}>
                <div>
                  <Mono style={{fontSize:13.5, color:'var(--ink)', fontWeight:500}}>{e.n}</Mono>
                  <p style={{fontSize:13, color:'var(--fg-muted)', marginTop:6, lineHeight:1.5}}>{e.d}</p>
                </div>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:10.5, padding:'3px 9px', borderRadius:999,
                  background: e.retry === 'forever' ? 'var(--yellow)' : 'var(--paper-cream)',
                  border:'1px solid var(--hairline)', color:'var(--ink-72)', letterSpacing:'0.04em', textTransform:'uppercase',
                }}>retry · {e.retry}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Reliability strip — 4 stats
// ─────────────────────────────────────────────────────────────
const DevReliability = () => {
  const stats = [
    {big:'99.98%', sub:'API uptime · trailing 90d'},
    {big:'42ms',   sub:'p50 validation latency'},
    {big:'3',      sub:'EU regions · eu-west, eu-north, eu-central'},
    {big:'SOC 2',  sub:'Type II · ISO 27001 in flight'},
  ];
  return (
    <section style={{padding:'96px 32px', background:'var(--ink)', color:'var(--paper-pure)', borderBottom:'1px solid var(--hairline)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <Eyebrow color="var(--paper-56)">Reliability</Eyebrow>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'-0.035em', lineHeight:1, marginTop:14, maxWidth:'22ch', color:'var(--paper-pure)'}}>
            Built for <em style={{fontStyle:'italic', color:'var(--yellow)'}}>your filing deadline</em>.
          </h2>
        </Reveal>
        <div style={{marginTop:48, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0}}>
          {stats.map((s, i) => (
            <Reveal key={s.sub} delay={i*60}>
              <div style={{paddingLeft: i === 0 ? 0 : 32, paddingRight:32, borderLeft: i > 0 ? '1px solid var(--paper-12)' : 'none'}}>
                <div style={{fontFamily:'var(--font-display)', fontSize:64, fontWeight:600, letterSpacing:'-0.04em', lineHeight:1, color:'var(--paper-pure)', fontVariantNumeric:'tabular-nums'}}>{s.big}</div>
                <Mono style={{fontSize:12, color:'var(--paper-72)', marginTop:14, display:'block'}}>{s.sub}</Mono>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { DevHero, DevTerminal, DevSDKGrid, DevApiRef, DevWebhooks, DevReliability });
