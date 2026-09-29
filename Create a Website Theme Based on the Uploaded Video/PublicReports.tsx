import { useState } from 'react'
import { ArrowRight, CloudRain, Map, Waves, X } from 'lucide-react'

type PublicReport = { title: string; description: string; icon: typeof Waves; summary: string; facts: [string, string][] }
type Navigate = (view: 'gis' | 'watersheds' | 'indicator') => void

const publicReports: PublicReport[] = [
  { title: 'Watershed Development Overview', description: 'A public view of development progress across monitored watersheds.', icon: Waves, summary: 'A high-level public snapshot of watershed development.', facts: [['Watersheds monitored', '42'], ['Public watershed assets', '1,250'], ['Public geo-coded images', '8,420'], ['WS-001 status', 'Healthy']] },
  { title: 'Public Watershed Status', description: 'Watershed condition and public indicators for communities.', icon: Map, summary: 'Public status information for the WS-001 demonstration profile.', facts: [['Watershed', 'WS-001 · Kovilur'], ['Watershed status', 'Healthy'], ['Development Indicator', '82 / 100'], ['Assets', 'Stable']] },
  { title: 'Water Resource Summary', description: 'Publicly shared information about water resources and availability.', icon: CloudRain, summary: 'A summary of publicly visible water-resource context.', facts: [['Water status', 'Moderate'], ['Water body', 'WB-014'], ['Seasonal rainfall sample', '842 mm'], ['Vegetation', 'Good']] },
]

export function PublicReportsPage({ navigate }: { navigate: Navigate }) {
  const [selected, setSelected] = useState<PublicReport | null>(null)
  const close = () => setSelected(null)
  return <div className="page content-page reports public-reports">
    <section className="content-hero"><span className="eyebrow">PUBLIC REPORTS</span><h1>Information for<br/><i>every community.</i></h1><p>Only publicly approved watershed information is available here.</p></section>
    <section className="report-grid" aria-label="Public reports">{publicReports.map(({ title, description, icon: Icon, ...report }) => <article key={title}><span className="report-icon"><Icon/></span><small>PUBLIC INFORMATION</small><h3>{title}</h3><p>{description}</p><button type="button" className="text-btn" onClick={() => setSelected({ title, description, icon: Icon, ...report })}>View public report <ArrowRight size={16}/></button></article>)}</section>
    {selected && <div className="image-modal report-preview public-report-preview" onClick={close}><article role="dialog" aria-modal="true" aria-labelledby="public-report-title" onClick={event => event.stopPropagation()}><button type="button" className="modal-close" aria-label="Close public report" onClick={close}><X/></button><span className="eyebrow">PUBLIC REPORT PREVIEW</span><h2 id="public-report-title">{selected.title.toUpperCase()}</h2><h3>{selected.summary}</h3><div className="report-summary">{selected.facts.map(([label, value]) => <span key={label}>{label}<b>{value}</b></span>)}</div><p className="public-report-disclaimer">Public sample summary for demonstration purposes. This preview contains no internal government inspection, officer, or administrative records.</p><footer><button type="button" onClick={() => { close(); navigate('gis') }}>Explore public map</button><button type="button" onClick={close}>Close Preview</button></footer></article></div>}
  </div>
}
