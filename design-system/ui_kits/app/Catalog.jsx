// Catalog — dense table, mono identifiers, hairline columns.
const Catalog = () => {
  const rows = [
    ['TX-0448-B','Merino Crew Ink','4006381333931','v1.4.2','Live','2h', 'Signe K.'],
    ['TX-0449-B','Merino Crew Bone','4006381333948','v1.4.2','Live','2h', 'Signe K.'],
    ['TX-0501-A','Lambswool Turtleneck','4006381334020','v1.2.0','Live','yesterday', 'Marta O.'],
    ['TX-1102-A','Base Tee Ink','4006381334051','v0.9.0','Draft','yesterday', 'Marta O.'],
    ['TX-1103-A','Base Tee Bone','4006381334068','v0.9.0','Draft','yesterday', 'Marta O.'],
    ['BT-2200-R','PowerCell 48V','7612341208883','v2.1.0','Filing','4d', 'Hugo L.'],
    ['BT-2201-R','PowerCell 24V','7612341208890','v2.1.0','Filing','4d', 'Hugo L.'],
    ['FN-0010-X','Oak Desk, Walnut','8412098220114','v1.0.0','Planned','2w', 'Hugo L.'],
    ['FN-0012-X','Oak Desk, Natural','8412098220121','v1.0.0','Planned','2w', 'Hugo L.'],
    ['EL-4400','Earbuds Pro','7612341210008','—','Import','3w', 'System'],
    ['EL-4401','Earbuds Mini','7612341210015','—','Import','3w', 'System'],
    ['TX-0620-B','Boxer Brief Ink','4006381335010','v1.1.0','Live','5w', 'Signe K.'],
  ];
  const stateBadge = (s) => {
    if (s==='Live')   return <Badge tone="accent">Live</Badge>;
    if (s==='Filing') return <Badge tone="solid">Filing</Badge>;
    if (s==='Draft')  return <Badge tone="default">Draft</Badge>;
    if (s==='Planned')return <Badge tone="default" style={{borderStyle:'dashed'}}>Planned</Badge>;
    return <Badge tone="default">Import</Badge>;
  };
  return (
    <main style={{flex:1, minWidth:0, background:'var(--paper)', display:'flex', flexDirection:'column'}}>
      {/* Page head */}
      <div style={{padding:'24px 24px 18px', borderBottom:'1px solid var(--hairline)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24}}>
          <div>
            <Eyebrow>Passports</Eyebrow>
            <h1 style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, letterSpacing:'-0.025em', margin:'6px 0 0'}}>Catalog <span style={{color:'var(--fg-subtle)', fontWeight:500}}>14,204</span></h1>
          </div>
          <div style={{display:'flex', gap:8}}>
            <Button variant="secondary" size="sm" icon="ext">Export</Button>
            <Button variant="secondary" size="sm" icon="arrowUR">Import CSV</Button>
            <Button variant="primary" size="sm">New passport</Button>
          </div>
        </div>
        {/* Stats */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:0, marginTop:20, border:'1px solid var(--hairline)'}}>
          {[
            ['Live','12,188','+91 today'],
            ['Filing','142','2 awaiting eIDAS'],
            ['Draft','604','47 overdue'],
            ['Planned','1,156','—'],
            ['Errors','114','GTIN checksum · 92'],
          ].map(([l,v,t], i) => (
            <div key={l} style={{padding:'14px 18px', borderRight: i<4 ? '1px solid var(--hairline)' : 'none'}}>
              <Mono style={{fontSize:10, color:'var(--fg-subtle)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{l}</Mono>
              <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', marginTop:4, fontVariantNumeric:'tabular-nums'}}>{v}</div>
              <Mono style={{fontSize:11, color:'var(--fg-muted)', marginTop:2, display:'block'}}>{t}</Mono>
            </div>
          ))}
        </div>
      </div>
      {/* Filter bar */}
      <div style={{padding:'10px 24px', display:'flex', gap:8, alignItems:'center', borderBottom:'1px solid var(--hairline)'}}>
        <div style={{display:'flex', gap:0, border:'1px solid var(--hairline)'}}>
          {['All','Live','Filing','Draft','Planned'].map((t,i) => (
            <button key={t} style={{padding:'6px 12px', fontFamily:'var(--font-sans)', fontSize:13, border:'none', borderRight: i<4?'1px solid var(--hairline)':'none', background: i===0 ? 'var(--ink)' : 'var(--paper)', color: i===0 ? 'var(--paper)' : 'var(--fg-muted)', cursor:'pointer'}}>{t}</button>
          ))}
        </div>
        <Button variant="secondary" size="sm" icon="plus">Regulation</Button>
        <Button variant="secondary" size="sm" icon="plus">Supplier</Button>
        <Button variant="secondary" size="sm" icon="plus">Date range</Button>
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:8}}>
          <Mono style={{fontSize:11, color:'var(--fg-subtle)'}}>Sorted by updated · desc</Mono>
        </div>
      </div>
      {/* Table */}
      <div style={{flex:1, overflowX:'auto', overflowY:'auto'}}>
        <table style={{width:'100%', minWidth:860, borderCollapse:'collapse', fontFamily:'var(--font-sans)', tableLayout:'auto'}}>
          <thead>
            <tr>
              {['SKU','Product','GTIN','Version','State','Updated','Owner'].map((h, i) => (
                <th key={h} style={{textAlign:'left', padding:'10px 16px', fontFamily:'var(--font-mono)', fontSize:10.5, fontWeight:500, color:'var(--fg-subtle)', letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid var(--hairline)', background:'var(--paper)', position:'sticky', top:0, whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{borderBottom:'1px solid var(--hairline)'}}>
                <td style={{padding:'12px 16px'}}><Mono style={{fontSize:12.5, color:'var(--fg)'}}>{r[0]}</Mono></td>
                <td style={{padding:'12px 16px', fontSize:14, color:'var(--fg)'}}>{r[1]}</td>
                <td style={{padding:'12px 16px'}}><Mono style={{fontSize:12.5, color:'var(--fg-muted)'}}>{r[2]}</Mono></td>
                <td style={{padding:'12px 16px'}}><Mono style={{fontSize:12.5, color:'var(--fg-muted)'}}>{r[3]}</Mono></td>
                <td style={{padding:'12px 16px'}}>{stateBadge(r[4])}</td>
                <td style={{padding:'12px 16px'}}><Mono style={{fontSize:12.5, color:'var(--fg-muted)'}}>{r[5]}</Mono></td>
                <td style={{padding:'12px 16px', fontSize:13, color:'var(--fg-muted)'}}>{r[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

Object.assign(window, { Catalog });
