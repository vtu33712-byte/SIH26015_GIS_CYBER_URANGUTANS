import { ArrowRight, Camera, ClipboardCheck, Droplets, Map, Navigation, ShieldCheck, Waves } from 'lucide-react'
import { alerts, assets, geoImages, watersheds } from '../data/mockData'
import type { UserRole } from '../types/domain'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './ui/sheet'

type Destination = 'overview' | 'gis' | 'evidence' | 'reports' | 'operations' | 'observation'
type WatershedProps = { id: string | null; role: UserRole; onClose: () => void; onNavigate: (view: Destination) => void; onViewMap: (id: string) => void; onOpenAsset: (id: string) => void; onOpenImage: (id: string) => void }
export function WatershedDetailsSheet({ id, role, onClose, onNavigate, onViewMap, onOpenAsset, onOpenImage }: WatershedProps) {
  const watershed = id ? watersheds.find(item => item.id === id) : undefined
  const linkedAssets = assets.filter(asset => asset.watershedId === id).slice(0, 4)
  const linkedImages = geoImages.filter(image => image.watershedId === id && (role === 'government' || image.publicApproved)).slice(0, 4)
  const linkedAlerts = role === 'government' ? alerts.filter(alert => alert.watershedId === id).slice(0, 3) : []
  return <Sheet open={Boolean(watershed)} onOpenChange={open => !open && onClose()}>
    <SheetContent side="bottom" className="entity-sheet watershed-details-sheet">
      {watershed && <><span className="eyebrow">WATERSHED DETAILS · {watershed.id}</span><div className="entity-title-row"><div><SheetTitle className="entity-title">{watershed.name}</SheetTitle><SheetDescription>{watershed.district} District · {watershed.areaHectares.toLocaleString()} ha · Updated {watershed.lastUpdated || '11 Sep 2026'}</SheetDescription></div><span className={`watershed-status ${watershed.status}`}>{watershed.status === 'healthy' ? 'Healthy' : watershed.status === 'moderate' ? 'Monitor' : 'Needs attention'}</span></div>
        <div className="entity-metrics"><div><small>Assets</small><b>{watershed.assetCount}</b></div><div><small>{role === 'government' ? 'Geo-coded images' : 'Public images'}</small><b>{role === 'government' ? watershed.imageCount : linkedImages.length}</b></div><div><small>Development indicator</small><b>{watershed.indicator}<i> / 100</i></b></div><div><small>Water availability</small><b>{watershed.waterAvailability ?? '—'}<i>%</i></b></div></div>
        <p className="prototype-disclaimer">Prototype monitoring summary for demonstration. Indicator values and sample records are not official government measurements.</p>
        <div className="entity-columns"><section><h3><Droplets size={17}/> Water &amp; development context</h3><p>Vegetation signal <b>{watershed.vegetation ?? '—'}%</b>. This view summarizes the selected watershed without exposing restricted operational records to public users.</p><div className="watershed-mini-trend">{(watershed.trend || []).map(point => <button key={point.month} type="button" title={`${point.month}: water ${point.waterAvailability}%`} onClick={() => onNavigate('overview')}><span style={{height:`${Math.max(18,point.waterAvailability)}%`}}/><small>{point.month.slice(0,3)}</small></button>)}</div></section><section><h3><Waves size={17}/> {role === 'government' ? 'Recent alerts' : 'Recent public updates'}</h3>{role === 'government' ? linkedAlerts.length ? linkedAlerts.map(alert => <div className="entity-update" key={alert.id}><span className={`severity-dot ${alert.level}`}/><div><b>{alert.title || alert.message}</b><small>{alert.date || alert.observationDate} · {alert.location || watershed.village}</small></div></div>) : <p>No current alerts for this watershed.</p> : <div className="entity-update"><span className="severity-dot information"/><div><b>Public watershed summary updated</b><small>{watershed.lastUpdated || '11 Sep 2026'} · Approved status and imagery</small></div></div>}</section></div>
        <section className="entity-linked-list"><h3><ShieldCheck size={17}/> Linked assets</h3>{linkedAssets.map(asset => <div key={asset.id}><span><b>{asset.id} · {asset.type}</b><small>{asset.village} · {asset.condition} condition · {asset.waterStatus} water</small></span><Button size="sm" variant="outline" onClick={() => onOpenAsset(asset.id)}>Details</Button></div>)}</section>
        <section className="entity-linked-list"><h3><Camera size={17}/> {role === 'government' ? 'Recent geo-coded images' : 'Recent approved images'}</h3>{linkedImages.length ? linkedImages.map(image => <div key={image.id}><span><b>{image.id} · {image.village}</b><small>{image.capturedAt} · {image.assetId}</small></span><Button size="sm" variant="outline" onClick={() => onOpenImage(image.id)}>View image</Button></div>) : <p>No images available for this view.</p>}</section>
        <div className="entity-action-row"><Button onClick={() => onNavigate('overview')}>Open full dashboard <ArrowRight size={15}/></Button><Button variant="secondary" onClick={() => onViewMap(watershed.id)}>View on GIS <Map size={15}/></Button><Button variant="outline" onClick={() => onNavigate('reports')}>View reports</Button></div>
      </>}
    </SheetContent>
  </Sheet>
}

