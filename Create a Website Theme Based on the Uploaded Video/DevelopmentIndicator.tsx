import type { CSSProperties } from 'react'
import { ArrowRight, Camera, Droplets, Leaf, Map, MapPinned, ShieldCheck, Waves } from 'lucide-react'

type Role = 'public' | 'government'
type Navigate = (view: 'gis' | 'insights' | 'evidence' | 'watersheds') => void

const score = 82
const factors = [
  { label: 'Water Status', weight: 25, score: 72, status: 'Moderate', points: '18.0 / 25', source: 'IMG-1024 · 11 Sep 2026' },
  { label: 'Vegetation', weight: 20, score: 85, status: 'Good', points: '17.0 / 20', source: 'Sample imagery trend · Sep 2026' },
  { label: 'Asset Condition', weight: 20, score: 80, status: 'Stable', points: '16.0 / 20', source: 'WHS-021 · sample condition record' },
  { label: 'Land Condition', weight: 20, score: 85, status: 'Good', points: '17.0 / 20', source: 'WS-001 · sample land layer' },
  { label: 'Field Evidence', weight: 15, score: 93, status: 'Current', points: '14.0 / 15', source: '3 recent prototype observations' },
]

function scoreStyle(): CSSProperties {
  return { '--indicator-score': `${score}%` } as CSSProperties
}

function ScoreRing({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'development-score-ring compact' : 'development-score-ring'} style={scoreStyle()} role="img" aria-label="Development indicator score 82 out of 100, healthy">
    <span>{score}</span><small>/ 100</small><b>HEALTHY</b>
  </div>
}

export function DevelopmentIndicator({ role, navigate }: { role: Role; navigate: Navigate }) {
  if (role === 'public') return <main className="page content-page development-indicator-page public-development-indicator">
    <header className="development-indicator-heading"><span className="eyebrow">DEVELOPMENT INDICATOR · PUBLIC SUMMARY</span><h1>Watershed health,<br/><i>made visible.</i></h1><p>A simple, read-only view of the WS-001 demonstration profile.</p></header>
    <article className="public-indicator-card">
      <div className="public-indicator-identity"><span className="eyebrow">WS-001</span><h2>Kovilur Watershed</h2><span className="public-indicator-status"><Waves size={16}/> Watershed Status: Healthy</span><ScoreRing/></div>
      <div className="public-indicator-facts"><span><i className="indicator-fact-icon water"><Droplets size={17}/></i><small>Water</small><b>Moderate</b></span><span><i className="indicator-fact-icon vegetation"><Leaf size={17}/></i><small>Vegetation</small><b>Good</b></span><span><i className="indicator-fact-icon assets"><ShieldCheck size={17}/></i><small>Assets</small><b>Stable</b></span></div>
      <div className="public-indicator-notes"><p>Prototype indicator for demonstration purposes.</p><small>Prototype analytical indicator — not an official government metric.</small><button type="button" className="primary" onClick={() => navigate('gis')}>Explore watershed map <Map size={16}/></button></div>
    </article>
  </main>

  return <main className="page content-page development-indicator-page government-development-indicator">
    <header className="development-indicator-heading"><span className="eyebrow">GOVERNMENT DEVELOPMENT INDICATOR</span><h1>WS-001 · Kovilur Watershed</h1><p>Weighted prototype indicators with supporting evidence and spatial context for decision support.</p></header>
    <section className="government-indicator-summary">
      <ScoreRing/>
      <div><span className="eyebrow">WATERSHED HEALTH</span><h2>82 / 100 · Healthy</h2><p>Use the factor breakdown and sample evidence to guide verification—not as an official measurement.</p></div>
      <button type="button" className="primary" onClick={() => navigate('gis')}>Open spatial context <MapPinned size={16}/></button>
    </section>
    <div className="government-indicator-grid">
      <section className="indicator-factor-panel"><div className="indicator-panel-heading"><span className="eyebrow">FULL BREAKDOWN</span><h2>Weighted indicator factors</h2><p>Demonstration weights and sample frontend values.</p></div>
        {factors.map(factor => <article className="indicator-factor-row" key={factor.label}><div className="indicator-factor-title"><b>{factor.label}</b><span>{factor.status}</span></div><div className="indicator-factor-bar"><i style={{ width: `${factor.score}%` }}></i></div><div className="indicator-factor-meta"><span>Score <b>{factor.score} / 100</b></span><span>Weight <b>{factor.weight}%</b></span><span>Contribution <b>{factor.points}</b></span></div><small className="indicator-factor-source">{factor.source}</small></article>)}
        <div className="indicator-weight-total"><span>Weighted total</span><b>82 / 100</b></div>
      </section>
      <aside className="indicator-support-column">
        <section className="indicator-evidence-panel"><span className="eyebrow">SUPPORTING EVIDENCE</span><h2>Sample signals</h2>
          <article><Camera size={16}/><div><b>IMG-1024 · Check Dam</b><small>11 Sep 2026 · Water presence: Moderate</small></div><button type="button" onClick={() => navigate('evidence')} aria-label="View sample evidence"><ArrowRight size={15}/></button></article>
          <article><ShieldCheck size={16}/><div><b>WHS-021 · Asset condition</b><small>Sample status: Stable · Field review recommended</small></div><button type="button" onClick={() => navigate('evidence')} aria-label="View asset evidence"><ArrowRight size={15}/></button></article>
          <article><Waves size={16}/><div><b>Field evidence coverage</b><small>Recent prototype observations · WS-001</small></div><button type="button" onClick={() => navigate('evidence')} aria-label="View field evidence"><ArrowRight size={15}/></button></article>
        </section>
        <section className="indicator-spatial-panel"><div className="indicator-spatial-art"><span className="indicator-contours"></span><i className="indicator-map-pin pin-a"></i><i className="indicator-map-pin pin-b"></i><i className="indicator-map-pin pin-c"></i><span className="indicator-map-label">WS-001 · Kovilur</span></div><div><span className="eyebrow">SPATIAL CONTEXT</span><p>Sample indicator factors are associated with watershed boundaries, assets and geo-coded evidence.</p><button type="button" className="text-btn" onClick={() => navigate('insights')}>Open spatial analytics <ArrowRight size={15}/></button></div></section>
      </aside>
    </div>
    <div className="indicator-story"><span>Field Evidence</span><i>↓</i><span>Indicators</span><i>↓</i><span>Watershed Health</span><i>↓</i><span>Decision Support</span></div>
    <p className="indicator-global-disclaimer">Prototype analytical indicator — not an official government metric. Sample values and weights require official verification.</p>
  </main>
}
