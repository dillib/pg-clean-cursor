// Marketing Nav — editorial cream-paper style, yellow accent, sticky.
const MarketingNav = ({ active = 'Platform' }) => {
  const items = ['Platform','Regulations','Developers','Pricing','Security'];
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, {passive:true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header style={{
      ...(scrolled ? glass({tone:'cream', radius:0, strength:'strong'}) : {background:'var(--paper)', border:'1px solid transparent'}),
      borderLeft:'none', borderRight:'none', borderTop:'none',
      borderBottomColor: scrolled ? 'var(--hairline)' : 'transparent',
      color:'var(--ink)',
      position:'sticky', top:0, zIndex:50,
      transition:'background 200ms var(--ease), border-color 200ms var(--ease), box-shadow 200ms var(--ease)',
    }}>
      <div style={{maxWidth:1280, margin:'0 auto', padding:'0 32px', height:72, display:'flex', alignItems:'center', gap:32}}>
        <Wordmark size={19}/>
        <nav style={{display:'flex', gap:2, marginLeft:24}}>
          {items.map(i => (
            <a key={i} href="#" style={{
              padding:'8px 14px',
              fontFamily:'var(--font-sans)', fontSize:14, fontWeight:500, letterSpacing:'-0.005em',
              color: i===active ? 'var(--ink)' : 'var(--ink-56)',
              background: i===active ? 'var(--paper-cream)' : 'transparent',
              borderRadius:999, textDecoration:'none',
              transition:'all var(--dur-1) var(--ease)',
            }}>{i}</a>
          ))}
        </nav>
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:14}}>
          <a href="#" style={{
            fontFamily:'var(--font-sans)', fontSize:14, fontWeight:500, color:'var(--ink-72)', textDecoration:'none',
          }}>Sign in</a>
          <button style={{
            height:40, padding:'0 16px', display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--ink)', color:'var(--paper-pure)', border:'none', borderRadius:10,
            fontFamily:'var(--font-sans)', fontSize:13.5, fontWeight:500, letterSpacing:'-0.005em',
            cursor:'pointer',
          }}>
            Start free audit <Icon name="arrowR" size={13} stroke="currentColor" strokeWidth={2}/>
          </button>
        </div>
      </div>
    </header>
  );
};

Object.assign(window, { MarketingNav });
