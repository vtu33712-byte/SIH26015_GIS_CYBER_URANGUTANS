import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Layers3, LocateFixed, Waves } from 'lucide-react'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { assets, fieldObservations, spatialInsights, watersheds } from '../data/mockData'

type LayerKey = 'problemClusters' | 'lowWater' | 'vegetation' | 'damagedAssets' | 'erosion' | 'missingObservations'
type SpatialCategory = 'Possible erosion' | 'Visible deterioration' | 'Declining water' | 'Reduced vegetation'
type Priority = 'high' | 'medium' | 'low'
type Navigate = (view: 'priority' | 'evidence' | 'operations') => void

const categoryMeta: Record<SpatialCategory, { tone: string; color: string; layer: LayerKey; priority: Priority; unit: string }> = {
  'Possible erosion': { tone: 'red', priority: 'high', color: '#dc655f', layer: 'erosion', unit: 'locations' },
  'Visible deterioration': { tone: 'amber', priority: 'high', color: '#e6a849', layer: 'damagedAssets', unit: 'assets' },
  'Declining water': { tone: 'blue', priority: 'medium', color: '#28a4bb', layer: 'lowWater', unit: 'locations' },
  'Reduced vegetation': { tone: 'purple', priority: 'medium', color: '#8272c8', layer: 'vegetation', unit: 'areas' },
}
const insightFor = (category: SpatialCategory) => spatialInsights.find(item => item.label === category)
const categoryPoint = (category: SpatialCategory): [number, number] => {
  const insight = insightFor(category)
  if (insight?.coordinates) return insight.coordinates
  return watersheds.find(item => item.id === insight?.watershedId)?.center || watersheds[0].center
}
const clusters: Record<SpatialCategory, [number, number][]> = {
  'Possible erosion': [categoryPoint('Possible erosion')],
  'Visible deterioration': [categoryPoint('Visible deterioration')],
  'Declining water': [categoryPoint('Declining water')],
  'Reduced vegetation': [categoryPoint('Reduced vegetation')],
}
const categories = Object.keys(categoryMeta) as SpatialCategory[]
const layers: { key: LayerKey; label: string }[] = [
  { key: 'problemClusters', label: 'Problem Clusters' },
  { key: 'lowWater', label: 'Low Water Zones' },
  { key: 'vegetation', label: 'Vegetation Stress' },
  { key: 'damagedAssets', label: 'Damaged Assets' },
  { key: 'erosion', label: 'Possible Erosion' },
  { key: 'missingObservations', label: 'Missing Observations' },
]
const observedAssetIds = new Set(fieldObservations.map(item => item.assetId))
const missingObservations = assets.filter(asset => !observedAssetIds.has(asset.id)).slice(0, 8).map(asset => ({
  id: `MO-${asset.id}`,
  point: asset.center as [number, number],
  watershed: `${asset.watershedId} · ${watersheds.find(item => item.id === asset.watershedId)?.name || asset.village}`,
  assetId: asset.id,
}))

function AnalyticsMapFocus({ active }: { active: SpatialCategory }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const points = clusters[active]
    if (!points.length) return
    map.flyTo(points[0], 13, { duration: 0.65 })
  }, [active, map])
  return null
}

