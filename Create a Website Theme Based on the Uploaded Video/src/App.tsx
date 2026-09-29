import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, AlertTriangle, ArrowRight, Bell, Building2, Camera, Check, ChevronDown, CloudRain, FileText, Layers3, Leaf, LocateFixed, LockKeyhole, LogOut, Map, Menu, Navigation, Search, ShieldCheck, Upload, Users, Waves, X } from 'lucide-react'
import { GovernmentRole, UserRole, useAuth } from './auth'
import { useTheme } from './contexts/ThemeContext'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { InterfaceAnimations } from './components/InterfaceAnimations'
import Globe from './components/Globe'
import { AIAssistantBar } from './components/AIAssistantBar'
import { SplashScreen } from './components/SplashScreen'

type View = 'overview' | 'gis' | 'evidence' | 'insights' | 'reports' | 'operations' | 'watersheds' | 'assets' | 'inspections' | 'observation' | 'before-after' | 'priority' | 'alerts'
type Role = UserRole

const nav: { id: View; label: string; icon: typeof Waves; public?: boolean; roles?: GovernmentRole[] }[] = [
  { id: 'overview', label: 'Dashboard', icon: Waves, public: true, roles: ['administrator', 'district_officer', 'field_officer'] },
  { id: 'gis', label: 'GIS Map', icon: Layers3, public: true, roles: ['administrator', 'district_officer', 'field_officer'] }, { id: 'evidence', label: 'Geo-Coded Images', icon: Camera, public: true, roles: ['administrator', 'district_officer', 'field_officer'] },
  { id: 'insights', label: 'Development Insights', icon: Activity, public: true, roles: ['administrator', 'district_officer'] },
  { id: 'operations', label: 'Inspections', icon: ShieldCheck, roles: ['administrator', 'district_officer', 'field_officer'] },
  { id: 'observation', label: 'Field Observation', icon: Navigation, roles: ['administrator', 'district_officer', 'field_officer'] },
  { id: 'before-after', label: 'Before / After', icon: Camera, roles: ['administrator', 'district_officer', 'field_officer'] },
  { id: 'priority', label: 'Priority Intervention', icon: AlertTriangle, roles: ['administrator', 'district_officer'] },
  { id: 'alerts', label: 'Alerts', icon: Bell, roles: ['administrator', 'district_officer', 'field_officer'] },
  { id: 'reports', label: 'Reports', icon: FileText, public: true, roles: ['administrator', 'district_officer'] }
]
const protectedPaths = ['/inspections', '/field-observation', '/before-after', '/alerts', '/government-reports', '/priority-intervention']
const paths: Record<View, string> = { overview: '/', gis: '/gis', evidence: '/geo-images', insights: '/development-insights', reports: '/reports', operations: '/inspections', watersheds: '/watersheds', assets: '/watershed-assets', inspections: '/inspections', observation: '/field-observation', 'before-after': '/before-after', priority: '/priority-intervention', alerts: '/alerts' }
const viewFromPath = (path: string): View => (({ '/': 'overview', '/gis': 'gis', '/geo-images': 'evidence', '/development-insights': 'insights', '/reports': 'reports', '/government-reports': 'reports', '/inspections': 'operations', '/field-observation': 'observation', '/before-after': 'before-after', '/priority-intervention': 'priority', '/alerts': 'alerts', '/watersheds': 'watersheds', '/watershed-assets': 'assets' } as Record<string, View>)[path] || 'overview')

