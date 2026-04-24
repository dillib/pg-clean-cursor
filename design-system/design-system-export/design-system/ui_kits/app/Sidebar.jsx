// App sidebar — black, yellow active indicator, dense.
const Sidebar = ({ active = 'Passports' }) => {
  const items = [
    ['Overview','grid'], ['Passports','doc'], ['Suppliers','shield'],
    ['Regulations','bolt'], ['Audit log','terminal'], ['Filings','doc'],
  ];
  const secondary = [['API keys','lock'],['Webhooks','ext'],['Settings','menu']];
  return (
    <aside style={{width:208, background:'var(--ink)', color:'var(--paper)', borderRight:'1px solid var(--paper-12)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, alignSelf:'flex-start', height:'100vh'}}>
      <div style={{padding:'18px 18px', borderBottom:'1px solid var(--paper-12)', display:'flex', alignItems:'center', gap:10}}>
        <BrandMark size={22}/>
        <div>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, letterSpacing:'-0.035em'}}>photonictag</div>
          <Mono style={{fontSize:10.5, color:'var(--paper-56)'}}>Northfield Textiles</Mono>
        </div>
      </div>
      <nav style={{padding:'12px 10px', display:'flex', flexDirection:'column', gap:1, flex:1}}>
        {items.map(([n, ic]) => (
          <a key={n} href="#" style={{display:'flex', alignItems:'center', gap:10, padding:'7px 10px', fontSize:13.5, color: n===active ? 'var(--ink)' : 'var(--paper-72)', background: n===active ? 'var(--yellow)' : 'transparent', textDecoration:'none', borderRadius:2}}>
            <Icon name={ic} size={14}/><span>{n}</span>
            {n==='Passports' && <Mono style={{marginLeft:'auto', fontSize:10.5, color: n===active ? 'var(--ink-72)' : 'var(--paper-40)'}}>14,204</Mono>}
          </a>
        ))}
        <div style={{marginTop:22, marginBottom:8, padding:'0 10px'}}>
          <Mono style={{fontSize:10, color:'var(--paper-40)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Developer</Mono>
        </div>
        {secondary.map(([n, ic]) => (
          <a key={n} href="#" style={{display:'flex', alignItems:'center', gap:10, padding:'7px 10px', fontSize:13.5, color:'var(--paper-72)', textDecoration:'none', borderRadius:2}}>
            <Icon name={ic} size={14}/><span>{n}</span>
          </a>
        ))}
      </nav>
      <div style={{padding:'14px 16px', borderTop:'1px solid var(--paper-12)', display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:28, height:28, background:'var(--yellow)', color:'var(--ink)', fontFamily:'var(--font-display)', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center'}}>SK</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:500, color:'var(--paper)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Signe Karlsson</div>
          <Mono style={{fontSize:10.5, color:'var(--paper-56)'}}>Admin</Mono>
        </div>
        <Icon name="chev" size={14} stroke="var(--paper-56)"/>
      </div>
    </aside>
  );
};

const AppHeader = ({ title, crumbs = [] }) => (
  <header style={{borderBottom:'1px solid var(--hairline)', background:'var(--paper)', padding:'0 24px', height:56, display:'flex', alignItems:'center', gap:16, flexShrink:0}}>
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <Mono style={{fontSize:12, color:'var(--fg-muted)'}}>{c}</Mono>
          {i < crumbs.length-1 && <Mono style={{fontSize:12, color:'var(--fg-subtle)'}}>/</Mono>}
        </React.Fragment>
      ))}
    </div>
    <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:8}}>
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'6px 10px', border:'1px solid var(--hairline)', borderRadius:2, color:'var(--fg-muted)', fontSize:13, minWidth:240}}>
        <Icon name="search" size={14}/>
        <span>Search SKUs, suppliers, regulations</span>
        <Kbd>⌘K</Kbd>
      </div>
      <Button variant="secondary" size="sm" icon="bell">3</Button>
      <Button variant="primary" size="sm">New passport</Button>
    </div>
  </header>
);

Object.assign(window, { Sidebar, AppHeader });