export function SpatialAnalytics({ onOpenWatershed, onOpenAsset, navigate }: {
  onOpenWatershed: (id: string) => void
  onOpenAsset: (id: string) => void
  navigate: Navigate
}) {
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<SpatialCategory>('Possible erosion')
  const [enabled, setEnabled] = useState<Record<LayerKey, boolean>>({
    problemClusters: true, lowWater: true, vegetation: true, damagedAssets: true, erosion: true, missingObservations: true,
  })
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500)
    return () => window.clearTimeout(timer)
  }, [])
  const selectInsight = (category: SpatialCategory) => {
    setActive(category)
    setEnabled(current => ({ ...current, problemClusters: true, [categoryMeta[category].layer]: true }))
  }

  return <div className="analytics-page">
    {loading ? <div className="analytics-loading" role="status" aria-live="polite"><span className="water-ripple" aria-hidden="true"><i/><i/><i/></span><p>Processing spatial indicators...</p></div> : <>
      <div className="analytics-map-head"><span className="eyebrow">SPATIAL INTELLIGENCE</span><h1>WATERSHED INTELLIGENCE</h1><p>Geo-coded indicators, temporal change and priority areas for field review.</p></div>
      <MapContainer center={watersheds[0].center} zoom={11} scrollWheelZoom className="analytics-map">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <AnalyticsMapFocus active={active}/>
        {enabled.problemClusters && categories.filter(category => enabled[categoryMeta[category].layer]).flatMap(category => clusters[category].map((point, index) => <Circle key={`heat-${category}-${index}`} center={point} radius={310} pathOptions={{ className: 'analytics-heat-zone', color: categoryMeta[category].color, fillColor: categoryMeta[category].color, fillOpacity: 0.07, weight: 1 }}/>))}
        {categories.flatMap(category => {
          const insight = insightFor(category)
          const meta = categoryMeta[category]
          const relatedAsset = assets.find(asset => asset.watershedId === insight?.watershedId)
          if (!enabled[meta.layer]) return []
          return clusters[category].map((point, index) => <CircleMarker key={`${category}-${index}`} center={point} radius={active === category ? 17 : meta.priority === 'high' ? 12 : 10} pathOptions={{ className: `analytics-zone analytics-${meta.priority} ${active === category ? 'analytics-selected' : ''}`, color: meta.color, fillColor: meta.color, fillOpacity: active === category ? 0.68 : 0.44, weight: active === category ? 3 : 2 }} eventHandlers={{ click: () => setActive(category) }}>
            <Tooltip direction="top">{category} · {meta.priority} priority</Tooltip>
            <Popup><div className="gov-popup"><b>{category.toUpperCase()}</b><small>{insight?.id} · {insight?.location || 'Monitoring area'} · {insight?.date || 'Prototype sample'}</small><p>{insight?.description || 'Prototype spatial indicator requiring field verification.'}<br/>{insight?.count ?? 0} flagged in this sample layer.</p><footer>{insight?.watershedId && <button type="button" onClick={() => onOpenWatershed(insight.watershedId!)}>Watershed details</button>}{relatedAsset && <button type="button" onClick={() => onOpenAsset(relatedAsset.id)}>Open linked asset</button>}<button type="button" onClick={() => navigate('priority')}>Priority view</button></footer></div></Popup>
          </CircleMarker>)
        })}
        {enabled.missingObservations && missingObservations.map(item => <CircleMarker key={item.id} center={item.point} radius={9} pathOptions={{ className: 'analytics-zone analytics-missing', color: '#a7bbc7', fillColor: '#718b9d', fillOpacity: 0.72, weight: 2 }}>
          <Tooltip>{item.assetId} · No sample observation</Tooltip>
          <Popup><div className="gov-popup"><b>NO SAMPLE OBSERVATION</b><small>{item.id} · {item.watershed}</small><p>No prototype field observation is linked to this asset yet. A verification visit can add current evidence.</p><footer><button type="button" onClick={() => onOpenAsset(item.assetId)}>Open asset</button><button type="button" onClick={() => navigate('operations')}>Field operations</button></footer></div></Popup>
        </CircleMarker>)}
      </MapContainer>
      <aside className="spatial-panel">
        <span className="eyebrow">SPATIAL INSIGHTS</span><h2>Priority patterns</h2>
        {categories.map(category => {
          const insight = insightFor(category)
          const meta = categoryMeta[category]
          return <button type="button" key={category} className={active === category ? 'active' : ''} onClick={() => selectInsight(category)} aria-pressed={active === category}>
            <span className={`spatial-dot ${meta.tone}`}></span><div><b>{category}</b><small>{insight?.count ?? 0} {meta.unit} · {meta.priority} priority</small></div><ArrowRight size={15}/>
          </button>
        })}
        <div className="analytics-layers"><b><Layers3 size={14}/> Indicator layers</b>{layers.map(layer => <label key={layer.key}><input type="checkbox" checked={enabled[layer.key]} onChange={() => setEnabled(current => ({ ...current, [layer.key]: !current[layer.key] }))}/>{layer.label}</label>)}</div>
        <button type="button" className="analytics-view-priority" onClick={() => navigate('priority')}><LocateFixed size={15}/> Open priority intervention <ArrowRight size={14}/></button>
        <div className="analytics-map-key"><Waves size={14}/> High pulses · Medium glow · Low static</div>
      </aside>
      <div className="analytics-story" aria-label="Analytics data story"><b>Geo-Coded Images</b><i></i><b>Spatial Indicators</b><i></i><b>Temporal Change</b><i></i><b>Problem Clusters</b><i></i><b>Priority Areas</b><small>Prototype analytical prioritization. Requires official verification.</small></div>
    </>}
  </div>
}
