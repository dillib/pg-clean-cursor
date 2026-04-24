// Marketing Nav — black-first, yellow accent, hairline bottom.
const MarketingNav = ({ active = 'Platform' }) => {
  const items = ['Platform','Regulations','Developers','Pricing','Security'];
  return (
    <header style={{background:'var(--ink)', color:'var(--paper)', borderBottom:'1px solid var(--paper-12)', position:'sticky', top:0, zIndex:50}}>
      <div style={{maxWidth:'var(--container-w)', margin:'0 auto', padding:'0 32px', height:64, display:'flex', alignItems:'center', gap:40}}>
        <Wordmark size={17}/>
        <nav style={{display:'flex', gap:4, marginLeft:24}}>
          {items.map(i => (
            <a key={i} href="#" style={{padding:'8px 12px', fontFamily:'var(--font-sans)', fontSize:14, fontWeight:500, letterSpacing:'-0.01em', color: i===active ? 'var(--paper)' : 'var(--paper-56)', textDecoration:'none'}}>{i}</a>
          ))}
        </nav>
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:10}}>
          <a href="#" style={{fontFamily:'var(--font-sans)', fontSize:14, fontWeight:500, color:'var(--paper-56)', textDecoration:'none'}}>Sign in</a>
          <Button variant="primary" size="sm">Start free audit</Button>
        </div>
      </div>
    </header>
  );
};

const MarketingFooter = () => (
  <footer style={{background:'var(--ink)', color:'var(--paper)', padding:'80px 32px 32px', borderTop:'1px solid var(--paper-12)'}}>
    <div style={{maxWidth:'var(--container-w)', margin:'0 auto'}}>
      <div style={{display:'grid', gridTemplateColumns:'1.4fr repeat(4, 1fr)', gap:48, paddingBottom:56}}>
        <div>
          <Wordmark size={17}/>
          <p style={{fontSize:13.5, color:'var(--paper-56)', marginTop:20, maxWidth:'36ch', lineHeight:1.55}}>Digital Product Passports for the EU. Audit-grade provenance, built for compliance teams.</p>
        </div>
        {[
          ['Product', ['Platform','Regulations','API','Public viewer','Changelog']],
          ['Company', ['About','Customers','Careers','Press','Contact']],
          ['Resources', ['ESPR briefing','Batteries brief','Supplier onboarding','Status']],
          ['Legal', ['Privacy','Terms','DPA','SOC 2','GDPR']],
        ].map(([t, links]) => (
          <div key={t}>
            <Mono style={{fontSize:11, color:'var(--paper-40)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{t}</Mono>
            <ul style={{listStyle:'none', padding:0, margin:'14px 0 0', display:'flex', flexDirection:'column', gap:10}}>
              {links.map(l => <li key={l}><a href="#" style={{fontSize:13.5, color:'var(--paper-72)', textDecoration:'none'}}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:24, borderTop:'1px solid var(--paper-12)'}}>
        <Mono style={{fontSize:11, color:'var(--paper-40)'}}>© 2026 photonictag GmbH · Berlin · Registered EU DPP registry operator</Mono>
        <Mono style={{fontSize:11, color:'var(--paper-40)'}}>All systems normal · 99.987% uptime · 30d</Mono>
      </div>
    </div>
  </footer>
);

Object.assign(window, { MarketingNav, MarketingFooter });
