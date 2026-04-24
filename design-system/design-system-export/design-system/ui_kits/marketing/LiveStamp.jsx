// LiveStamp v3 — a simple, relatable moment.
//
// Three real products cycle through the stamp. No scrolling required.
// Each one shows:
//   - what it is (plain language)
//   - a handful of fields a human actually cares about
//   - a green-tick "verified" state when stamped
//
//  ┌──────────────────────────────┐
//  │  ●  NOW SIGNING              │
//  │                              │
//  │  Merino crew neck sweater    │
//  │  Northfield Textiles         │
//  │                              │
//  │  Materials   78% merino…     │
//  │  Origin      Australia → PT  │
//  │  Recycled    18% rPET        │
//  │                              │
//  │  ┌────────┐                  │
//  │  │ STAMP  │   ✓ SIGNED       │
//  │  └────────┘   TX-0448-B      │
//  └──────────────────────────────┘

const LiveStamp = ({ height = 520 }) => {
  const [idx, setIdx] = React.useState(0);
  const [phase, setPhase] = React.useState('reading'); // reading → stamping → signed

  const products = [
    {
      name: 'Merino crew neck sweater',
      brand: 'Northfield Textiles',
      sku: 'TX-0448-B',
      fields: [
        ['Materials',   '78% merino · 18% rPET · 4% elastane'],
        ['Origin',      'Australia → Portugal'],
        ['Recyclable',  'Grade B · instructions included'],
      ],
    },
    {
      name: 'Laptop replacement battery',
      brand: 'Lumen Batt GmbH',
      sku: 'BT-2200-R',
      fields: [
        ['Chemistry',   'Li-NMC · 55 Wh'],
        ['Cobalt',      'Traced to DRC-free mines'],
        ['Repairable',  'Yes · replacement guide + part #'],
      ],
    },
    {
      name: 'Oak dining chair',
      brand: 'Baumann Möbel',
      sku: 'FN-0010-X',
      fields: [
        ['Wood',        'European oak · FSC certified'],
        ['Finish',      'Water-based, VOC-free'],
        ['Spare parts', 'Available for 10 years'],
      ],
    },
  ];

  React.useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setPhase('signed'); return; }
    let t1, t2, t3;
    const run = () => {
      setPhase('reading');
      t1 = setTimeout(() => setPhase('stamping'), 2200);
      t2 = setTimeout(() => setPhase('signed'),   2700);
      t3 = setTimeout(() => {
        setIdx(i => (i + 1) % products.length);
        run();
      }, 4800);
    };
    run();
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const p = products[idx];

  return (
    <div style={{
      position:'relative', background:'var(--ink)', color:'var(--paper)',
      height, padding:'28px 32px', display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      {/* top status row */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:18, borderBottom:'1px solid var(--paper-12)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{
            width:7, height:7, borderRadius:'50%',
            background: phase === 'signed' ? 'var(--yellow)' : 'var(--paper-56)',
            animation: phase === 'signed' ? 'lstPulse 1.4s ease-in-out infinite' : 'none',
          }}/>
          <Mono style={{fontSize:11, color:'var(--paper-72)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
            {phase === 'reading'  ? 'Reading supplier data' :
             phase === 'stamping' ? 'Stamping…' : 'Passport signed · live'}
          </Mono>
        </div>
        <Mono style={{fontSize:11, color:'var(--paper-40)'}}>{idx+1} / {products.length}</Mono>
      </div>

      {/* product name */}
      <div key={idx} style={{marginTop:28, animation:'lstFade 0.6s ease-out'}}>
        <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{p.brand}</Mono>
        <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, letterSpacing:'-0.025em', color:'var(--paper)', marginTop:6, lineHeight:1.15, maxWidth:'18ch'}}>
          {p.name}
        </div>
      </div>

      {/* fields */}
      <div style={{marginTop:28, display:'flex', flexDirection:'column', gap:14, flex:1}}>
        {p.fields.map(([k, v], i) => (
          <div key={`${idx}-${k}`} style={{
            display:'grid', gridTemplateColumns:'100px 1fr 18px', gap:14, alignItems:'center',
            animation: `lstSlideIn 0.5s ${0.1 + i*0.12}s ease-out both`,
          }}>
            <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{k}</Mono>
            <div style={{fontSize:13, color:'var(--paper)', lineHeight:1.45}}>{v}</div>
            <span style={{
              width:16, height:16, display:'inline-flex', alignItems:'center', justifyContent:'center',
              background: phase === 'signed' ? 'var(--yellow)' : 'transparent',
              border: phase === 'signed' ? 'none' : '1px solid var(--paper-12)',
              transition: 'background 240ms ease-out',
            }}>
              {phase === 'signed' && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1.5 5 L4 7.5 L8.5 2" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* stamp row */}
      <div style={{marginTop:24, paddingTop:20, borderTop:'1px solid var(--paper-12)', display:'flex', alignItems:'center', gap:18}}>
        <div style={{
          width:56, height:56, position:'relative', flexShrink:0,
          transform: phase === 'stamping' ? 'scale(1.18)' : 'scale(1)',
          transition: 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1.2)',
        }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <rect width="64" height="64" fill="#000" stroke="rgba(255,255,255,0.2)"/>
            <rect x="12" y="12" width="40" height="40" fill="#FFDF00"/>
            <rect x="22" y="22" width="20" height="20" fill="#000"/>
            <rect x="28" y="28" width="8" height="8" fill="#FFDF00"/>
          </svg>
          {/* ring flash on stamp */}
          {phase === 'stamping' && (
            <span style={{
              position:'absolute', inset:-12, border:'1.5px solid var(--yellow)',
              animation:'lstRing 500ms ease-out forwards',
            }}/>
          )}
        </div>
        <div style={{flex:1}}>
          <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
            {phase === 'signed' ? 'eIDAS-qualified signature' : 'Awaiting signature'}
          </Mono>
          <Mono style={{
            fontSize:13, color: phase === 'signed' ? 'var(--yellow)' : 'var(--paper-56)',
            marginTop:4, display:'block',
            transition:'color 240ms ease-out',
          }}>
            {phase === 'signed' ? `✓ ${p.sku} · Buypass AS` : 'Buypass AS (QTSP)'}
          </Mono>
        </div>
      </div>

      <style>{`
        @keyframes lstPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
        @keyframes lstFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lstSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes lstRing {
          from { opacity: 0.9; transform: scale(0.85); }
          to   { opacity: 0;   transform: scale(1.4);  }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes lstPulse { 0%, 100% { opacity: 1; } }
          @keyframes lstFade  { from, to { opacity: 1; transform: none; } }
          @keyframes lstSlideIn { from, to { opacity: 1; transform: none; } }
          @keyframes lstRing { from, to { opacity: 0; } }
        }
      `}</style>
    </div>
  );
};

Object.assign(window, { LiveStamp });
