import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import seed from './data/mockData.json'

const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const icon = (name) => {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/></>,
    file: <><path d="M6 2h9l3 3v17H6z"/><path d="M14 2v4h4M9 11h6M9 15h6"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    wrench: <><path d="M14.7 6.3a4.2 4.2 0 0 0-5.7 5.7L3 18l3 3 6-6a4.2 4.2 0 0 0 5.7-5.7l-2.3 2.3-2-2 2.3-2.3z"/></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>
  }
  return React.createElement('svg', common, paths[name] || paths.home)
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [properties, setProperties] = useState(seed.properties)
  const [payments, setPayments] = useState(seed.payments)
  const [leases, setLeases] = useState(seed.leases)
  const [maintenance, setMaintenance] = useState(seed.maintenance)
  const [propertyFilter, setPropertyFilter] = useState('All')
  const [maintenanceFilter, setMaintenanceFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const navigate = (p) => setPage(p)
  const addProperty = (payload) => {
    setProperties(prev => [...prev, { ...payload, id: Math.floor(1000 + Math.random()*8999) }])
    notify('Property created')
  }
  const updateProperty = (payload) => {
    setProperties(prev => prev.map(p => p.id === payload.id ? payload : p))
    notify('Property updated')
  }
  const deleteProperty = (id) => {
    setProperties(prev => prev.filter(p => p.id !== id))
    notify('Property deleted')
  }
  const addPayment = (payload) => {
    setPayments(prev => [{ ...payload, id: 'pay_' + Math.random().toString(36).slice(2,8) }, ...prev])
    notify('Payment recorded')
  }
  const addLease = (payload) => {
    setLeases(prev => [{ ...payload, id: 'LSE-' + Math.floor(2000 + Math.random()*8999) }, ...prev])
    notify('Lease created')
  }
  const renewLease = (id) => {
    setLeases(prev => prev.map(l => l.id === id ? { ...l, status: 'Active' } : l))
    notify('Lease renewed')
  }
  const addMaintenance = (payload) => {
    setMaintenance(prev => [...prev, { ...payload, id: 'MTN-' + Math.floor(300 + Math.random()*699), age: 'just now' }])
    notify('Maintenance request created')
  }
  const advanceMaintenance = (id) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'Open' ? 'Assigned' : 'Resolved' } : m))
    notify('Maintenance status updated')
  }

  const nav = [
    ['dashboard', 'Dashboard', 'home'],
    ['properties', 'Properties', 'building'],
    ['leases', 'Leases', 'file'],
    ['payments', 'Payments', 'card'],
    ['maintenance', 'Maintenance', 'wrench'],
  ]

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand">
        <div className="logo">K</div>
        <div><div className="brand-name">Keystone</div><div className="brand-sub">PROPERTY OS</div></div>
      </div>
      <nav className="nav">
        {nav.map(([key,label,ico]) => <button key={key} className={page === key ? 'active' : ''} onClick={() => navigate(key)}>{icon(ico)}<span>{label}</span></button>)}
      </nav>
      <div className="top-actions">
        <div className="api-pill">API v1 · Live</div>
        <button className="ai-button" onClick={() => setModal({type:'ai'})}>AI</button>
      </div>
    </header>

    {page === 'dashboard' && <Dashboard onNavigate={navigate} maintenance={maintenance} analytics={seed.analytics} />}
    {page === 'properties' && <Properties items={properties} filter={propertyFilter} setFilter={setPropertyFilter} search={search} setSearch={setSearch} onAdd={() => setModal({type:'property', mode:'add'})} onView={p => setModal({type:'propertyView', item:p})} onEdit={p => setModal({type:'property', mode:'edit', item:p})} onDelete={deleteProperty} />}
    {page === 'leases' && <Leases items={leases} onAdd={() => setModal({type:'lease'})} onView={l => setModal({type:'leaseView', item:l})} onRenew={renewLease} />}
    {page === 'payments' && <Payments items={payments} onAdd={() => setModal({type:'payment'})} onView={p => setModal({type:'paymentView', item:p})} />}
    {page === 'maintenance' && <Maintenance items={maintenance} filter={maintenanceFilter} setFilter={setMaintenanceFilter} onAdd={() => setModal({type:'maintenance'})} onView={m => setModal({type:'maintenanceView', item:m})} onAdvance={advanceMaintenance} />}

    {modal && <Modal modal={modal} close={() => setModal(null)} addProperty={addProperty} updateProperty={updateProperty} addPayment={addPayment} addLease={addLease} addMaintenance={addMaintenance} onRenew={renewLease} onAdvance={advanceMaintenance} />}
    <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
  </div>
}