function Logo() {
  return (
    <div className="brand">
      <div className="mark">
        <span></span>
        <i></i>
        <b></b>
      </div>
      <div>
        <strong>JAL-IMPACT</strong>
        <small>Geospatial Watershed Intelligence</small>
      </div>
    </div>
  )
}
function PlanningContext({ role }: { role: Role }) { const [expanded, setExpanded] = useState(false); return <section className="planning-context" aria-label="Decentralised planning context"><div><span className="planning-chip">SPACE-ENABLED LOCAL PLANNING</span><b>{role === 'government' ? 'Panchayat-ready intelligence for local planning' : 'Panchayat-ready watershed transparency'}</b><small>{expanded ? 'Inspired by public geospatial planning initiatives such as Bhuvan Panchayat: thematic mapping, local assets, water resources and location-aware planning.' : 'Map assets, water resources and development needs in a local planning context.'}</small></div><button onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>{expanded ? 'Show less' : 'Why it matters'} <ArrowRight size={14}/></button></section> }

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { authenticated, role, governmentRole, logout } = useAuth()
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname))
  const { theme } = useTheme()
  const [menu, setMenu] = useState(false)
  const [focus, setFocus] = useState('Kandhamal Watershed')
  const [govTarget, setGovTarget] = useState<string | null>(null)
  useEffect(() => { const onPop = () => setView(viewFromPath(window.location.pathname)); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  const visibleNav = useMemo(() => nav.filter(n => role === 'public' ? n.public : n.roles?.includes(governmentRole || 'field_officer')), [role, governmentRole])
  const navigate = (next: View) => { window.history.pushState({}, '', paths[next]); setView(next); setMenu(false) }
  const restricted = role === 'public' && protectedPaths.includes(window.location.pathname)

  return (
    <>
      {showSplash && <SplashScreen duration={3000} onFinish={() => setShowSplash(false)} />}
      {(!authenticated || !role) ? (
        <LoginPage />
      ) : restricted ? (
        <RestrictedPortal />
      ) : (
        <main className={`app ${theme}`}>
          <div className="app-globe-backdrop" aria-hidden="true">
            <Globe
              speed={0.8}
              scale={10}
              smoothing={8}
              fill="dots"
              dots={{
                color: theme === 'dark' ? '#38d9d9' : '#0ea5e9',
                size: 4,
                density: 7,
                allDots: false,
              }}
              oceanColor={theme === 'dark' ? 'rgba(7, 26, 43, 0.4)' : 'rgba(230, 246, 250, 0.3)'}
              outlineColor={theme === 'dark' ? 'rgba(56, 217, 217, 0.25)' : 'rgba(14, 165, 233, 0.25)'}
              showOutline={true}
              showGrid={true}
              graticuleColor={theme === 'dark' ? 'rgba(56, 217, 217, 0.12)' : 'rgba(14, 165, 233, 0.12)'}
              markerConfig={{
                markers: [
                  { lat: 20.9517, lng: 85.0985 },
                  { lat: 12.9716, lng: 79.9800 },
                  { lat: 28.6139, lng: 77.2090 },
                ],
                color: '#00f7ff',
                size: 40,
              }}
            />
          </div>
          <InterfaceAnimations view={view} />
          <aside className={menu ? 'sidebar open' : 'sidebar'}>
            <Logo />
            <div className={role === 'government' ? 'access-badge government' : 'access-badge'}>{role === 'government' ? <><LockKeyhole size={13}/> GOVERNMENT PORTAL</> : <><Users size={13}/> PUBLIC PORTAL</>}</div>
            <div className="command-center-heading"><span>NAVIGATION</span></div>
            <nav aria-label="Command Center navigation">{visibleNav.map(({ id, label, icon: Icon }) => <button type="button" key={id} title={label} aria-current={view === id ? 'page' : undefined} className={view === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={18}/><span>{role === 'public' && id === 'overview' ? 'Overview' : role === 'government' && id === 'watersheds' ? 'Watersheds' : role === 'government' && id === 'insights' ? 'Spatial Analytics' : label}</span>{id === 'operations' && <em>3</em>}</button>)}</nav>
            <button className="side-foot logout" onClick={logout}><LogOut size={17}/><span>Sign out</span></button>
          </aside>
          <section className="shell">
            <header>
              <button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Toggle navigation">{menu ? <X/> : <Menu/>}</button>
              <div className="crumb"><span>{view === 'gis' ? 'GIS MAP' : view === 'evidence' ? 'GEO-CODED EVIDENCE' : view === 'operations' ? 'INSPECTIONS' : view === 'insights' ? 'SPATIAL INTELLIGENCE' : view === 'reports' ? 'REPORTS' : view === 'observation' ? 'FIELD OBSERVATION' : view === 'before-after' ? 'BEFORE / AFTER' : view === 'priority' ? 'PRIORITY INTERVENTION' : view === 'alerts' ? 'ALERTS' : 'DASHBOARD'}</span></div>
              <HeaderTools role={role} governmentRole={governmentRole} visibleNav={visibleNav} navigate={navigate} openTarget={setGovTarget} logout={logout}/>
            </header>
            {view === 'overview' && (role === 'public' ? <PublicDashboard navigate={navigate}/> : <GovernmentDashboard navigate={navigate} openTarget={setGovTarget}/>)} {view === 'gis' && (role === 'public' ? <PublicGIS navigate={navigate}/> : <GovernmentGIS target={govTarget} clearTarget={() => setGovTarget(null)} navigate={navigate}/>)} {view === 'evidence' && (role === 'public' ? <PublicEvidence/> : <Evidence navigate={navigate}/>)} {view === 'insights' && (role === 'public' ? <PublicInsights/> : <SpatialAnalytics/>)} {view === 'operations' && <Operations navigate={navigate}/>} {view === 'observation' && <FieldObservation navigate={navigate}/>} {view === 'before-after' && <BeforeAfter/>} {view === 'priority' && <PriorityIntervention navigate={navigate}/>} {view === 'alerts' && <Alerts navigate={navigate} openTarget={setGovTarget}/>} {view === 'reports' && (role === 'public' ? <PublicReports/> : <Reports navigate={navigate}/>)} {['watersheds', 'assets', 'inspections'].includes(view) && <ModulePlaceholder view={view} role={role}/>} 
            <AIAssistantBar navigate={navigate} currentView={view} />
          </section>
        </main>
      )}
    </>
  )
}

function Overview({ role, setView, focus, setFocus }: { role: Role; setView: (v: View) => void; focus: string; setFocus: (s:string)=>void }) { return <div className="page overview"><section className="hero"><div className="hero-copy"><div className="eyebrow"><span></span>LIVE WATERSHED INTELLIGENCE</div><h1>See the story<br/>beneath the <i>surface.</i></h1><p>Transforming geo-coded field evidence into clear, timely action for India’s watersheds.</p><div className="hero-actions"><button className="primary" onClick={() => setView('gis')}>Explore live map <ArrowRight size={17}/></button><button className="ghost" onClick={() => setView('evidence')}><Camera size={17}/> View field evidence</button></div></div><div className="hero-orbit"><div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="water-globe"><span className="grid"></span><span className="land land-a"></span><span className="land land-b"></span><div className="pin pin-one"></div><div className="pin pin-two"></div></div><div className="live-tag"><span className="pulse"></span> 126 live observations</div></div></section>
    <section className="signal-bar"><div><Waves/><span><b>72%</b> Watershed health</span></div><div><CloudRain/><span><b>842 mm</b> Seasonal rainfall</span></div><div><Layers3/><span><b>34</b> Active interventions</span></div><div><Check/><span><b>91%</b> Field verified</span></div></section>
    <section className="section-heading"><div><span className="eyebrow">DECISION SIGNALS</span><h2>Where attention creates impact</h2></div><button className="text-btn" onClick={() => setView('insights')}>Open spatial intelligence <ArrowRight size={16}/></button></section>
    <section className="signal-grid"><article className="priority-card"><div className="card-top"><span className="status amber">PRIORITY INTERVENTION</span><button><LocateFixed size={17}/></button></div><h3>Check dam performance needs field verification</h3><p>South-east drainage corridor shows a 14% decline in post-monsoon water retention.</p><div className="evidence-line"><div className="mini-photo"></div><span>Satellite change + 3 field images</span><ArrowRight size={16}/></div></article><article className="map-card"><div className="map-art"><div className="contours"></div><span className="map-label a">Ballyguda</span><span className="map-label b">Priority zone</span><span className="map-pin"></span><span className="river"></span></div><div className="map-caption"><div><small>FOCUS WATERSHED</small><b>{focus}</b></div><button onClick={() => setFocus(focus === 'Kandhamal Watershed' ? 'Tikabali Micro-watershed' : 'Kandhamal Watershed')}>Change <ChevronDown size={14}/></button></div></article><article className="impact-card"><span className="eyebrow">SEASONAL PROGRESS</span><div className="score"><span>68</span><small>/ 100</small></div><h3>Water resilience is improving</h3><div className="progress"><i></i></div><p>+8 points since 2025 baseline</p></article></section>
    <section className="story-strip"><div><span className="eyebrow">EVIDENCE TO ACTION</span><h2>From a field photo to a public good.</h2></div><div className="story-flow"><b><Camera/> Geo-image</b><i></i><b><Navigation/> Location context</b><i></i><b><Waves/> Watershed action</b></div></section>
    {role === 'government' && <section className="field-cta"><div><span className="eyebrow">FIELD OPERATIONS</span><h2>3 observations need your team’s attention.</h2><p>Coordinate verification, add evidence and close the loop.</p></div><button className="primary" onClick={() => setView('operations')}>Review operations <ArrowRight size={17}/></button></section>}
  </div> }

function GIS({ focus }: { focus: string }) { return <div className="page gis-page"><div className="gis-map"><div className="terrain"></div><div className="gis-grid"></div><div className="flow f1"></div><div className="flow f2"></div><div className="flow f3"></div><div className="boundary b1"></div><div className="boundary b2"></div><div className="map-marker m1"><i></i><span>Check dam</span></div><div className="map-marker m2"><i></i><span>Farm pond</span></div><div className="map-marker m3 alert"><i></i><span>Review needed</span></div><div className="gis-title"><span className="eyebrow">LIVE SPATIAL LAYER</span><h1>{focus}</h1><p>Terrain · hydrology · field evidence</p></div><div className="layer-panel"><div className="panel-head"><b>Map layers</b><Layers3 size={17}/></div><label><input type="checkbox" defaultChecked/> Watershed boundary</label><label><input type="checkbox" defaultChecked/> Drainage network</label><label><input type="checkbox" defaultChecked/> Field evidence</label><label><input type="checkbox"/> Rainfall intensity</label></div><div className="map-controls"><button>+</button><button>−</button><button><LocateFixed size={18}/></button></div><div className="map-legend"><span><i className="blue"></i> Drainage</span><span><i className="green"></i> Healthy cover</span><span><i className="amber-dot"></i> Attention</span></div></div></div> }
type StoredGeoEvidence = {
  id: string
  assetId: string
  assetType: string
  village: string
  place?: string
  watershed: string
  date: string
  latitude: number
  longitude: number
  water: string
  condition: string
  vegetation: string
  erosion: string
  debris: string
  remarks: string
  previewUrl: string
  fileName: string
  status?: string
}

function loadStoredGeoEvidence(): StoredGeoEvidence[] {
  try {
    return JSON.parse(localStorage.getItem('jal-impact-uploaded-images') || '[]')
  } catch {
    return []
  }
}

function saveStoredGeoEvidence(item: StoredGeoEvidence) {
  const existing = loadStoredGeoEvidence()
  localStorage.setItem('jal-impact-uploaded-images', JSON.stringify([item, ...existing]))
}

function Evidence({ navigate }: { navigate: (view: View) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [customItems, setCustomItems] = useState<StoredGeoEvidence[]>(loadStoredGeoEvidence)

  useEffect(() => {
    const handleStorage = () => setCustomItems(loadStoredGeoEvidence())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [])

  const defaultCards = [
    { id: 'IMG-1024', place: 'Madurantakam', asset: 'WHS-021 · Check Dam', date: '11 Sep 2026 · 10:42', lat: 12.981200, lng: 79.998000, water: 'Poor', condition: 'Moderate', imgClass: 'img-0' },
    { id: 'IMG-1025', place: 'Kovilur', asset: 'WHS-028 · Farm Pond', date: '10 Sep 2026 · 14:18', lat: 12.975400, lng: 80.012000, water: 'Moderate', condition: 'Good', imgClass: 'img-1' }
  ]

  return (
    <div className="page content-page gov-evidence">
      <section className="content-hero">
        <span className="eyebrow">GEO-CODED FIELD EVIDENCE</span>
        <h1>Evidence captured.<br/><i>Intelligence connected.</i></h1>
        <p>GPS-linked images connect visual evidence to watershed assets, observations and field decisions.</p>
        <button type="button" className="primary" onClick={() => navigate('observation')}>
          <Upload size={17}/> Upload Field Geo-Image
        </button>
      </section>

      <div className="evidence-journey">
        <Camera/> Image <i></i><LocateFixed/> GPS <i></i><Map/> GIS <i></i><Waves/> Watershed <i></i><Building2/> Asset <i></i><Activity/> Analysis
      </div>

      <section className="gov-evidence-grid">
        {/* Render newly uploaded geo images */}
        {customItems.map((item) => (
          <article className="gov-evidence-card custom-evidence-card" key={item.id}>
            <div
              className="gov-image uploaded-thumb"
              style={{
                backgroundImage: item.previewUrl ? `url(${item.previewUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '160px',
                position: 'relative',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setSelected(item.id)}
            >
              <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: 4, color: '#fff', fontSize: 12 }}>
                <Camera size={13}/> {item.id}
              </span>
              <em style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(16,185,129,0.85)', padding: '3px 8px', borderRadius: 4, color: '#fff', fontSize: 11 }}>
                <LocateFixed size={12}/> Live Upload
              </em>
            </div>
            <div className="gov-evidence-info">
              <div className="evidence-id">
                <span>{item.id}</span>
                <small style={{ color: '#10b981', fontWeight: 700 }}>FIELD CAPTURE</small>
              </div>
              <h3>{item.village || item.place}</h3>
              <p><LocateFixed size={14}/> {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</p>
              <p><Camera size={14}/> {item.date}</p>
              <div className="evidence-meta">
                <span>Asset <b>{item.assetId}</b></span>
                <span>Water <b className={item.water === 'Poor' ? 'red-text' : 'green-text'}>{item.water}</b></span>
                <span>Condition <b className="amber-text">{item.condition}</b></span>
              </div>
              <footer>
                <button type="button" onClick={() => setSelected(item.id)}>View</button>
                <button type="button" onClick={() => setAnalysis(item.id)}>Analyze</button>
                <button type="button" onClick={() => navigate('before-after')}>Compare</button>
                <button type="button" onClick={() => navigate('gis')}>View on GIS</button>
              </footer>
            </div>
          </article>
        ))}

        {/* Render default seed cards */}
        {defaultCards.map((card) => (
          <article className="gov-evidence-card" key={card.id}>
            <button type="button" className={'gov-image ' + card.imgClass} onClick={() => setSelected(card.id)}>
              <span><Camera size={14}/> {card.id}</span>
              <em><LocateFixed size={13}/> GPS verified</em>
              <i><Search size={18}/></i>
            </button>
            <div className="gov-evidence-info">
              <div className="evidence-id">
                <span>{card.id}</span>
                <small>FIELD EVIDENCE</small>
              </div>
              <h3>{card.place}</h3>
              <p><LocateFixed size={14}/> {card.lat.toFixed(6)}, {card.lng.toFixed(6)}</p>
              <p><Camera size={14}/> {card.date}</p>
              <div className="evidence-meta">
                <span>Asset <b>{card.asset}</b></span>
                <span>Water <b className="red-text">{card.water}</b></span>
                <span>Condition <b className="amber-text">{card.condition}</b></span>
              </div>
              <footer>
                <button type="button" onClick={() => setSelected(card.id)}>View</button>
                <button type="button" onClick={() => setAnalysis(card.id)}>Analyze</button>
                <button type="button" onClick={() => navigate('before-after')}>Compare</button>
                <button type="button" onClick={() => navigate('gis')}>View on GIS</button>
              </footer>
            </div>
          </article>
        ))}
      </section>

      {selected && (
        <GovernmentImageModal
          id={selected}
          customItem={customItems.find(x => x.id === selected)}
          close={() => setSelected(null)}
          analyze={() => setAnalysis(selected)}
          navigate={navigate}
        />
      )}
      {analysis && <AnalysisModal id={analysis} close={() => setAnalysis(null)}/>}
    </div>
  )
}

function GovernmentImageModal({ id, customItem, close, analyze, navigate }: { id: string; customItem?: StoredGeoEvidence; close: () => void; analyze: () => void; navigate: (view: View) => void }) {
  const imgSrc = customItem?.previewUrl ? customItem.previewUrl : id === 'IMG-1025' ? '/field-obs-1.jpg' : '/field-obs-2.jpg'

  return (
    <div className="image-modal gov-image-modal" onClick={close}>
      <article onClick={e => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close}><X/></button>
        <div style={{ width: '100%', maxHeight: '340px', overflow: 'hidden', borderRadius: '12px', marginBottom: '16px' }}>
          <img src={imgSrc} alt={id} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}/>
        </div>
        <span className="eyebrow">GEO-CODED FIELD EVIDENCE</span>
        <h2>{id} · {customItem?.village || (id === 'IMG-1024' ? 'Madurantakam' : 'Kovilur')}</h2>
        <div className="modal-detail-grid">
          <span>GPS <b>{customItem ? `${customItem.latitude.toFixed(6)}, ${customItem.longitude.toFixed(6)}` : id === 'IMG-1024' ? '12.981200, 79.998000' : '12.970000, 80.006000'}</b></span>
          <span>Captured <b>{customItem?.date || '11 Sep 2026 · 10:42'}</b></span>
          <span>Watershed <b>{customItem?.watershed || (id === 'IMG-1024' ? 'WS-003 · Madurantakam' : 'WS-001 · Kovilur')}</b></span>
          <span>Village <b>{customItem?.village || (id === 'IMG-1024' ? 'Madurantakam' : 'Kovilur')}</b></span>
          <span>Asset <b>{customItem ? `${customItem.assetId} · ${customItem.assetType}` : 'WHS-021 · Check Dam'}</b></span>
          <span>Officer <b>A. Suresh · Field Officer</b></span>
        </div>
        <section className="internal-observation">
          <b>Observation</b>
          <p>{customItem?.remarks || 'Water retention visible with active spillway overflow and canal feed.'}</p>
          <b>AI-assisted analysis</b>
          <p>Verified GPS geofence match. Object detection confirmed structure and water boundary.</p>
          <b>Internal notes</b>
          <p>Linked to district operational dataset and geospatial dashboard.</p>
        </section>
        <footer className="modal-actions">
          <button type="button" onClick={analyze}>Analyze Image</button>
          <button type="button" onClick={() => navigate('before-after')}>Compare</button>
          <button type="button" onClick={() => navigate('gis')}>View on GIS</button>
          <button type="button" onClick={() => navigate('operations')}>Create Inspection</button>
          <button type="button" onClick={() => navigate('observation')}>Create Observation</button>
        </footer>
      </article>
    </div>
  )
}

function AnalysisModal({ id, close }: { id: string; close: () => void }) { const [step, setStep] = useState(0); useEffect(() => { if (step < 4) { const timer = window.setTimeout(() => setStep(step + 1), 750); return () => window.clearTimeout(timer) } }, [step]); const steps = ['Scanning visual evidence...', 'Reading geo-spatial context...', 'Comparing field indicators...', 'Generating observation...']; const results = [['Water Presence','82%'],['Vegetation','90%'],['Structure Damage','64%'],['Possible Erosion','51%']]; return <div className="image-modal analysis-modal"><article><button className="modal-close" onClick={close}><X/></button><span className="ripple-loader"><i></i><i></i><i></i></span><span className="eyebrow">AI-ASSISTED VISUAL OBSERVATION · {id}</span><h2>{step < 4 ? 'Analyzing visual evidence...' : 'Possible degradation observed.'}</h2>{step < 4 ? <div className="analysis-steps">{steps.map((text,i) => <p key={text} className={i <= step ? 'done' : ''}><span>{i < step ? <Check size={13}/> : i === step ? <i className="mini-ripple"></i> : i + 1}</span>{text}</p>)}</div> : <><div className="analysis-results">{results.map(([label,value],i) => <div key={label}><span>{label}<b>{value}</b></span><i><em style={{ width: value }}></em></i></div>)}</div><p className="analysis-note">AI-assisted visual observation. Field verification recommended.</p><p className="analysis-disclaimer">AI-assisted visual observation. Results require field verification and should not be treated as official ground truth.</p><button className="primary" onClick={close}>Close analysis</button></>}</article></div> }
function Insights() { return <div className="page content-page"><section className="content-hero"><span className="eyebrow">SPATIAL INTELLIGENCE</span><h1>Patterns that point<br/>to <i>better decisions.</i></h1></section><section className="insight-layout"><article className="heat-card"><div className="heatmap"><span className="hot h1"></span><span className="hot h2"></span><span className="hot h3"></span><div className="contours"></div></div><div><b>Intervention priority surface</b><p>Combines water stress, verified evidence and asset performance.</p></div></article><div className="insight-list"><article><AlertTriangle/><div><small>HIGH PRIORITY</small><h3>7 assets show declining retention</h3><p>Review field evidence before 30 Sep.</p></div><ArrowRight size={18}/></article><article><Leaf/><div><small>POSITIVE CHANGE</small><h3>Vegetation cover up 11.2%</h3><p>Compared with 2025 post-monsoon imagery.</p></div><ArrowRight size={18}/></article></div></section></div> }
function Operations({ navigate }: { navigate: (view: View) => void }) { const [detail, setDetail] = useState(false); const [notice, setNotice] = useState(''); const inspections = [['INS-2042','WHS-021','WS-001','Field Officer 07','11 Sep 2026','Moderate','High','Pending Verification'],['INS-2038','WHS-042','WS-001','Field Officer 03','09 Sep 2026','Good','Medium','Scheduled'],['INS-2016','WHS-087','WS-003','Field Officer 11','06 Sep 2026','Damaged','High','Pending Verification']]; return <div className="page content-page operations-page"><section className="operations-hero"><div><span className="eyebrow">FIELD OPERATIONS</span><h1>Verification,<br/><i>where it matters.</i></h1><p>Coordinate inspections, evidence and field observations across watershed assets.</p></div><button className="primary" onClick={() => navigate('observation')}><LocateFixed size={17}/> New field observation</button></section><section className="ops-kpis">{[['Pending Inspections','24','blue'],['Completed','182','green'],['Critical','8','red'],['Due This Week','14','amber']].map(([label,value,tone]) => <button key={label} className={tone} onClick={() => setNotice(`${label} filter applied.`)}><b>{value}</b><span>{label}</span><ArrowRight size={15}/></button>)}</section>{notice && <div className="toast"><Check size={15}/>{notice}</div>}<section className="inspection-table"><div className="inspection-heading"><div><span className="eyebrow">INSPECTION CENTER</span><h2>Active inspections</h2></div><button className="text-btn" onClick={() => setNotice('Showing this week’s inspection queue.')}>This week <ChevronDown size={15}/></button></div><div className="inspection-head"><span>Inspection ID</span><span>Asset / Watershed</span><span>Officer</span><span>Last inspection</span><span>Condition</span><span>Priority</span><span>Status</span><span></span></div>{inspections.map((row,i) => <article className="inspection-row" key={row[0]}><b>{row[0]}</b><span><b>{row[1]}</b><small>{row[2]}</small></span><span>{row[3]}</span><span>{row[4]}</span><span className={row[5] === 'Damaged' ? 'red-text' : 'amber-text'}>{row[5]}</span><span className={row[6] === 'High' ? 'priority-high' : 'priority-medium'}>{row[6]}</span><span className="inspection-status">{row[7]}</span><div className="inspection-actions"><button onClick={() => { setDetail(true); setNotice('Inspection detail opened.') }}>Start Inspection</button><button onClick={() => navigate('evidence')}>View Evidence</button></div></article>)}</section>{detail && <InspectionDrawer close={() => setDetail(false)} navigate={navigate}/>}</div> }
function InspectionDrawer({ close, navigate }: { close: () => void; navigate: (view: View) => void }) { const [message, setMessage] = useState(''); return <aside className="inspection-drawer"><button className="drawer-close" onClick={close}><X/></button><span className="eyebrow">INSPECTION DETAIL · INS-2042</span><h2>WHS-021<br/><i>Check Dam</i></h2><div className="inspection-location"><LocateFixed size={17}/><span>GPS location<br/><b>12.970000, 80.006000</b></span><button onClick={() => navigate('gis')}>Open GIS <ArrowRight size={14}/></button></div><div className="inspection-images"><div className="img-0" style={{ backgroundImage: "url('/field-obs-2.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}><small>Latest image · 11 Sep</small></div><div className="img-1" style={{ backgroundImage: "url('/field-obs-1.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}><small>Previous image · 12 Aug</small></div></div><div className="inspection-signals">{[['Water condition','Poor','red-text'],['Structure condition','Moderate','amber-text'],['Vegetation','Good','green-text'],['Erosion','Possible','amber-text'],['Silt / debris','Observed','amber-text']].map(([name,value,tone]) => <div key={name}><span>{name}</span><b className={tone}>{value}</b></div>)}</div><section className="remarks"><b>Previous inspection</b><p>Outlet flow was stable; light debris noted near spillway.</p><b>Current observation</b><p>Reduced water retention visible in current geo-coded evidence.</p><b>Officer remarks</b><p>Verify after next rainfall event and assess silt removal requirement.</p></section><footer className="drawer-actions"><button onClick={() => navigate('observation')}>Start Inspection</button><button onClick={() => setMessage('Inspection submitted for district review.')}>Submit Inspection</button><button onClick={() => setMessage('Asset marked for verification.')}>Mark for Verification</button></footer>{message && <div className="drawer-toast"><Check size={14}/>{message}</div>}</aside> }


function FieldObservation({ navigate }: { navigate: (view: View) => void }) {
  const [selectedAsset, setSelectedAsset] = useState('WHS-021 · Check Dam')
  const [watershedName, setWatershedName] = useState('WS-001 · Kovilur Watershed')
  const [village, setVillage] = useState('Kovilur')
  const [latitude, setLatitude] = useState(12.970000)
  const [longitude, setLongitude] = useState(80.006000)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsCaptured, setGpsCaptured] = useState(false)
  
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [water, setWater] = useState('Moderate')
  const [condition, setCondition] = useState('Good')
  const [vegetation, setVegetation] = useState('Good')
  const [erosion, setErosion] = useState('No')
  const [debris, setDebris] = useState('No')
  const [remarks, setRemarks] = useState('')
  const [submittedRecord, setSubmittedRecord] = useState<StoredGeoEvidence | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const captureDeviceGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. You can enter coordinates manually.')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setGpsCaptured(true)
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        alert('Could not access device GPS: ' + err.message + '. Default coordinates loaded.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setError('')
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewUrl) {
      setError('Please capture or upload a field photograph before submitting.')
      return
    }

    const now = new Date()
    const dateFormatted = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    const recordId = `IMG-${Math.floor(1000 + Math.random() * 9000)}`

    const [assetId, assetType] = selectedAsset.split(' · ')

    const newRecord: StoredGeoEvidence = {
      id: recordId,
      assetId: assetId.trim(),
      assetType: assetType ? assetType.trim() : 'Structure',
      village: village.trim() || 'Field Site',
      watershed: watershedName,
      date: dateFormatted,
      latitude: Number(latitude),
      longitude: Number(longitude),
      water,
      condition,
      vegetation,
      erosion,
      debris,
      remarks: remarks.trim() || 'Geo-tagged field observation recorded.',
      previewUrl,
      fileName: photoFile?.name || 'field_capture.jpg',
      status: 'Pending Verification'
    }

    saveStoredGeoEvidence(newRecord)
    setSubmittedRecord(newRecord)
  }

  const Select = ({ title, value, values, onChange }: { title: string; value: string; values: string[]; onChange: (v: string) => void }) => (
    <div className="field-select">
      <b>{title}</b>
      <div>
        {values.map(item => (
          <button
            key={item}
            type="button"
            className={value === item ? 'selected' : ''}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="field-observation">
      <header className="field-header">
        <button type="button" onClick={() => navigate('operations')} aria-label="Back to operations">
          <ArrowRight size={18}/>
        </button>
        <div>
          <span className="eyebrow">FIELD OPERATIONS</span>
          <h1>GEO-CODED IMAGE UPLOAD</h1>
        </div>
        <button
          type="button"
          className={`gps-live ${gpsCaptured ? 'gps-captured' : ''}`}
          onClick={captureDeviceGPS}
          style={{ cursor: 'pointer' }}
        >
          <i></i> {gpsLoading ? 'Capturing GPS...' : gpsCaptured ? 'Live GPS Locked' : 'Capture Live GPS'}
        </button>
      </header>

      <form onSubmit={handleSubmit}>
        <main>
          {/* Target Asset & Location Section */}
          <section className="field-asset" style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Target Asset</span>
                <select
                  value={selectedAsset}
                  onChange={(e) => {
                    setSelectedAsset(e.target.value)
                    if (e.target.value.includes('WHS-021')) { setLatitude(12.970000); setLongitude(80.006000); setVillage('Kovilur'); }
                    else if (e.target.value.includes('WHS-042')) { setLatitude(12.961000); setLongitude(79.952000); setVillage('Kovilur'); }
                    else if (e.target.value.includes('WHS-087')) { setLatitude(12.978000); setLongitude(80.005000); setVillage('Kancheepuram'); }
                  }}
                  style={{ display: 'block', padding: '8px 12px', borderRadius: '6px', marginTop: '4px', background: 'var(--card-bg, #1e293b)', color: 'inherit', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <option value="WHS-021 · Check Dam">WHS-021 · Check Dam (Kovilur)</option>
                  <option value="WHS-042 · Farm Pond">WHS-042 · Farm Pond (Kovilur)</option>
                  <option value="WHS-087 · Percolation Pond">WHS-087 · Percolation Pond (Madurantakam)</option>
                  <option value="WHS-104 · Contour Bund">WHS-104 · Contour Bund (Tikabali)</option>
                  <option value="WHS-112 · Afforestation Zone">WHS-112 · Afforestation Zone (Ballyguda)</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Village / Location</span>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village name"
                  style={{ display: 'block', padding: '8px 12px', borderRadius: '6px', marginTop: '4px', background: 'var(--card-bg, #1e293b)', color: 'inherit', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
              <small><LocateFixed size={14}/> GPS: <b>{Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}</b></small>
              <button type="button" onClick={captureDeviceGPS} style={{ background: 'none', border: '1px solid currentColor', borderRadius: 4, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>
                🔄 Refresh Device Location
              </button>
            </div>
          </section>

          {/* Photo Capture & Upload Box */}
          <div style={{ margin: '16px 0' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {!previewUrl ? (
              <button
                type="button"
                className="capture-image"
                style={{ width: '100%', cursor: 'pointer', border: '2px dashed #0ea5e9', borderRadius: '12px', padding: '32px 16px', background: 'rgba(14, 165, 233, 0.05)', textAlign: 'center' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={36} style={{ color: '#0ea5e9', marginBottom: '8px' }}/>
                <b style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>Click to Capture / Upload Geo-Coded Image</b>
                <small style={{ color: 'var(--text-muted, #94a3b8)' }}>Supports Camera & File Picker (JPEG, PNG, WEBP)</small>
              </button>
            ) : (
              <div style={{ background: 'var(--card-bg, #0f172a)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>✓ Field Photo Attached</span>
                  <button
                    type="button"
                    onClick={() => { setPreviewUrl(''); setPhotoFile(null); }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Remove & Retake
                  </button>
                </div>
                <div style={{ width: '100%', maxHeight: '300px', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                  <img src={previewUrl} alt="Field preview" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}/>
                </div>
                <small style={{ display: 'block', marginTop: '8px', color: '#64748b' }}>
                  File: {photoFile?.name} ({Math.round((photoFile?.size || 0) / 1024)} KB) · Geo-tagged to {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
                </small>
              </div>
            )}
          </div>

          {error && <p style={{ color: '#ef4444', fontWeight: 600, margin: '8px 0' }}>⚠️ {error}</p>}

          {/* Condition Evaluation Form */}
          <section className="field-form">
            <Select title="Water Status" value={water} values={['Good', 'Moderate', 'Poor', 'None']} onChange={setWater}/>
            <Select title="Structure Condition" value={condition} values={['Good', 'Moderate', 'Damaged', 'Critical']} onChange={setCondition}/>
            <Select title="Vegetation Cover" value={vegetation} values={['Good', 'Moderate', 'Poor']} onChange={setVegetation}/>
            <div className="field-duo">
              <Select title="Erosion Noted" value={erosion} values={['Yes', 'No']} onChange={setErosion}/>
              <Select title="Silt / Debris" value={debris} values={['Yes', 'No']} onChange={setDebris}/>
            </div>
            <label className="remarks-input">
              Remarks & Field Observations
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter field observation notes, structural checks, or catchment status..."
              ></textarea>
            </label>
          </section>

          <button type="submit" className="submit-observation" style={{ cursor: 'pointer' }}>
            <Check size={18}/> SUBMIT & GEOTAG OBSERVATION
          </button>
        </main>
      </form>

      {submittedRecord && (
        <SuccessModal
          record={submittedRecord}
          close={() => {
            setSubmittedRecord(null)
            setPreviewUrl('')
            setPhotoFile(null)
            setRemarks('')
          }}
          navigate={navigate}
        />
      )}
    </div>
  )
}

function SuccessModal({ record, close, navigate }: { record: StoredGeoEvidence; close: () => void; navigate: (view: View) => void }) {
  return (
    <div className="image-modal success-modal" onClick={close}>
      <article onClick={e => e.stopPropagation()}>
        <span className="success-check"><Check size={34}/></span>
        <span className="eyebrow">OBSERVATION SUBMITTED & GEOTAGGED</span>
        <h2>{record.assetId} · {record.village}</h2>
        <p>Geo-coded field image successfully recorded and added to the evidence registry.</p>
        <div className="success-meta">
          <span>GPS <b>{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</b></span>
          <span>Time <b>{record.date}</b></span>
          <span>Status <b>{record.status}</b></span>
        </div>
        <footer>
          <button type="button" onClick={() => { close(); navigate('evidence') }}>View in Evidence Gallery</button>
          <button type="button" onClick={() => { close(); navigate('gis') }}>View on GIS Map</button>
        </footer>
      </article>
    </div>
  )
}
function BeforeAfter() {
  const [position, setPosition] = useState(50)
  const [watershed, setWatershed] = useState('WS-001 · Kovilur')
  const [selectedAssetKey, setSelectedAssetKey] = useState<'whs-021' | 'whs-042'>('whs-021')

  const pairs = {
    'whs-021': {
      title: 'WHS-021 · Check Dam & Spillway Barrage',
      location: 'Kovilur · Kandhamal',
      before: '/before-dam.jpg',
      after: '/after-dam.jpg',
      beforeDate: 'June 2026 · Pre-Intervention',
      afterDate: 'September 2026 · Post-Monsoon Surge',
      gain: '+92% Water Volume Increase',
      summary: 'Positive structural intervention: check dam masonry barrier successfully created full upstream retention with continuous spillway discharge.',
      waterStatus: 'Good',
      structureStatus: 'Good',
      vegetationStatus: 'Healthy'
    },
    'whs-042': {
      title: 'WHS-042 · Farm Pond & Catchment Basin',
      location: 'Kovilur · East Sector',
      before: '/field-obs-1.jpg',
      after: '/field-obs-2.jpg',
      beforeDate: 'June 2026 · Pre-Rain',
      afterDate: 'September 2026 · Post-Rain Recovery',
      gain: '+38% Water Surface Expansion',
      summary: 'Catchment soil moisture improved by 28% following contour bunding and bund stabilization.',
      waterStatus: 'Moderate',
      structureStatus: 'Good',
      vegetationStatus: 'Moderate'
    }
  }

  const currentPair = pairs[selectedAssetKey]

  return (
    <div className="page content-page temporal-page">
      <section className="temporal-hero">
        <div>
          <span className="eyebrow">TEMPORAL WATERSHED ANALYSIS</span>
          <h1>See change.<br/><i>Understand impact.</i></h1>
          <p>Interactive slider comparing dated geo-coded evidence to verify structural development and seasonal water retention.</p>
        </div>
        <div className="temporal-selects">
          <label>
            Watershed
            <select value={watershed} onChange={e => setWatershed(e.target.value)}>
              <option>WS-001 · Kovilur</option>
              <option>WS-003 · Madurantakam</option>
            </select>
          </label>
          <label>
            Target Asset
            <select
              value={selectedAssetKey}
              onChange={e => setSelectedAssetKey(e.target.value as any)}
            >
              <option value="whs-021">WHS-021 · Check Dam &amp; Spillway</option>
              <option value="whs-042">WHS-042 · Farm Pond &amp; Catchment</option>
            </select>
          </label>
          <label>
            Comparison Range
            <select>
              <option>Jun 2026 → Sep 2026</option>
            </select>
          </label>
        </div>
      </section>

      {/* Interactive Split-Slider Stage */}
      <section className="comparison-stage">
        <div className="compare-label before">
          BEFORE <b>{currentPair.beforeDate}</b>
        </div>
        <div className="compare-label after">
          AFTER <b>{currentPair.afterDate}</b>
        </div>

        <div
          className="compare-before"
          style={{
            backgroundImage: `url('${currentPair.before}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div
          className="compare-after"
          style={{
            backgroundImage: `url('${currentPair.after}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: `inset(0 0 0 ${position}%)`
          }}
        ></div>

        <input
          aria-label="Comparison slider"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={e => setPosition(Number(e.target.value))}
        />
        <span className="comparison-handle" style={{ left: `${position}%` }}>
          <i>↔</i>
        </span>
      </section>

      {/* Analytical Findings Card */}
      <section className="comparison-results">
        <div>
          <span className="eyebrow">DEVELOPMENT OUTCOME &amp; IMPACT</span>
          <h2 style={{ color: '#10b981' }}>{currentPair.gain}</h2>
          <p>{currentPair.summary}</p>
        </div>

        <div className="temporal-indicators">
          <span>Water Presence <b>Pre → <i className="green-text">{currentPair.waterStatus}</i></b></span>
          <span>Vegetation <b>Pre → <i className="green-text">{currentPair.vegetationStatus}</i></b></span>
          <span>Structure <b>Pre → <i className="green-text">{currentPair.structureStatus}</i></b></span>
        </div>

        <div className="decline-signals">
          <span style={{ color: '#10b981' }}>↑ Water Capacity (+92%)</span>
          <span style={{ color: '#10b981' }}>↑ Structural Health</span>
          <span style={{ color: '#0ea5e9' }}>✓ Field Verified 11 Sep 2026</span>
        </div>
      </section>
    </div>
  )
}
function SpatialAnalytics() { const [loading, setLoading] = useState(true); const [active, setActive] = useState('Possible erosion'); const clusters: Record<string, [number, number][]> = { 'Possible erosion': [[12.955,79.977],[12.968,79.995],[12.987,79.982]], 'Visible deterioration': [[12.998,79.985],[12.968,80.003]], 'Declining water': [[12.981,79.959],[12.949,79.973]], 'Reduced vegetation': [[12.960,79.945],[12.976,79.999]] }; useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 1200); return () => window.clearTimeout(timer) }, []); const insights = [['Possible erosion','18 locations','red'],['Visible deterioration','12 assets','amber'],['Declining water','9 locations','blue'],['Reduced vegetation','7 areas','purple']]; return <div className="analytics-page">{loading ? <div className="analytics-loading"><span className="ripple-loader"><i></i><i></i><i></i></span><p>Processing spatial indicators...</p></div> : <><div className="analytics-map-head"><span className="eyebrow">SPATIAL INTELLIGENCE</span><h1>Watershed Intelligence</h1><p>Spatial indicators and temporal patterns for focused field attention.</p></div><MapContainer center={[12.975,79.975]} zoom={12} scrollWheelZoom className="analytics-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{Object.entries(clusters).flatMap(([name, points]) => points.map((point,i) => <CircleMarker key={`${name}-${i}`} center={point} radius={active === name ? 19 : 12} className={active === name ? 'analytics-active' : ''} pathOptions={{ color: name === 'Possible erosion' ? '#d9534f' : name === 'Visible deterioration' ? '#f4b942' : name === 'Declining water' ? '#168aad' : '#7667bf', fillColor: name === 'Possible erosion' ? '#d9534f' : name === 'Visible deterioration' ? '#f4b942' : name === 'Declining water' ? '#168aad' : '#7667bf', fillOpacity: active === name ? .55 : .28, weight: 2 }} eventHandlers={{ click: () => setActive(name) }}><Tooltip>{name} · priority cluster</Tooltip><Popup><div className="gov-popup"><b>{name}</b><small>Spatial indicator cluster</small><p>Prototype prioritization based on geo-coded images and spatial context.</p><footer><button>View evidence</button></footer></div></Popup></CircleMarker>))}</MapContainer><aside className="spatial-panel"><span className="eyebrow">SPATIAL INSIGHTS</span><h2>Priority patterns</h2>{insights.map(([name,count,tone]) => <button key={name} className={active === name ? 'active' : ''} onClick={() => setActive(name)}><span className={`spatial-dot ${tone}`}></span><div><b>{name}</b><small>{count}</small></div><ArrowRight size={15}/></button>)}<div className="analytics-layers"><b>Indicator layers</b>{['Problem Clusters','Low Water Zones','Vegetation Stress','Damaged Assets','Possible Erosion','Missing Observations'].map((layer,i) => <label key={layer}><input type="checkbox" defaultChecked={i < 4}/>{layer}</label>)}</div></aside><div className="analytics-story"><b>Geo-Coded Images</b><i></i><b>Spatial Indicators</b><i></i><b>Temporal Change</b><i></i><b>Problem Clusters</b><i></i><b>Priority Areas</b><small>Prototype analytical prioritization. Requires official verification.</small></div></>}</div> }
function GovernmentIndicator({ navigate }: { navigate: (view: View) => void }) { const parts = [['Water Status','25%'],['Vegetation','20%'],['Asset Condition','20%'],['Land Condition','20%'],['Field Evidence','15%']]; return <section className="government-indicator"><div className="indicator-ring"><b>82</b><small>/ 100</small><span>HEALTHY</span></div><div><span className="eyebrow">WS-001 · DEVELOPMENT INDICATOR</span><h2>Watershed health, made explainable.</h2><p>Supporting evidence and spatial context combine to guide focused attention.</p><div className="indicator-breakdown">{parts.map(([label,value]) => <span key={label}>{label}<b>{value}</b></span>)}</div><small className="indicator-disclaimer">Prototype analytical indicator — not an official government metric.</small></div><button className="text-btn" onClick={() => navigate('insights')}>View spatial context <ArrowRight size={15}/></button></section> }
function PriorityIntervention({ navigate }: { navigate: (view: View) => void }) { const [selected, setSelected] = useState('WHS-021'); const priorities: Record<string, { level:string; position:[number,number]; reasons:string[] }> = { 'WHS-021': { level:'HIGH',position:[12.997,79.985],reasons:['Low water presence','Visible deterioration','Recent negative change','Spatial problem concentration'] }, 'WHS-042': { level:'MEDIUM',position:[12.968,79.955],reasons:['Moderate water stress','Evidence older than 30 days'] }, 'WHS-087': { level:'LOW',position:[12.953,80.000],reasons:['Stable condition','Routine review suggested'] } }; const current = priorities[selected]; return <div className="priority-page"><div className="priority-map-head"><span className="eyebrow">PRIORITY INTERVENTION MAP</span><h1>Where attention<br/><i>can create impact.</i></h1><p>Evidence-led prototype prioritization for watershed action.</p></div><MapContainer center={[12.975,79.975]} zoom={12} scrollWheelZoom className="priority-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{Object.entries(priorities).map(([id,item]) => <CircleMarker key={id} center={item.position} radius={selected === id ? 19 : 13} className={item.level === 'HIGH' ? 'priority-pulse' : ''} pathOptions={{ color:item.level === 'HIGH' ? '#d9534f' : item.level === 'MEDIUM' ? '#f4b942' : '#2e8b57',fillColor:item.level === 'HIGH' ? '#d9534f' : item.level === 'MEDIUM' ? '#f4b942' : '#2e8b57',fillOpacity:.52,weight:2 }} eventHandlers={{ click:() => setSelected(id) }}><Tooltip>{id} · {item.level} priority</Tooltip></CircleMarker>)}</MapContainer><aside className="priority-detail"><span className={`priority-level ${current.level.toLowerCase()}`}>{current.level} PRIORITY</span><h2>{selected}</h2><small>WS-001 · Kovilur Watershed</small><div className="priority-reasons"><b>Reasons</b>{current.reasons.map(reason => <span key={reason}><AlertTriangle size={13}/>{reason}</span>)}</div><div className="priority-evidence"><b>Evidence</b><p>IMG-1024 · 11 Sep 2026<br/>Temporal change signal · Spatial cluster match</p></div><div className="recommended"><b>Recommended Action</b><span>Field verification</span></div><footer><button onClick={() => navigate('gis')}>View on Map</button><button onClick={() => navigate('evidence')}>View Evidence</button><button onClick={() => navigate('operations')}>Inspect</button></footer><p className="priority-disclaimer">Prototype analytical prioritization. Requires official verification.</p></aside><div className="priority-legend"><span><i className="high"></i>HIGH</span><span><i className="medium"></i>MEDIUM</span><span><i className="low"></i>LOW</span></div><div className="priority-logic">Image Observations <i>−</i> Asset Condition <i>−</i> Water Status <i>−</i> Vegetation <i>−</i> Historical Change <i>−</i> Spatial Concentration</div></div> }
function Reports({ navigate }: { navigate: (view: View) => void }) {
  const [generating, setGenerating] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const reports: [string, string, typeof Waves][] = [
    ['Monthly Watershed Report', 'Monthly health, evidence and progress summary', Waves],
    ['Spatial Risk Report', 'Spatial clusters and priority patterns', Map],
    ['Asset Condition Report', 'Condition signals across monitored assets', Building2],
    ['Field Observation Report', 'Submitted field evidence and verification queue', LocateFixed],
    ['AI Watershed Summary', 'Prototype AI-assisted narrative summary', Activity],
    ['Priority Intervention Report', 'Evidence-led priority action register', AlertTriangle],
  ]
  const generate = (name: string) => {
    setGenerating(name)
    window.setTimeout(() => { setGenerating(null); setPreview(name); setNotice('Report generated') }, 1050)
  }
  return <div className="page content-page reports government-reports">
    <section className="content-hero"><span className="eyebrow">DECISION SUPPORT</span><h1>Government reporting,<br/><i>made actionable.</i></h1><p>Generate evidence-led prototype reports for monitoring and field coordination.</p></section>
    <section className="report-grid">{reports.map(([title, text, Icon]) => <article key={title}>
      <span className="report-icon"><Icon/></span><small>GOVERNMENT REPORT</small><h3>{title}</h3><p>{text}</p>
      <div className="report-card-actions">
        <button className="text-btn" type="button" onClick={() => generate(title)}>{generating === title ? 'Generating…' : 'Generate'} <ArrowRight size={16}/></button>
        <button className="report-download-btn" type="button" onClick={() => downloadReportCsv(title, 'government')}><FileText size={15}/>Download CSV</button>
      </div>
    </article>)}</section>
    {generating && <div className="report-loading"><span className="ripple-loader"><i></i><i></i><i></i></span><p>Generating watershed report...</p></div>}
    {preview && <ReportPreview title={preview} close={() => setPreview(null)} navigate={navigate}/>}
    {notice && <div className="toast"><Check size={15}/>{notice}</div>}
  </div>
}
function ReportPreview({ title, close, navigate }: { title: string; close: () => void; navigate: (view: View) => void }) {
  return <div className="image-modal report-preview" onClick={close}><article onClick={e => e.stopPropagation()}>
    <button className="modal-close" onClick={close} aria-label="Close report preview"><X/></button>
    <span className="eyebrow">{title.toUpperCase()}</span><h2>WATERSHED DEVELOPMENT<br/>SUMMARY</h2><h3>WS-001 · Kovilur</h3>
    <div className="report-summary"><span>Monitored locations <b>126</b></span><span>Geo images <b>428</b></span><span>Potential erosion <b>18</b></span><span>Assets requiring verification <b>12</b></span><span>Declining water locations <b>9</b></span></div>
    <div className="report-priority"><b>Priority</b><span>WHS-021</span><span>WHS-034</span><span>WHS-087</span></div>
    {title === 'AI Watershed Summary' && <p className="ai-report-note">AI-generated summary based on available prototype data. Officials should verify findings before taking administrative action.</p>}
    <footer className="report-preview-actions">
      <button className="report-download-btn" type="button" onClick={() => downloadReportCsv(title, 'government')}><FileText size={15}/>Download CSV</button>
      <button className="report-download-btn" type="button" onClick={() => window.print()}><FileText size={15}/>Print / Save as PDF</button>
      <button type="button" onClick={() => navigate('gis')}>View on Map</button>
      <button type="button" onClick={close}>Close Preview</button>
    </footer>
  </article></div>
}

function Alerts({ navigate, openTarget }: { navigate: (view: View) => void; openTarget: (target: string) => void }) {
  const [tab, setTab] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const alerts = [
    { id: 'ALT-042', level: 'Critical', asset: 'WHS-042', text: 'WHS-042 shows visible structural deterioration.', target: 'WHS-042', color: 'critical', marker: '!' },
    { id: 'ALT-018', level: 'High', asset: 'WS-003', text: 'Possible erosion detected across multiple geo-coded observations.', target: 'WS-003', color: 'high', marker: '▲' },
    { id: 'ALT-031', level: 'Medium', asset: 'WHS-021', text: 'Water presence declined across recent observations.', target: 'WHS-021', color: 'medium', marker: '◆' },
    { id: 'ALT-076', level: 'Low', asset: 'WHS-087', text: 'Vegetation cover shows a minor change; continue routine monitoring.', target: 'WHS-087', color: 'low', marker: '↓' },
    { id: 'ALT-067', level: 'Info', asset: 'WS-001', text: 'No recent geo-coded observation is available for this watershed.', target: 'WS-001', color: 'information', marker: 'i' },
  ]
  const filters = [
    { label: 'All', tone: 'all' }, { label: 'Critical', tone: 'critical' },
    { label: 'High', tone: 'high' }, { label: 'Medium', tone: 'medium' },
    { label: 'Low', tone: 'low' }, { label: 'Info', tone: 'information' },
  ]
  const visible = tab === 'All' ? alerts : alerts.filter(alert => alert.level === tab)
  const current = alerts.find(alert => alert.id === selected)
  const map = () => {
    if (!current) return
    setSelected(null)
    openTarget(current.target)
    navigate('gis')
  }
  const review = () => {
    if (!current) return
    setReviewed(items => items.includes(current.id) ? items : [...items, current.id])
    setNotice(`${current.id} marked reviewed.`)
    setSelected(null)
  }

  return <div className="page content-page alerts-page">
    <section className="alerts-hero"><span className="eyebrow">RISK MONITORING</span><h1>Signals that need<br/><i>attention.</i></h1><p>Prioritized monitoring signals from field evidence, spatial context and temporal change.</p></section>
    <div className="alert-tabs" aria-label="Filter alerts by severity">{filters.map(({ label, tone }) => <button type="button" key={label} aria-pressed={tab === label} className={`severity-tab ${tone}${tab === label ? ' active' : ''}`} onClick={() => setTab(label)}>{label}</button>)}</div>
    <section className="alert-list" aria-label="Severity-coded alerts">{visible.map(alert => <article className={`alert-card ${alert.color}`} key={alert.id} role="button" tabIndex={0} aria-label={`${alert.level} alert ${alert.id}, ${alert.asset}: ${alert.text}`} onClick={() => setSelected(alert.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(alert.id) } }}>
      <span className={`alert-severity-symbol ${alert.color}`} aria-hidden="true">{alert.marker}</span>
      <span className={`alert-level ${alert.color}`}>{alert.level.toUpperCase()}</span>
      <div className="alert-copy"><small>{alert.id} · {alert.asset}</small><h3>{alert.text}</h3><p>{reviewed.includes(alert.id) ? 'Reviewed' : 'Latest spatial signal · 11 Sep 2026'}</p></div>
      <ArrowRight className="alert-open-icon" size={18}/>
    </article>)}</section>
    {selected && current && <aside className={`alert-drawer ${current.color}`}>
      <button className="drawer-close" onClick={() => setSelected(null)} aria-label="Close alert details"><X/></button>
      <span className={`alert-level ${current.color}`}>{current.level.toUpperCase()}</span><h2>{current.asset}</h2><p>{current.text}</p>
      <div className="alert-detail"><span>Location <b>{current.target}</b></span><span>Latest observation <b>11 Sep 2026</b></span><span>Evidence <b>3 geo-coded images</b></span></div>
      <footer><button onClick={() => navigate('evidence')}>View Evidence</button><button onClick={map}>View on Map</button><button onClick={review}>Mark Reviewed</button></footer>
    </aside>}
    {notice && <div className="toast"><Check size={15}/>{notice}</div>}
  </div>
}

function GovernmentDashboard({ navigate, openTarget }: { navigate: (view: View) => void; openTarget: (target: string) => void }) { const [drawer, setDrawer] = useState(false); const [notice, setNotice] = useState(''); const stats: [string, string, View, typeof Waves][] = [['Total Watersheds', '42', 'watersheds', Waves], ['Geo-Coded Images', '8,420', 'evidence', Camera], ['Watershed Assets', '1,250', 'assets', Building2], ['Field Observations', '3,684', 'observation', LocateFixed], ['Critical Zones', '18', 'priority', AlertTriangle]]; const openMap = (id: string) => { setDrawer(false); openTarget(id); navigate('gis') }; return <div className="page government-page"><section className="gov-welcome"><div><span className="eyebrow">WATER INTELLIGENCE</span><h1>Good morning, <i>District Officer.</i></h1><p>Monitor watershed development through geo-coded evidence and spatial intelligence.</p><button className="primary" onClick={() => navigate('gis')}>Open GIS Command Map <ArrowRight size={17}/></button></div><div className="gov-radar"><i></i><i></i><i></i><span className="radar-sweep"></span><b>42</b><small>Active watersheds</small></div></section><section className="gov-kpis">{stats.map(([label, value, view, Icon]) => <button key={label} className={label === 'Critical Zones' ? 'critical-kpi' : ''} onClick={() => label === 'Critical Zones' ? setDrawer(true) : (setNotice(`${label} selected`), navigate(view))}><span><Icon size={18}/></span><b>{value}</b><small>{label}</small><ArrowRight size={15}/></button>)}</section>{notice && <div className="toast"><Check size={15}/>{notice}</div>}<section className="gov-command-grid"><article className="command-map" onClick={() => navigate('gis')}><div className="contours"></div><span className="asset-dot a"></span><span className="asset-dot b"></span><span className="asset-dot c"></span><div><small>LIVE COMMAND VIEW</small><h3>18 priority zones<br/>across Kancheepuram</h3><button className="text-btn">Open geospatial intelligence <ArrowRight size={15}/></button></div></article><article className="gov-feed"><span className="eyebrow">EVIDENCE SIGNALS</span><h3>Geo-coded intelligence, where it matters</h3>{['WHS-021 shows poor water status', 'IMG-1024 matched to Kovilur asset', 'WS-001 health remains stable'].map((event, i) => <button key={event} onClick={() => navigate(i === 1 ? 'evidence' : 'gis')}><span className={'feed-dot f'+i}></span>{event}<ArrowRight size={14}/></button>)}</article></section><GovernmentIndicator navigate={navigate}/>{drawer && <aside className="critical-drawer"><button className="drawer-close" onClick={() => setDrawer(false)}><X/></button><span className="eyebrow">CRITICAL ZONES</span><h2>18 locations require attention.</h2><p>Prioritized by spatial risk, water condition and evidence recency.</p>{['WHS-021', 'WHS-042', 'WHS-087', 'WS-003'].map((id, i) => <div className="critical-row" key={id}><span className={'risk-dot r'+i}></span><div><b>{id}</b><small>{i === 0 ? 'Check Dam · High priority' : 'Watershed asset · Review zone'}</small></div><button onClick={() => openMap(id)}>View on Map <ArrowRight size={13}/></button></div>)}</aside>}</div> }
const coords: Record<string, [number, number]> = { 'WS-001': [12.979, 79.970], 'WHS-021': [12.997, 79.985], 'WHS-042': [12.961, 79.952], 'WHS-087': [12.978, 80.005], 'WS-003': [12.945, 79.994], 'IMG-1024': [12.970, 80.006], 'WB-014': [12.982, 79.958], 'Kovilur': [12.962, 79.940] }
function FlyToTarget({ target, clear }: { target: string | null; clear: () => void }) { const map = useMap(); useEffect(() => { if (target && coords[target]) { map.flyTo(coords[target], 15, { duration: 1.1 }); const timer = window.setTimeout(clear, 1400); return () => window.clearTimeout(timer) } }, [target, map, clear]); return null }
function GovMarker({ id, color, children, target, onClick, tooltip }: { id: string; color: string; children: React.ReactNode; target: string | null; onClick: () => void; tooltip: string }) { const marker = useRef<any>(null); useEffect(() => { if (target === id) window.setTimeout(() => marker.current?.openPopup(), 800) }, [target, id]); return <CircleMarker ref={marker} center={coords[id]} radius={target === id ? 14 : 10} pathOptions={{ color, fillColor: color, fillOpacity: .86, weight: target === id ? 5 : 2 }} eventHandlers={{ click: onClick }}><Tooltip direction="top" offset={[0, -9]}>{tooltip}</Tooltip><Popup>{children}</Popup></CircleMarker> }
function GovernmentGIS({ target, clearTarget, navigate }: { target: string | null; clearTarget: () => void; navigate: (view: View) => void }) {
  const [layers, setLayers] = useState({ watersheds: true, sub: true, water: true, assets: true, images: true, agriculture: true, villages: true, priority: true, risk: true })
  const [selected, setSelected] = useState<string | null>(target); const [search, setSearch] = useState(''); const [searchMessage, setSearchMessage] = useState('')
  const [showMapTitle, setShowMapTitle] = useState(true)
  const toggle = (key: keyof typeof layers) => setLayers(x => ({ ...x, [key]: !x[key] }))
  useEffect(() => setSelected(target), [target])
  const watershed = { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [[[79.919,12.946],[80.001,12.946],[80.024,12.990],[79.965,13.016],[79.913,12.982],[79.919,12.946]]] } }
  const compact = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const find = () => {
    const query = compact(search)
    if (!query) { setSearchMessage('Type an asset ID or place name.'); return }
    const aliases: Record<string, string> = { kovilurwatershed: 'WS-001', kancheepuram: 'WS-001', madurantakam: 'WS-003' }
    const keys = Object.keys(coords)
    const exact = keys.find(key => compact(key) === query)
    const match = exact ?? aliases[query]
    if (match && coords[match]) { setSelected(match); setSearch(match); setSearchMessage(`Showing ${match}`); return }
    const matches = keys.filter(key => compact(key).includes(query))
    if (matches.length === 1) { setSelected(matches[0]); setSearch(matches[0]); setSearchMessage(`Showing ${matches[0]}`); return }
    if (matches.length > 1) { setSearchMessage(`Multiple matches: ${matches.slice(0, 3).join(', ')}`); return }
    setSearchMessage('No match. Try WS-001, WHS-021 or Kovilur.')
  }
  const marker = (id: string, color: string, tooltip: string, content: React.ReactNode) => <GovMarker id={id} color={color} target={selected} onClick={() => setSelected(id)} tooltip={tooltip}>{content}</GovMarker>
  return <div className={`gov-gis ${showMapTitle ? '' : 'title-hidden'}`}>
    {showMapTitle ? <div className="gov-gis-head" role="button" tabIndex={0} aria-label="Hide GIS title panel" onClick={() => setShowMapTitle(false)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setShowMapTitle(false) } }}><span className="eyebrow">GEOSPATIAL INTELLIGENCE</span><h1>Government GIS Command Map</h1><p>Evidence, assets, risk and watershed context in one operational view.</p><span className="gov-gis-hide-hint">Click to hide <X size={12}/></span></div> : <button className="gov-gis-title-show" type="button" onClick={() => setShowMapTitle(true)}><Map size={15}/>Show GIS title</button>}
    <div className="gov-search" role="search"><Search size={16}/><input aria-label="Search by ID or location" value={search} onChange={e => { setSearch(e.target.value); setSearchMessage('') }} placeholder="Try Kovilur or WHS-021" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); find() } }}/><button type="button" onClick={find}>Search</button></div>
    {searchMessage && <div className={`gov-search-message ${searchMessage.startsWith('No match') || searchMessage.startsWith('Multiple matches') ? 'error' : ''}`} role="status">{searchMessage}</div>}
    <MapContainer center={coords['WS-001']} zoom={12} scrollWheelZoom className="gov-leaflet"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><FlyToTarget target={selected} clear={clearTarget}/><GovMapControls/>
      {layers.watersheds && <><GeoJSON data={watershed} style={{ color: '#0b5fa5', weight: 2, fillColor: '#2ec4c7', fillOpacity: .12 }}/>{marker('WS-001','#0b5fa5','WS-001 · Kovilur Watershed',<WatershedPopup navigate={navigate}/>)}</>}
      {layers.sub && <GeoJSON data={{ ...watershed, geometry: { ...watershed.geometry, coordinates: [[[79.945,12.96],[79.985,12.96],[79.997,12.982],[79.958,12.995],[79.945,12.96]]] } } as any} style={{ color: '#2e8b57', weight: 1, dashArray: '5 5', fillOpacity: 0 }}/>} 
      {layers.water && marker('WB-014','#168aad','WB-014 · Water Body',<WaterPopup navigate={navigate}/>)}
      {layers.assets && <>{marker('WHS-021','#d9534f','WHS-021 · Check Dam · High Priority',<AssetPopup navigate={navigate}/>)}{marker('WHS-042','#f4b942','WHS-042 · Farm Pond',<AssetPopup navigate={navigate}/>)}{marker('WHS-087','#f4b942','WHS-087 · Recharge Structure',<AssetPopup navigate={navigate}/>)}</>}
      {layers.images && marker('IMG-1024','#0b5fa5','IMG-1024 · Kovilur',<ImagePopup navigate={navigate}/>)}{layers.villages && marker('Kovilur','#2e8b57','Kovilur · Village',<VillagePopup navigate={navigate}/>)}
      {layers.priority && <CircleMarker center={coords['WS-003']} radius={18} pathOptions={{ color: '#f4b942', fillColor: '#f4b942', fillOpacity: .16, weight: 2, dashArray: '4 5' }}><Tooltip>Priority zone · Medium glow</Tooltip></CircleMarker>}{layers.risk && <CircleMarker center={[12.954,79.977]} radius={25} className="risk-pulse" pathOptions={{ color: '#d9534f', fillColor: '#d9534f', fillOpacity: .15, weight: 2 }}><Tooltip>High risk zone · Gentle pulse</Tooltip></CircleMarker>}
    </MapContainer>
    <div className="gov-layer-card"><b><Layers3 size={16}/> Map layers</b>{([['watersheds','Watersheds'],['water','Water Bodies'],['assets','Assets'],['images','Geo-Coded Images']] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={() => toggle(key)}/>{label}</label>)}<details className="gov-layer-advanced"><summary>More layers</summary>{([['sub','Sub-Watersheds'],['villages','Villages'],['priority','Priority Zones'],['risk','Risk Zones']] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={() => toggle(key)}/>{label}</label>)}</details></div><div className="gov-legend"><b>Legend</b><span><i className="legend-water"></i>Water body</span><span><i className="legend-asset"></i>Asset</span><span><i className="legend-priority"></i>Priority</span><span><i className="legend-risk"></i>Risk</span></div>
  </div>
}
function GovMapControls() { const map = useMap(); return <div className="gov-map-tools" role="group" aria-label="Map controls"><button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => map.zoomIn()}>+</button><button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => map.zoomOut()}>−</button><button type="button" title="Reset map view" aria-label="Reset map view" onClick={() => map.flyTo(coords['WS-001'], 12, { duration: .65 })}><LocateFixed size={16}/></button></div> }
function WatershedPopup({ navigate }: { navigate: (view: View) => void }) { return <div className="gov-popup"><b>🌊 Kovilur Watershed</b><small>WS-001 · Kancheepuram</small><div><span>Area <b>2,450 ha</b></span><span>Assets <b>84</b></span><span>Geo Images <b>428</b></span><span>Development <b>82 / 100</b></span></div><p>Status: <strong>Healthy</strong></p><footer><button onClick={() => navigate('watersheds')}>Explore</button><button onClick={() => navigate('insights')}>View Analytics</button></footer></div> }
function AssetPopup({ navigate }: { navigate: (view: View) => void }) { return <div className="gov-popup"><b>🏗️ CHECK DAM</b><small>WHS-021 · Kovilur</small><p>Condition: <strong className="amber-text">Moderate 🟡</strong><br/>Water Status: <strong className="red-text">Poor 🔴</strong><br/>Last Visit: <b>11 Sep 2026</b><br/>Risk: <strong className="red-text">HIGH</strong></p><footer><button onClick={() => navigate('assets')}>View Asset</button><button onClick={() => navigate('evidence')}>Evidence</button><button onClick={() => navigate('operations')}>Inspect</button></footer></div> }
function ImagePopup({ navigate }: { navigate: (view: View) => void }) { return <div className="gov-popup"><b>📸 GEO-CODED IMAGE</b><small>IMG-1024 · 📍 Kovilur</small><p>12.970000, 80.006000<br/>📅 11 Sep 2026<br/>Asset: <b>WHS-021</b><br/>Water: <strong className="red-text">Poor</strong><br/>Condition: <strong className="amber-text">Moderate</strong></p><footer><button onClick={() => navigate('evidence')}>View Image</button><button onClick={() => navigate('insights')}>Analyze</button><button onClick={() => navigate('before-after')}>Compare</button></footer></div> }
function WaterPopup({ navigate }: { navigate: (view: View) => void }) { return <div className="gov-popup"><b>💧 WATER BODY</b><small>WB-014 · Kovilur</small><p>Water Status: <strong className="amber-text">Moderate</strong><br/>Last Observation: <b>11 Sep 2026</b><br/>Historical Trend: <b>Good → Moderate</b></p><footer><button onClick={() => navigate('insights')}>View Details</button></footer></div> }
function VillagePopup({ navigate }: { navigate: (view: View) => void }) { return <div className="gov-popup"><b>🏘️ KOVILUR</b><small>Watershed: WS-001</small><p>Assets: <b>24</b><br/>Public Images: <b>86</b><br/>Agricultural Area: <b>145 ha</b></p><footer><button onClick={() => navigate('watersheds')}>Explore Village</button></footer></div> }

function PublicDashboard({ navigate }: { navigate: (view: View) => void }) { const stats: [string, string, View, typeof Waves][] = [['Watersheds Monitored','42','watersheds',Waves],['Watershed Assets','1,250','assets',Building2],['Geo-Coded Images','8,420','evidence',Camera],['Development Areas','126','insights',Leaf]]; return <div className="page public-page"><section className="public-hero"><span className="eyebrow">PUBLIC WATERSHED PORTAL</span><h1>Explore Watershed<br/><i>Development.</i></h1><p>Discover watershed conditions, spatial information and development progress.</p><button className="primary" onClick={() => navigate('gis')}>Open Watershed Explorer <ArrowRight size={17}/></button><div className="public-wave"></div></section><section className="public-kpis">{stats.map(([label,value,view,Icon]) => <button key={label} onClick={() => navigate(view)}><span><Icon size={18}/></span><b>{value}</b><small>{label}</small><ArrowRight size={16}/></button>)}</section></div> }

function PublicGIS({ navigate }: { navigate: (view: View) => void }) { const [layers, setLayers] = useState({ watersheds: true, water: true, assets: true, agriculture: true, villages: true, images: true }); const toggle = (key: keyof typeof layers) => setLayers(x => ({ ...x, [key]: !x[key] })); const watershed = { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [[[79.919, 12.946], [80.001, 12.946], [80.024, 12.990], [79.965, 13.016], [79.913, 12.982], [79.919, 12.946]]] } }; return <div className="public-gis"><div className="public-gis-head"><span className="eyebrow">WATERSHED EXPLORER</span><h1>Explore public spatial information</h1><p>Tap a map feature to discover its public development story.</p></div><div className="leaflet-wrap"><MapContainer center={[12.979, 79.970]} zoom={12} scrollWheelZoom className="public-leaflet"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{layers.watersheds && <GeoJSON data={watershed} style={{ color: '#0b5fa5', weight: 2, fillColor: '#2ec4c7', fillOpacity: .18 }}><Popup><PublicWatershedPopup navigate={navigate}/></Popup></GeoJSON>}{layers.water && <CircleMarker center={[12.979, 79.96]} radius={13} pathOptions={{ color: '#168aad', fillColor: '#74d9e8', fillOpacity: .8 }}><Popup><b>🌊 Kovilur Water Body</b><br/><small>Public water resource summary</small></Popup></CircleMarker>}{layers.assets && <CircleMarker center={[12.997, 79.985]} radius={10} pathOptions={{ color: '#f4b942', fillColor: '#f4b942', fillOpacity: .9 }}><Popup><PublicAssetPopup navigate={navigate}/></Popup></CircleMarker>}{layers.villages && <CircleMarker center={[12.962, 79.94]} radius={7} pathOptions={{ color: '#2e8b57', fillColor: '#2e8b57' }}><Popup><b>Kovilur Village</b><br/><small>Public village context</small></Popup></CircleMarker>}{layers.images && <CircleMarker center={[12.97, 80.006]} radius={7} pathOptions={{ color: '#0b5fa5', fillColor: '#fff' }}><Popup><b>IMG-1024</b><br/><small>Public geo-coded image</small></Popup></CircleMarker>}</MapContainer><div className="public-layer-card"><b><Layers3 size={16}/> Public layers</b>{([['watersheds','Watersheds'], ['water','Water Bodies'], ['assets','Public Assets'], ['agriculture','Agriculture'], ['villages','Villages'], ['images','Public Geo-Coded Images']] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={() => toggle(key)}/>{label}</label>)}</div><div className="public-map-note"><LocateFixed size={16}/> Read-only public spatial information</div></div></div> }
function PublicWatershedPopup({ navigate }: { navigate: (view: View) => void }) { return <div className="public-popup"><b>🌊 Kovilur Watershed</b><small>WS-001 · Kancheepuram</small><div><span>Area <b>2,450 ha</b></span><span>Assets <b>84</b></span><span>Geo Images <b>428</b></span><span>Development <b>82 / 100</b></span></div><p>Status: <strong>Healthy</strong></p><footer><button onClick={() => navigate('watersheds')}>Explore</button><button onClick={() => navigate('insights')}>View Analytics</button></footer></div> }
function PublicAssetPopup({ navigate }: { navigate: (view: View) => void }) { return <div className="public-popup"><b>WHS-021</b><small>CHECK DAM · Kovilur</small><p>Condition: <strong>Moderate</strong><br/>Water: <strong>Poor</strong></p><footer><button onClick={() => navigate('assets')}>View Asset</button><button onClick={() => navigate('evidence')}>View Public Evidence</button></footer></div> }
function PublicEvidence() {
  const [selected, setSelected] = useState<string | null>(null)
  const [customImages, setCustomImages] = useState<StoredGeoEvidence[]>(loadStoredGeoEvidence)
  const defaultImages = [
    { id: 'IMG-1024', place: 'Madurantakam', date: '11 Sep 2026', asset: 'WHS-021 · Check Dam', imgClass: 'img-0', water: 'Poor', condition: 'Moderate' },
    { id: 'IMG-1025', place: 'Kovilur', date: '08 Sep 2026', asset: 'WHS-028 · Farm Pond', imgClass: 'img-1', water: 'Moderate', condition: 'Good' }
  ]

  const currentSelectedCustom = customImages.find(x => x.id === selected)

  return (
    <div className="page content-page public-evidence">
      <section className="content-hero">
        <span className="eyebrow">PUBLIC GEO-CODED IMAGES</span>
        <h1>See development<br/><i>on the ground.</i></h1>
        <p>Approved images are shared to make watershed development easy to understand.</p>
      </section>

      <div className="evidence-grid">
        {/* Render uploaded images in public view */}
        {customImages.map((img) => (
          <article className="evidence-card" key={img.id}>
            <div
              className="evidence-img"
              style={{
                backgroundImage: img.previewUrl ? `url(${img.previewUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '160px',
                position: 'relative',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setSelected(img.id)}
            >
              <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 4, color: '#fff', fontSize: 11 }}>
                <Camera size={12}/> {img.id}
              </span>
              <i style={{ position: 'absolute', top: 8, right: 8 }}><Search size={16}/></i>
            </div>
            <div>
              <small>{img.id}</small>
              <h3>{img.village}</h3>
              <p>{img.date} · {img.assetId}</p>
              <div className="public-image-stats">
                <span>Water <b>{img.water}</b></span>
                <span>Condition <b>{img.condition}</b></span>
              </div>
              <footer>
                <button type="button" onClick={() => setSelected(img.id)}>View</button>
                <button type="button" onClick={() => setSelected(img.id)}>Details</button>
              </footer>
            </div>
          </article>
        ))}

        {defaultImages.map((img) => (
          <article className="evidence-card" key={img.id}>
            <button type="button" className={'evidence-img ' + img.imgClass} onClick={() => setSelected(img.id)}>
              <span><Camera size={16}/> Public image</span>
              <i><Search size={17}/></i>
            </button>
            <div>
              <small>{img.id}</small>
              <h3>{img.place}</h3>
              <p>{img.date} · {img.asset}</p>
              <div className="public-image-stats">
                <span>Water <b>{img.water}</b></span>
                <span>Condition <b>{img.condition}</b></span>
              </div>
              <footer>
                <button type="button" onClick={() => setSelected(img.id)}>View</button>
                <button type="button" onClick={() => setSelected(img.id)}>View Location</button>
              </footer>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <ImageModal
          id={selected}
          customImg={currentSelectedCustom}
          close={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function ImageModal({ id, customImg, close }: { id: string; customImg?: StoredGeoEvidence; close: () => void }) {
  return (
    <div className="image-modal" onClick={close}>
      <article onClick={e => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close}><X/></button>
        {customImg?.previewUrl ? (
          <div style={{ width: '100%', maxHeight: '280px', overflow: 'hidden', borderRadius: '10px', marginBottom: '14px' }}>
            <img src={customImg.previewUrl} alt={id} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}/>
          </div>
        ) : (
          <div className="modal-image img-1"></div>
        )}
        <span className="eyebrow">PUBLIC GEO-CODED IMAGE</span>
        <h2>{id} · {customImg?.village || (id === 'IMG-1024' ? 'Madurantakam' : 'Kovilur')}</h2>
        <p>{customImg?.date || '11 Sep 2026'} · {customImg ? `${customImg.assetId} (${customImg.assetType})` : 'WHS-021 · Check Dam'}</p>
        <div className="public-image-stats">
          <span>Water <b>{customImg?.water || 'Poor'}</b></span>
          <span>Condition <b>{customImg?.condition || 'Moderate'}</b></span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Publicly Approved</span>
        </div>
        <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted, #94a3b8)' }}>
          {customImg?.remarks || 'Publicly verified watershed infrastructure evidence with synchronized GPS verification.'}
        </p>
        <button type="button" className="primary" onClick={close}>Close viewer</button>
      </article>
    </div>
  )
}
function PublicInsights() { const [detail, setDetail] = useState<string | null>(null); const indicators = [['Watershed Health', 'Healthy'], ['Water Availability', 'Moderate'], ['Vegetation', 'Good'], ['Development Assets', 'Stable']]; return <div className="page content-page public-insights"><section className="content-hero"><span className="eyebrow">DEVELOPMENT INSIGHTS</span><h1>Progress made<br/><i>visible.</i></h1><p>Public indicators make watershed development understandable at a glance.</p></section><section className="insight-public-card"><div><span className="eyebrow">WS-001 · KOVILUR</span><h2>Watershed Status: <i>Healthy</i></h2><p>Prototype indicator for demonstration purposes.</p><small className="indicator-disclaimer">Prototype analytical indicator — not an official government metric.</small></div><b className="large-indicator">82 <small>/ 100</small></b></section><section className="indicator-grid">{indicators.map(([label, value], i) => <button key={label} onClick={() => setDetail(label)}><span className={'indicator-icon p'+i}>{i === 0 ? <Waves/> : i === 1 ? <CloudRain/> : i === 2 ? <Leaf/> : <Building2/>}</span><small>{label}</small><b>{value}</b><ArrowRight size={16}/></button>)}</section><div className="historical"><div><span className="eyebrow">HISTORICAL CHANGE</span><h2>Steady development, healthier watershed</h2></div><button className="history-bars" onClick={() => setDetail('September 2026')} aria-label="View September indicator detail"><i></i><i></i><i></i><i></i><i></i></button></div>{detail && <div className="image-modal public-detail-modal" onClick={() => setDetail(null)}><article onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setDetail(null)}><X/></button><span className="eyebrow">PUBLIC DEVELOPMENT DETAIL</span><h2>{detail}</h2><p>{detail === 'September 2026' ? '128 public observations. Water availability is 42% and vegetation is 58% in this prototype snapshot.' : `${detail} is currently shown as ${indicators.find(item => item[0] === detail)?.[1]} for WS-001.`}</p><button className="primary" onClick={() => setDetail(null)}>Close detail</button></article></div>}</div> }
function PublicReports() {
  const [notice, setNotice] = useState('')
  const reports = [
    ['Watershed Development Overview', 'A public view of development progress across monitored watersheds.', Waves],
    ['Public Watershed Status', 'Watershed condition and public indicators for communities.', Map],
    ['Water Resource Summary', 'Publicly shared information about water resources and availability.', CloudRain],
  ] as const
  return <div className="page content-page reports public-reports">
    <section className="content-hero"><span className="eyebrow">PUBLIC REPORTS</span><h1>Information for<br/><i>every community.</i></h1><p>Only publicly approved watershed information is available here.</p></section>
    <section className="report-grid">{reports.map(([title, text, Icon]) => <article key={title}>
      <span className="report-icon"><Icon/></span><small>PUBLIC INFORMATION</small><h3>{title}</h3><p>{text}</p>
      <div className="report-card-actions">
        <button className="text-btn" type="button" onClick={() => setNotice(`${title} opened for public viewing.`)}>View public report <ArrowRight size={16}/></button>
        <button className="report-download-btn" type="button" onClick={() => downloadReportCsv(title, 'public')}><FileText size={15}/>Download CSV</button>
      </div>
    </article>)}</section>
    {notice && <div className="toast"><Check size={15}/>{notice}</div>}
  </div>
}

function LoginPage() {
  const { login } = useAuth(); const [role, setRole] = useState<Role>('public'); const [governmentRole, setGovernmentRole] = useState<GovernmentRole>('district_officer')
  const enter = (selected: Role) => { login(selected, governmentRole); window.history.replaceState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')) }
  return <main className={role === 'government' ? 'login government-login' : 'login'}>
    <section className="login-visual">
      <div className="login-globe-backdrop" aria-hidden="true">
        <Globe
          speed={1.4}
          scale={8.5}
          smoothing={8}
          fill="dots"
          dots={{ color: '#38d9d9', size: 4.5, density: 8, allDots: false }}
          oceanColor="rgba(7, 26, 43, 0.45)"
          outlineColor="rgba(56, 217, 217, 0.35)"
          showOutline={true}
          showGrid={true}
          graticuleColor="rgba(56, 217, 217, 0.16)"
          markerConfig={{
            markers: [
              { lat: 20.9517, lng: 85.0985 },
              { lat: 12.9716, lng: 79.9800 },
              { lat: 28.6139, lng: 77.2090 },
              { lat: 19.0760, lng: 72.8777 },
            ],
            color: '#00f7ff',
            size: 45,
          }}
        />
      </div>
      <div className="login-map-grid"></div>
      <div className="login-river r-one"></div>
      <div className="login-river r-two"></div>
      <div className="login-contours"></div>
      <div className="login-brand">
        <Logo />
        <h1>Geospatial Watershed<br /><i>Intelligence</i></h1>
        <p>Monitoring &amp; Decision Support Platform</p>
      </div>
    </section>
    <section className="login-panel"><div className="login-inner"><span className="eyebrow">{role === 'government' ? 'SECURE GOVERNMENT ACCESS' : 'WELCOME TO JAL-IMPACT'}</span><h2>Choose your portal</h2><p className="login-lead">Select how you want to experience watershed intelligence.</p><div className="role-cards"><button className={role === 'public' ? 'login-role selected' : 'login-role'} onClick={() => setRole('public')}><span className="role-icon">👤</span><div><b>PUBLIC USER</b><small>Explore watershed data and development insights</small></div><Check size={17}/></button><button className={role === 'government' ? 'login-role selected government' : 'login-role'} onClick={() => setRole('government')}><span className="role-icon">🏛️</span><div><b>GOVERNMENT USER</b><small>Monitor, inspect and manage watershed assets</small></div><Check size={17}/></button></div><div className="login-form"><div className="form-title"><b>{role === 'government' ? 'Government User Login' : 'Public User'}</b><span>Demo credentials for prototype presentation.</span></div><label>{role === 'government' ? 'Official Email' : 'Email / Mobile Number'}<input defaultValue={role === 'government' ? 'officer@jalimpact.gov.demo' : 'public@jalimpact.demo'} /></label><label>Password<input type="password" defaultValue="demo123" /></label>{role === 'government' && <label>Government role<select value={governmentRole} onChange={e => setGovernmentRole(e.target.value as GovernmentRole)}><option value="administrator">Administrator</option><option value="district_officer">District Officer</option><option value="field_officer">Field Officer</option></select></label>}<button className="login-submit" onClick={() => enter(role)}>{role === 'government' ? <><LockKeyhole size={17}/> Secure Government Login</> : <>Login <ArrowRight size={17}/></>}</button>{role === 'public' && <button className="guest" onClick={() => enter('public')}>Continue as Guest</button>}{role === 'government' && <div className="security-note"><LockKeyhole size={17}/><span><b>Authorized Government Access</b>Restricted monitoring and field-operation features are available only to authorized personnel.</span></div>}</div><div className="demo-actions"><button onClick={() => enter('public')}>Try Public Demo</button><button onClick={() => enter('government')}>Try Government Demo</button></div></div></section>
  </main>
}
function RestrictedPortal() { const { logout } = useAuth(); const returnPublic = () => { window.history.replaceState({}, '', '/'); logout() }; return <main className="restricted-page"><div className="restricted-card"><span className="lock-orb"><LockKeyhole size={32}/></span><span className="eyebrow">🔒 RESTRICTED ACCESS</span><h1>Government feature<br/>protected.</h1><p>This feature is available only to authorized government users.</p><div className="restricted-feature"><ShieldCheck size={18}/><div><small>FEATURE</small><b>Field Inspection</b></div></div><button className="primary" onClick={returnPublic}>Return to Public Portal <ArrowRight size={17}/></button></div></main> }
function ModulePlaceholder({ view, role }: { view: View; role: Role }) { const labels: Partial<Record<View, string>> = { watersheds: 'Watershed Explorer', assets: 'Watershed Assets', observation: 'Field Observation', 'before-after': 'Before / After', priority: 'Priority Intervention', alerts: 'Risk Monitoring' }; const label = labels[view] || 'Inspections'; return <div className="page content-page module-placeholder"><span className="eyebrow">{role === 'government' ? 'GOVERNMENT COMMAND CENTER' : 'PUBLIC WATERSHED PORTAL'}</span><h1>{label}<br/><i>spatially understood.</i></h1><p>This prototype route is ready for its dedicated data and interaction layer.</p><div className="placeholder-orbit"><Map/><Waves/><LocateFixed/></div></div> }
export default App

type HeaderToolsProps = {
  role: Role
  governmentRole: GovernmentRole | null
  visibleNav: typeof nav
  navigate: (view: View) => void
  openTarget: (target: string) => void
  logout: () => void
}

function HeaderTools({ role, governmentRole, visibleNav, navigate, openTarget, logout }: HeaderToolsProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState<string[]>([])
  const toolsRef = useRef<HTMLDivElement | null>(null)

  const recentNotifications = role === 'government' ? [
    { id: 'ALT-042', level: 'Critical', asset: 'WHS-042', text: 'Visible structural deterioration needs review.' },
    { id: 'ALT-018', level: 'High', asset: 'WS-003', text: 'Possible erosion detected in field evidence.' },
    { id: 'ALT-031', level: 'Medium', asset: 'WHS-021', text: 'Water presence declined across recent observations.' },
  ] : [
    { id: 'PUB-014', level: 'Update', asset: 'Watershed evidence', text: 'New geo-coded observations are available to explore.' },
    { id: 'PUB-008', level: 'Update', asset: 'Kandhamal district', text: 'Monitoring coverage was refreshed.' },
  ]
  const unreadCount = recentNotifications.filter(item => !readNotifications.includes(item.id)).length
  const query = searchQuery.trim().toLowerCase()
  const pageResults = visibleNav.filter(item => !query || `${item.label} ${item.id}`.toLowerCase().includes(query)).slice(0, 7)
  const searchableAssets = role === 'government' ? [
    { id: 'WHS-042', label: 'WHS-042 · Structural review', detail: 'Critical watershed asset', keywords: 'critical deterioration alert', icon: AlertTriangle },
    { id: 'WHS-021', label: 'WHS-021 · Water status', detail: 'Declining water presence', keywords: 'water decline medium', icon: Map },
    { id: 'WS-003', label: 'WS-003 · Erosion signal', detail: 'Geo-coded field evidence', keywords: 'erosion high evidence', icon: Camera },
    { id: 'WS-001', label: 'WS-001 · Kovilur', detail: 'Watershed monitoring area', keywords: 'kovilur watershed', icon: Map },
  ] : []
  const assetResults = searchableAssets.filter(item => !query || `${item.id} ${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(query)).slice(0, 5)
  const roleLabel = role === 'government'
    ? ({ administrator: 'Administrator', district_officer: 'District Officer', field_officer: 'Field Officer' } as const)[governmentRole || 'district_officer']
    : 'Public portal user'

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !toolsRef.current?.contains(event.target)) {
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(open => !open)
        setSearchQuery('')
        setNotificationsOpen(false)
        setProfileOpen(false)
      } else if (event.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const selectPage = (id: View) => {
    navigate(id)
    setSearchOpen(false)
    setSearchQuery('')
  }
  const selectAsset = (id: string) => {
    openTarget(id)
    navigate('gis')
    setSearchOpen(false)
    setSearchQuery('')
  }
  const markAllRead = () => setReadNotifications(recentNotifications.map(item => item.id))

  return <div className="tools" ref={toolsRef}>
    <div className="header-control search-control">
      <button type="button" className="header-search-trigger" aria-label="Search pages and watershed assets" onClick={() => { setSearchOpen(true); setSearchQuery(''); setNotificationsOpen(false); setProfileOpen(false) }}>
        <Search size={17}/><span className="search-trigger-label">Search pages, assets…</span><kbd className="search-trigger-shortcut">Ctrl K</kbd>
      </button>
    </div>
    <div className="header-control">
      <button type="button" className="header-action notification-trigger" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={notificationsOpen} aria-haspopup="dialog" onClick={() => { setNotificationsOpen(open => !open); setProfileOpen(false) }}>
        <Bell size={18}/>{unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>
      {notificationsOpen && <div className="header-popover notification-popover" role="dialog" aria-label="Notifications">
        <div className="popover-heading"><div><b>Notifications</b><small>{unreadCount ? `${unreadCount} unread updates` : 'You are all caught up'}</small></div>{unreadCount > 0 && <button type="button" className="popover-text-action" onClick={markAllRead}>Mark all read</button>}</div>
        <div className="notification-list">{recentNotifications.map(item => {
          const isRead = readNotifications.includes(item.id)
          return <button type="button" className={`notification-item ${isRead ? 'read' : 'unread'}`} key={item.id} onClick={() => {
            setReadNotifications(current => current.includes(item.id) ? current : [...current, item.id])
            setNotificationsOpen(false)
            navigate(role === 'government' ? 'alerts' : 'evidence')
          }}>
            <span className={`notification-symbol ${item.level.toLowerCase()}`}><Bell size={15}/></span>
            <span className="notification-copy"><b>{item.asset} <i>· {item.level}</i></b><small>{item.text}</small><small className="notification-id">{item.id} · recent</small></span>
            {!isRead && <span className="unread-indicator" aria-label="Unread"/>}
          </button>
        })}</div>
        <button type="button" className="popover-footer" onClick={() => { setNotificationsOpen(false); navigate(role === 'government' ? 'alerts' : 'evidence') }}>{role === 'government' ? 'Open all alerts' : 'Explore recent evidence'} <ArrowRight size={15}/></button>
      </div>}
    </div>
    <div className="header-control profile-control">
      <button type="button" className="profile-trigger" aria-label={`Profile menu, ${roleLabel}`} aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => { setProfileOpen(open => !open); setNotificationsOpen(false) }}>
        <span className="avatar" aria-hidden="true">RK</span><span className="profile-name">{roleLabel}</span><ChevronDown size={14}/>
      </button>
      {profileOpen && <div className="header-popover profile-popover" role="menu" aria-label="Profile menu">
        <div className="profile-summary"><span className="avatar profile-avatar" aria-hidden="true">RK</span><span><b>{roleLabel}</b><small>{role === 'government' ? 'National watershed workspace' : 'Public access workspace'}</small></span></div>
        <div className="profile-meta"><span>Access</span><b>{role === 'government' ? 'Verified government mode' : 'Public portal'}</b></div>
        <button type="button" role="menuitem" className="profile-menu-action" onClick={() => { setProfileOpen(false); navigate('overview') }}><Map size={16}/> Go to dashboard</button>
        <button type="button" role="menuitem" className="profile-menu-action signout-action" onClick={() => { setProfileOpen(false); logout() }}><LogOut size={16}/> Sign out</button>
      </div>}
    </div>
    {searchOpen && <div className="search-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) { setSearchOpen(false); setSearchQuery('') } }}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search pages and watershed assets" onKeyDown={event => {
        if (event.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
        if (event.key === 'Enter') {
          if (pageResults[0]) selectPage(pageResults[0].id)
          else if (assetResults[0]) selectAsset(assetResults[0].id)
        }
      }}>
        <div className="search-dialog-field"><Search size={19}/><input autoFocus type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search pages, watersheds, or asset IDs…" aria-label="Search pages, watersheds, or asset IDs"/><kbd>ESC</kbd><button type="button" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearchQuery('') }}><X size={18}/></button></div>
        <div className="search-results">
          {pageResults.length > 0 && <div className="search-result-group"><span className="search-group-label">Pages & tools</span>{pageResults.map(item => { const Icon = item.icon; return <button type="button" className="search-result" key={item.id} onClick={() => selectPage(item.id)}><Icon size={17}/><span><b>{item.label}</b><small>Open page</small></span><ArrowRight size={15}/></button> })}</div>}
          {assetResults.length > 0 && <div className="search-result-group"><span className="search-group-label">Watershed assets</span>{assetResults.map(item => { const Icon = item.icon; return <button type="button" className="search-result" key={item.id} onClick={() => selectAsset(item.id)}><Icon size={17}/><span><b>{item.label}</b><small>{item.detail}</small></span><ArrowRight size={15}/></button> })}</div>}
          {pageResults.length === 0 && assetResults.length === 0 && <p className="search-empty">No matching page or watershed asset. Try a module name or asset ID.</p>}
        </div>
        <div className="search-dialog-footer"><span><kbd>ENTER</kbd> open first result</span><span><kbd>CTRL</kbd> + <kbd>K</kbd> toggle search</span></div>
      </section>
    </div>}
  </div>
}


type ReportAudience = 'government' | 'public'
function downloadReportCsv(title: string, audience: ReportAudience = 'government') {
  const commonRows: [string, string][] = [
    ['Report', title],
    ['Audience', audience === 'government' ? 'Government workspace' : 'Public portal'],
    ['Generated at', new Date().toLocaleString()],
    ['Monitoring area', 'Odisha · Kandhamal'],
    ['Watershed', 'WS-001 · Kovilur'],
  ]
  const dataRows: [string, string][] = audience === 'government' ? [
    ['Monitored locations', '126'],
    ['Geo-coded images', '428'],
    ['Potential erosion locations', '18'],
    ['Assets requiring verification', '12'],
    ['Declining water locations', '9'],
    ['Priority assets', 'WHS-021; WHS-034; WHS-087'],
  ] : [
    ['Watersheds monitored', '42'],
    ['Watershed assets', '1250'],
    ['Geo-coded images', '8420'],
    ['Development areas', '126'],
    ['Water availability', '42%'],
    ['Vegetation indicator', '58%'],
  ]
  const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
  const csv = [...commonRows, ...dataRows, ['Data note', 'Prototype sample data; verify before official use.']]
    .map(([field, value]) => `${escapeCsv(field)},${escapeCsv(value)}`)
    .join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'watershed-report'
  link.href = url
  link.download = `${slug}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
