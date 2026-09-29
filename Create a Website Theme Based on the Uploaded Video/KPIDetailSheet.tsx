import { Activity, ArrowRight, Camera, Droplets, MapPin, Navigation, Waves } from 'lucide-react'
import { alerts, assets, fieldObservations, geoImages, priorityZones, watersheds } from '../data/mockData'
import type { UserRole } from '../types/domain'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './ui/sheet'

export type KpiMetric = 'watersheds' | 'assets' | 'images' | 'observations' | 'indicator' | 'critical'
type Destination = 'watersheds' | 'assets' | 'evidence' | 'observation' | 'indicator' | 'gis'
type Props = { metric: KpiMetric | null; role: UserRole; onClose: () => void; onNavigate: (view: Destination) => void; onViewMap: (id: string) => void; onOpenWatershed: (id: string) => void; onOpenAsset: (id: string) => void; onOpenImage: (id: string) => void }
const labels: Record<KpiMetric, {title:string;value:string;description:string}> = {
  watersheds: { title:'Watersheds monitored', value:'42', description:'Eight representative watershed profiles are available in this prototype dataset.' },
  assets: { title:'Watershed assets', value:'1,250', description:'Thirty representative water assets are linked to watershed, inspection, and evidence records.' },
  images: { title:'Geo-coded images', value:'8,420', description:'Fifty representative images are linked to an asset and location; public users see approved images only.' },
  observations: { title:'Field observations', value:'128', description:'Twenty representative observations are available to authorized government roles.' },
  indicator: { title:'Development indicator', value:'82 / 100', description:'A prototype score for WS-001, assembled from the visible demo indicators below.' },
  critical: { title:'18 locations require attention', value:'18', description:'Priority sample locations are ranked by water status, condition, recent evidence, and field-review need.' },
}
export function KPIDetailSheet({ metric, role, onClose, onNavigate, onViewMap, onOpenWatershed, onOpenAsset, onOpenImage }: Props) {
  const open = Boolean(metric)
  const details = metric ? labels[metric] : null
  const publicImages = role === 'public' ? geoImages.filter(image => image.publicApproved) : geoImages
  const attentionAssets = [...new Set([...priorityZones.filter(zone => zone.priority === 'high').map(zone => zone.assetId), ...alerts.filter(alert => alert.level === 'critical' || alert.level === 'high').map(alert => alert.assetId)])].map(id => assets.find(asset => asset.id === id)).filter((asset): asset is (typeof assets)[number] => Boolean(asset)).slice(0, 6)
  return <Sheet open={open} onOpenChange={visible => !visible && onClose()}>
    <SheetContent side="right" className="kpi-sheet-content">
      {details && <><span className="eyebrow">DASHBOARD DETAIL · PROTOTYPE DATA</span><SheetTitle className="kpi-sheet-title">{details.title}</SheetTitle><SheetDescription>{details.description}</SheetDescription><div className="kpi-sheet-summary"><b>{details.value}</b><span>Representative data is shown as a sample; headline counts describe the demo monitoring area.</span></div>
        <div className="kpi-record-list">
          {(metric === 'watersheds' || metric === 'indicator') && watersheds.slice(0, metric === 'indicator' ? 1 : 5).map(item => <article key={item.id}><span className="kpi-record-icon"><Waves size={17}/></span><div><b>{item.name}</b><small>{item.id} · {item.district} · {item.areaHectares.toLocaleString()} ha</small><p>{item.assetCount} assets · {item.imageCount} images · Indicator {item.indicator}/100</p></div><Button size="sm" variant="outline" onClick={() => { onOpenWatershed(item.id); onClose() }}>Details <ArrowRight size={14}/></Button></article>)}
          {metric === 'assets' && assets.slice(0, 6).map(item => <article key={item.id}><span className="kpi-record-icon"><Droplets size={17}/></span><div><b>{item.id} · {item.type}</b><small>{item.village} · {item.condition} condition · {item.waterStatus} water</small><p>Latest inspection {item.lastInspection}</p></div><Button size="sm" variant="outline" onClick={() => { onOpenAsset(item.id); onClose() }}>View asset <ArrowRight size={14}/></Button></article>)}
          {metric === 'images' && publicImages.slice(0, 6).map(item => <article key={item.id}><span className="kpi-record-icon"><Camera size={17}/></span><div><b>{item.id} · {item.village}</b><small>{item.capturedAt} · {item.assetId}</small><p>{item.waterStatus} water · {item.condition} condition</p></div><Button size="sm" variant="outline" onClick={() => { onOpenImage(item.id); onNavigate('evidence'); onClose() }}>View image <ArrowRight size={14}/></Button></article>)}
          {metric === 'observations' && role === 'government' && fieldObservations.slice(0, 6).map(item => <article key={item.id}><span className="kpi-record-icon"><Activity size={17}/></span><div><b>{item.id} · {item.assetId}</b><small>{item.capturedAt} · {item.status.replaceAll('_',' ')}</small><p>{item.note || `Water ${item.water} · ${item.condition} condition`}</p></div><Button size="sm" variant="outline" onClick={() => { onNavigate('observation'); onClose() }}>Open log <ArrowRight size={14}/></Button></article>)}
          {metric === 'observations' && role === 'public' && <div className="kpi-empty-note">Public summaries include aggregate development signals only. Individual field observations are restricted.</div>}
          {metric === 'critical' && <><div className="kpi-priority-intro"><span className="severity-pill critical">CRITICAL / HIGH PRIORITY</span><p>18 locations require attention in the demo summary; opening a row takes you to its mapped asset.</p></div>{attentionAssets.map(item => <article key={item.id}><span className="kpi-record-icon priority-icon"><MapPin size={17}/></span><div><b>{item.id} · {item.type}</b><small>{item.village} · {item.condition} condition · {item.waterStatus} water</small><p>{item.developmentStatus || 'Field verification recommended'}</p></div><Button size="sm" variant="outline" onClick={() => { onClose(); onViewMap(item.id) }}>View on map <ArrowRight size={14}/></Button></article>)}</>}
        </div>
        {metric === 'critical' && <p className="prototype-disclaimer">Prototype priority ranking for demonstration only. It is not an official risk classification or an automated government decision.</p>}
        <div className="kpi-sheet-footer"><Button variant="secondary" onClick={() => { onNavigate(metric === 'watersheds' ? 'watersheds' : metric === 'assets' ? 'assets' : metric === 'images' ? 'evidence' : metric === 'indicator' ? 'indicator' : metric === 'observations' ? 'observation' : 'gis'); onClose() }}>{metric === 'critical' ? 'Open GIS map' : 'Open module'} <Navigation size={15}/></Button></div>
      </>}
    </SheetContent>
  </Sheet>
}