type AssetProps = { id: string | null; role: UserRole; onClose: () => void; onNavigate: (view: Destination) => void; onViewMap: (id: string) => void; onOpenImage: (id: string) => void }
export function AssetDetailsDialog({ id, role, onClose, onNavigate, onViewMap, onOpenImage }: AssetProps) {
  const asset = id ? assets.find(item => item.id === id) : undefined
  const image = asset ? geoImages.find(item => item.id === asset.latestImageId && (role === 'government' || item.publicApproved)) : undefined
  return <Dialog open={Boolean(asset)} onOpenChange={open => !open && onClose()}>
    <DialogContent className="asset-details-dialog">
      {asset && <><span className="eyebrow">{role === 'government' ? 'GOVERNMENT ASSET RECORD' : 'PUBLIC ASSET SUMMARY'}</span><DialogTitle>{asset.id} · {asset.type}</DialogTitle><DialogDescription>{asset.village} · {asset.district || 'Kancheepuram'} · {asset.watershedId}</DialogDescription>
        <div className="asset-preview-surface"><span><Droplets size={20}/>{image ? `${image.id} · ${image.capturedAt}` : 'No approved evidence preview available'}</span><small>PROTOTYPE EVIDENCE CONTEXT</small></div>
        <div className="entity-metrics asset-metrics"><div><small>Condition</small><b>{asset.condition}</b></div><div><small>Water</small><b>{asset.waterStatus}</b></div>{role === 'government' && <><div><small>Risk priority</small><b>{asset.risk}</b></div><div><small>Last inspection</small><b>{asset.lastInspection}</b></div></>}</div>
        <p>{role === 'government' ? asset.internalRecommendation || 'Continue scheduled monitoring and verify through the next field visit.' : asset.publicSummary || `${asset.condition} condition asset in ${asset.village}; latest approved water status is ${asset.waterStatus}.`}</p>
        {image && <Button variant="outline" onClick={() => onOpenImage(image.id)}>View linked image <Camera size={15}/></Button>}
        <div className="entity-action-row"><Button onClick={() => onViewMap(asset.id)}>View on GIS <Map size={15}/></Button>{role === 'government' ? <><Button variant="secondary" onClick={() => onNavigate('operations')}>Start inspection <ClipboardCheck size={15}/></Button><Button variant="outline" onClick={() => onNavigate('observation')}>Create observation <Navigation size={15}/></Button></> : <Button variant="secondary" onClick={() => onNavigate('evidence')}>View public evidence <Camera size={15}/></Button>}</div>
        {role === 'public' && <p className="prototype-disclaimer">Public view excludes officer details, inspection status, internal recommendations, and administrative records.</p>}
      </>}
    </DialogContent>
  </Dialog>
}