function PageHeader({title, subtitle, action}) {
  return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>
}

function Stat({label, value, foot, delta}) {
  return <div className="card stat"><div className="stat-top"><span>{label}</span>{delta && <b>{delta}</b>}</div><strong>{value}</strong><small>{foot}</small></div>
}

function Dashboard({onNavigate, maintenance, analytics}) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul']
  return <main>
    <PageHeader title="Dashboard" subtitle="Portfolio performance across 6 properties in 6 cities · FY 2026" />
    <div className="stat-grid">
      <Stat label="OCCUPANCY" value={`${analytics.occupancy}%`} foot={`${analytics.unitsLet} of ${analytics.unitsTotal} units`} delta="+4.2%" />
      <Stat label="RENT COLLECTED" value={`₹${analytics.rentCollected.toFixed(2)} Cr`} foot={`Target ₹${analytics.rentTarget.toFixed(2)} Cr`} delta="+6.1%" />
      <Stat label="OPEN MAINTENANCE" value={analytics.openMaintenance} foot="3 urgent · 12 medium" delta="-9%" />
      <Stat label="ACTIVE LEASES" value={analytics.activeLeases} foot="14 renewals due" delta="+12" />
    </div>
    <div className="content-grid">
      <section className="card revenue-card">
        <div className="section-heading"><div><h2>Revenue trend</h2><p>Collected rent, last 7 months</p></div><button className="text-link" onClick={() => onNavigate('payments')}>/analytics</button></div>
        <div className="chart">{analytics.revenue.map((v,i) => <div className="bar-wrap" key={months[i]}><div className="bar" style={{height: `${36 + v*13}%`}}><span>₹{v}Cr</span></div><small>{months[i]}</small></div>)}</div>
      </section>
      <section className="card">
        <div className="section-heading"><h2>Maintenance queue</h2><span className="status failed">4 Open</span></div>
        <div className="queue">{maintenance.filter(x => x.status !== 'Resolved').slice(0,4).map(x => <MiniTicket item={x} key={x.id} />)}</div>
      </section>
    </div>
  </main>
}

function MiniTicket({item}) {
  return <button className="mini-ticket"><span className={`dot ${item.priority.toLowerCase()}`}></span><div><b>{item.title}</b><small>{item.place}</small></div><span className="ticket-id">{item.id}</span></button>
}

