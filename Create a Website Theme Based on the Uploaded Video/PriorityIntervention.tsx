import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ArrowRight, Camera, LocateFixed, ShieldCheck } from 'lucide-react'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { assets, geoImages, priorityZones, watersheds } from '../data/mockData'

type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
type PriorityRecord = {
  assetId: string
  watershed: string
  position: [number, number]
  priority: Priority
  risk: string
  reasons: string[]
  evidenceId: string
  evidenceDate: string
  evidenceNote: string
  recommendedAction: string
}
const priorityRecords: PriorityRecord[] = priorityZones.map(zone => {
  const asset = assets.find(item => item.id === zone.assetId)!
  const watershed = watersheds.find(item => item.id === zone.watershedId)
  const image = geoImages.find(item => item.id === asset.latestImageId) || geoImages.find(item => item.assetId === asset.id)
  const level = zone.priority.toUpperCase() as Priority
  return {
    assetId: asset.id,
    watershed: `${zone.watershedId} · ${watershed?.name || asset.village + ' Watershed'}`,
    position: asset.center,
    priority: level,
    risk: `${level.charAt(0)}${level.slice(1).toLowerCase()} prototype risk`,
    reasons: zone.reasons,
    evidenceId: image?.id || 'No linked image',
    evidenceDate: image?.capturedAt || zone.lastChanged || 'Sample record',
    evidenceNote: image?.observation || asset.publicSummary || 'Review the latest available evidence before taking action.',
    recommendedAction: zone.recommendedAction,
  }
})
const markerColors: Record<Priority, string> = { HIGH: '#d9534f', MEDIUM: '#f4a93a', LOW: '#318657' }

function PriorityMapFocus({ record }: { record: PriorityRecord }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    map.flyTo(record.position, 14, { duration: 0.7 })
  }, [record, map])
  return null
}

export function PriorityInterventionPage({ onViewMap, onViewEvidence, onInspect }: {
  onViewMap: (assetId: string) => void
  onViewEvidence: (imageId: string) => void
  onInspect: (assetId: string) => void
}) {
  const [selectedId, setSelectedId] = useState('WHS-021')
  const current = priorityRecords.find(record => record.assetId === selectedId) || priorityRecords[0]
  return <div className="priority-page">
    <div className="priority-map-head"><span className="eyebrow">PRIORITY INTERVENTION MAP</span><h1>WATERSHED <i>INTELLIGENCE</i></h1><p>Prototype spatial prioritization for focused field attention.</p></div>
    <MapContainer center={watersheds[0].center} zoom={11} scrollWheelZoom className="priority-map">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      <PriorityMapFocus record={current}/>
      {priorityRecords.map(record => <CircleMarker key={record.assetId} center={record.position} radius={selectedId === record.assetId ? 19 : record.priority === 'HIGH' ? 14 : 12} pathOptions={{ className: `priority-marker priority-${record.priority.toLowerCase()} ${selectedId === record.assetId ? 'priority-marker-selected' : ''}`, color: markerColors[record.priority], fillColor: markerColors[record.priority], fillOpacity: selectedId === record.assetId ? 0.7 : 0.5, weight: selectedId === record.assetId ? 4 : 2 }} eventHandlers={{ click: () => setSelectedId(record.assetId) }}>
        <Tooltip direction="top">{record.assetId} · {record.priority} priority</Tooltip>
        <Popup><div className="gov-popup priority-map-popup"><b>{record.assetId} · {record.priority} PRIORITY</b><small>{record.watershed}</small><p>{record.risk}<br/>{record.reasons[0]}</p><footer><button type="button" onClick={() => setSelectedId(record.assetId)}>Details</button><button type="button" onClick={() => onViewMap(record.assetId)}>Open GIS</button>{record.evidenceId !== 'No linked image' && <button type="button" onClick={() => onViewEvidence(record.evidenceId)}>Evidence</button>}</footer></div></Popup>
      </CircleMarker>)}
    </MapContainer>
    <aside className="priority-detail priority-detail-reveal" key={current.assetId}>
      <span className={`priority-level ${current.priority.toLowerCase()}`}>{current.priority} PRIORITY</span>
      <div className="priority-asset-heading"><h2>{current.assetId}</h2><span><ShieldCheck size={14}/>{current.risk}</span></div>
      <small className="priority-watershed">{current.watershed}</small>
      <section className="priority-reasons"><b><AlertTriangle size={14}/> Reasons</b>{current.reasons.map(reason => <span key={reason}><i></i>{reason}</span>)}</section>
      <section className="priority-evidence"><b><Camera size={14}/> Supporting Evidence</b><p><strong>{current.evidenceId}</strong> · {current.evidenceDate}<br/>{current.evidenceNote}</p></section>
      <section className="recommended"><b>Recommended Action</b><span><LocateFixed size={14}/>{current.recommendedAction}</span></section>
      <footer className="priority-actions"><button type="button" onClick={() => onViewMap(current.assetId)}>View on Map <ArrowRight size={13}/></button><button type="button" onClick={() => current.evidenceId !== 'No linked image' && onViewEvidence(current.evidenceId)}>View Evidence <ArrowRight size={13}/></button><button type="button" onClick={() => onInspect(current.assetId)}>Inspect <ArrowRight size={13}/></button></footer>
      <p className="priority-disclaimer">Prototype analytical prioritization. Requires official verification; this is not an official government algorithm.</p>
    </aside>
    <div className="priority-legend" aria-label="Priority legend"><span><i className="high"></i>HIGH</span><span><i className="medium"></i>MEDIUM</span><span><i className="low"></i>LOW</span></div>
    <div className="priority-logic" aria-label="Prototype priority inputs">Image Observations <i>+</i> Asset Condition <i>+</i> Water Status <i>+</i> Vegetation <i>+</i> Historical Change <i>+</i> Spatial Concentration</div>
  </div>
}