function Properties({items, filter, setFilter, search, setSearch, onAdd, onView, onEdit, onDelete}) {
  const filtered = useMemo(() => items.filter(p => (filter === 'All' || p.status === filter) && `${p.name} ${p.city}`.toLowerCase().includes(search.toLowerCase())), [items,filter,search])
  return <main>
    <PageHeader title="Properties" subtitle="Every listing in the portfolio with live occupancy and rent roll" action={<button className="primary-btn" onClick={onAdd}>{icon('plus')} Add property</button>} />
    <section className="card list-card">
      <div className="toolbar">
        <div className="searchbox">{icon('search')}<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties, cities..." /></div>
        {['All','Occupied','Leasing','Vacant'].map(f => <button key={f} className={`filter ${filter === f ? 'active':''}`} onClick={() => setFilter(f)}>{f}</button>)}
        <code>GET /api/v1/properties</code>
      </div>
      <div className="property-grid">{filtered.map(p => <PropertyCard key={p.id} p={p} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}{filtered.length===0 && <div className="empty">No properties match your search.</div>}</div>
    </section>
  </main>
}

function PropertyCard({p,onView,onEdit,onDelete}) {
  return <article className="card property-card">
    <div className="property-title"><div><h3>{p.name}</h3><p>{p.city}</p></div><span className={`badge ${p.status.toLowerCase()}`}>{p.status}</span></div>
    <div className="metrics"><div><small>Rent roll</small><strong>{money(p.rentRoll)}</strong></div><div><small>Units let</small><strong>{p.unitsLet}/{p.unitsTotal}</strong></div></div>
    <div className="property-foot"><span>PRP-{p.id}</span><span>{p.tenant}</span></div>
    <div className="row-actions"><button className="secondary-btn" onClick={() => onView(p)}>View</button><button className="secondary-btn" onClick={() => onEdit(p)}>Edit</button><button className="danger-btn" onClick={() => onDelete(p.id)}>Delete</button></div>
  </article>
}

function Leases({items,onAdd,onView,onRenew}) {
  return <main><PageHeader title="Leases" subtitle="Track active agreements, rent terms and upcoming renewals" action={<button className="primary-btn" onClick={onAdd}>{icon('plus')} Create lease</button>} />
    <section className="card list-card"><div className="toolbar"><div className="searchbox">{icon('search')}<input placeholder="Search tenant or property..." /></div><code>GET /api/v1/leases</code></div>
      <div className="table-wrap"><table><thead><tr><th>LEASE ID</th><th>TENANT</th><th>PROPERTY</th><th>START</th><th>END</th><th>RENT</th><th>STATUS</th><th></th></tr></thead><tbody>{items.map(l => <tr key={l.id}><td>{l.id}</td><td><strong>{l.tenant}</strong></td><td>{l.property}</td><td>{l.start}</td><td>{l.end}</td><td>{money(l.rent)}</td><td><span className={`status ${l.status==='Active'?'captured':'pending'}`}>{l.status}</span></td><td><button className="table-btn" onClick={() => onView(l)}>View</button>{l.status!=='Active' && <button className="table-btn" onClick={() => onRenew(l.id)}>Renew</button>}</td></tr>)}</tbody></table></div>
    </section>
  </main>
}

function Payments({items,onAdd,onView}) {
  return <main><PageHeader title="Payments" subtitle="Razorpay ledger for rent, deposits and levies across the portfolio" action={<button className="primary-btn" onClick={onAdd}>{icon('plus')} Record payment</button>} />
    <div className="stat-grid three"><Stat label="CAPTURED" value={money(168500)} foot="" /><Stat label="PENDING" value={money(95000)} foot="" /><Stat label="FAILED ATTEMPTS" value="1" foot="" /></div>
    <section className="card list-card"><div className="section-heading"><h2>Transaction ledger</h2><code>GET /api/v1/payments</code></div><div className="table-wrap"><table><thead><tr><th>PAYMENT ID</th><th>TENANT</th><th>PROPERTY</th><th>PURPOSE</th><th>METHOD</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{items.map(p => <tr key={p.id} onClick={() => onView(p)} className="clickable"><td>{p.id}</td><td><strong>{p.tenant}</strong></td><td>{p.property}</td><td>{p.purpose}</td><td>{p.method}</td><td><strong>{money(p.amount)}</strong></td><td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td></tr>)}</tbody></table></div></section>
  </main>
}

function Maintenance({items,filter,setFilter,onAdd,onView,onAdvance}) {
  const groups = ['Open','Assigned','Resolved']
  return <main><PageHeader title="Maintenance" subtitle="Requests raised by tenants, routed to vendors and tracked to resolution" action={<button className="primary-btn" onClick={onAdd}>{icon('plus')} New request</button>} />
    <div className="filter-row">{['All','Urgent','High','Low'].map(f => <button key={f} className={`filter ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f}</button>)}<code>GET /api/v1/maintenance</code></div>
    <div className="kanban">{groups.map(g => <section className="card kanban-col" key={g}><div className="kanban-head"><h2>{g}</h2><span>{items.filter(i => i.status===g && (filter==='All'||i.priority===filter)).length}</span></div>{items.filter(i => i.status===g && (filter==='All'||i.priority===filter)).map(item => <Ticket key={item.id} item={item} onView={onView} onAdvance={onAdvance} />)}</section>)}</div>
  </main>
}

function Ticket({item,onView,onAdvance}) {
  return <article className="ticket-card" onClick={() => onView(item)}><div className="ticket-main"><span className={`dot ${item.priority.toLowerCase()}`}></span><div><h4>{item.title}</h4><small>{item.place}</small></div><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span></div><div className="ticket-meta"><span>{item.id}</span><span>{item.vendor}</span><span>{item.age}</span></div>{item.status!=='Resolved' && <button className="advance-btn" onClick={(e)=>{e.stopPropagation();onAdvance(item.id)}}>{item.status==='Open'?'Assign vendor':'Mark resolved'}</button>}</article>
}

function Modal({modal,close,addProperty,updateProperty,addPayment,addLease,addMaintenance,onRenew,onAdvance}) {
  if (modal.type==='ai') return <Overlay close={close}><h2>Keystone AI</h2><p>Frontend actions ready to connect to your analytics and service endpoints.</p><div className="modal-actions"><button className="primary-btn" onClick={()=>{close();}}>Summarize portfolio</button><button className="secondary-btn" onClick={close}>Analyze renewals</button><button className="secondary-btn" onClick={close}>Prioritize maintenance</button></div></Overlay>
  if (modal.type==='propertyView') return <Overlay close={close}><h2>{modal.item.name}</h2><p>{modal.item.city}</p><div className="detail-grid"><div><small>Status</small><b>{modal.item.status}</b></div><div><small>Units</small><b>{modal.item.unitsLet}/{modal.item.unitsTotal}</b></div><div><small>Rent roll</small><b>{money(modal.item.rentRoll)}</b></div><div><small>Tenant</small><b>{modal.item.tenant}</b></div></div></Overlay>
  if (modal.type==='paymentView') return <Overlay close={close}><h2>Payment details</h2><p><strong>{modal.item.id}</strong> · {modal.item.tenant}</p><div className="detail-grid"><div><small>Property</small><b>{modal.item.property}</b></div><div><small>Amount</small><b>{money(modal.item.amount)}</b></div><div><small>Method</small><b>{modal.item.method}</b></div><div><small>Status</small><b>{modal.item.status}</b></div></div></Overlay>
  if (modal.type==='leaseView') return <Overlay close={close}><h2>Lease details</h2><p><strong>{modal.item.id}</strong> · {modal.item.tenant}</p><div className="detail-grid"><div><small>Property</small><b>{modal.item.property}</b></div><div><small>Term</small><b>{modal.item.start} → {modal.item.end}</b></div><div><small>Rent</small><b>{money(modal.item.rent)}</b></div><div><small>Status</small><b>{modal.item.status}</b></div></div><div className="modal-actions">{modal.item.status!=='Active' && <button className="primary-btn" onClick={()=>{onRenew(modal.item.id);close()}}>Renew</button>}</div></Overlay>
  if (modal.type==='maintenanceView') return <Overlay close={close}><h2>{modal.item.title}</h2><p>{modal.item.place} · {modal.item.id}</p><div className="detail-grid"><div><small>Priority</small><b>{modal.item.priority}</b></div><div><small>Vendor</small><b>{modal.item.vendor}</b></div><div><small>Status</small><b>{modal.item.status}</b></div><div><small>Reported</small><b>{modal.item.age}</b></div></div><div className="modal-actions">{modal.item.status!=='Resolved' && <button className="primary-btn" onClick={()=>{onAdvance(modal.item.id);close()}}>{modal.item.status==='Open'?'Assign vendor':'Mark resolved'}</button>}</div></Overlay>
  if (modal.type==='property') return <PropertyForm item={modal.item} onSubmit={(x)=>{modal.mode==='edit'?updateProperty(x):addProperty(x);close()}} close={close} />
  if (modal.type==='payment') return <SimpleForm title="Record payment" fields={[['tenant','Tenant'],['property','Property'],['amount','Amount']]} selects={[['method',['UPI','Netbanking','Card']],['status',['Captured','Pending','Failed']]]} close={close} onSubmit={x=>{addPayment({...x,amount:Number(x.amount)||0,purpose:'Rent · Jun'});close()}} />
  if (modal.type==='lease') return <SimpleForm title="Create lease" fields={[['tenant','Tenant'],['property','Property'],['start','Start date'],['end','End date'],['rent','Monthly rent']]} close={close} onSubmit={x=>{addLease({...x,rent:Number(x.rent)||0,status:'Active'});close()}} />
  if (modal.type==='maintenance') return <SimpleForm title="New maintenance request" fields={[['title','Issue title'],['place','Property · unit'],['vendor','Vendor']]} selects={[['priority',['Urgent','High','Low']]]} close={close} onSubmit={x=>{addMaintenance({...x,status:'Open'});close()}} />
}

function Overlay({children,close}) { return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><button className="close" onClick={close}>{icon('close')}</button>{children}</div></div> }

function PropertyForm({item,close,onSubmit}) {
  const [form,setForm] = useState(item || {name:'',city:'',status:'Occupied',rentRoll:0,unitsLet:0,unitsTotal:0,tenant:''})
  const update=(k,v)=>setForm(f=>({...f,[k]:['rentRoll','unitsLet','unitsTotal'].includes(k)?Number(v)||0:v}))
  return <Overlay close={close}><h2>{item?'Edit property':'Add property'}</h2><div className="form-grid"><input placeholder="Property name" value={form.name} onChange={e=>update('name',e.target.value)} /><input placeholder="City / locality" value={form.city} onChange={e=>update('city',e.target.value)} /><input placeholder="Rent roll" value={form.rentRoll} onChange={e=>update('rentRoll',e.target.value)} /><input placeholder="Total units" value={form.unitsTotal} onChange={e=>update('unitsTotal',e.target.value)} /><input placeholder="Units let" value={form.unitsLet} onChange={e=>update('unitsLet',e.target.value)} /><input placeholder="Tenant / type" value={form.tenant} onChange={e=>update('tenant',e.target.value)} /><select value={form.status} onChange={e=>update('status',e.target.value)}><option>Occupied</option><option>Leasing</option><option>Vacant</option></select></div><div className="modal-actions"><button className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn" onClick={()=>onSubmit(form)}>{item?'Save changes':'Create property'}</button></div></Overlay>
}

function SimpleForm({title,fields,selects=[],close,onSubmit}) {
  const initial=Object.fromEntries(fields.map(([k])=>[k,'']))
  selects.forEach(([k,opts])=>initial[k]=opts[0])
  const [form,setForm]=useState(initial)
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  return <Overlay close={close}><h2>{title}</h2><div className="form-grid">{fields.map(([k,ph])=><input key={k} placeholder={ph} value={form[k]} onChange={e=>set(k,e.target.value)} />)}{selects.map(([k,opts])=><select key={k} value={form[k]} onChange={e=>set(k,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>)}</div><div className="modal-actions"><button className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn" onClick={()=>onSubmit(form)}>Save</button></div></Overlay>
}

createRoot(document.getElementById('root')).render(<App />)
