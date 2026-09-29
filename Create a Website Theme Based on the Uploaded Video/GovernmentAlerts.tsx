import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Camera, Check, X } from 'lucide-react'
import { alerts as mockAlerts, assets, geoImages, watersheds } from '../data/mockData'
import { useWorkflow } from '../contexts/WorkflowContext'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './ui/sheet'

type AlertLevel = 'Critical' | 'High' | 'Medium' | 'Information'
type RiskAlert = { id:string; level:AlertLevel; asset:string; message:string; target:string; location:string; latestObservation:string; evidence:string; evidenceId:string|null; detail:string }
const titleLevel = (level:string):AlertLevel => level === 'critical' ? 'Critical' : level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Information'
const tabs = ['All','Critical','High','Medium','Information'] as const
const alerts: RiskAlert[] = mockAlerts.map(alert => {
  const asset=assets.find(item=>item.id===alert.assetId)
  const watershed=watersheds.find(item=>item.id===alert.watershedId)
  const image=geoImages.find(item=>item.id===alert.evidenceIds?.[0])
  return {id:alert.id,level:titleLevel(alert.level),asset:alert.assetId,message:alert.title || alert.message || 'Prototype alert signal',target:alert.assetId,location:`${watershed?.id || alert.watershedId} · ${alert.location}`,latestObservation:alert.observationDate,evidence:alert.evidenceCount?`${alert.evidenceCount} geo-coded image${alert.evidenceCount===1?'':'s'}`:'No recent evidence',evidenceId:image?.id||null,detail:`${alert.message || 'A sample spatial signal requires review.'} ${alert.recommendation || 'Compare with field evidence before taking action.'} ${asset?.developmentStatus ? `Current asset status: ${asset.developmentStatus}.` : ''}`}
})

export function GovernmentAlerts({ onViewMap, onViewEvidence }: { onViewMap:(target:string)=>void; onViewEvidence:(imageId:string|null)=>void }) {
  const [tab,setTab]=useState<(typeof tabs)[number]>('All')
  const [selectedId,setSelectedId]=useState<string|null>(null)
  const {reviewedAlertIds,markAlertReviewed}=useWorkflow()
  const visible=useMemo(()=>tab==='All'?alerts:alerts.filter(alert=>alert.level===tab),[tab])
  const current=alerts.find(alert=>alert.id===selectedId)
  const showMap=(alert:RiskAlert)=>{setSelectedId(null);onViewMap(alert.target)}
  const showEvidence=(alert:RiskAlert)=>{setSelectedId(null);onViewEvidence(alert.evidenceId)}
  return <div className="page content-page alerts-page government-alerts-page">
    <section className="alerts-hero"><span className="eyebrow">RISK MONITORING · {alerts.length} SAMPLE SIGNALS</span><h1>Signals that need<br/><i>attention.</i></h1><p>Government risk alerts from the shared prototype evidence, spatial context, and temporal-change records.</p></section>
    <div className="alert-tabs" role="tablist" aria-label="Filter risk alerts">{tabs.map(name=><button key={name} type="button" role="tab" aria-selected={tab===name} className={tab===name?'active':''} onClick={()=>setTab(name)}>{name}{name==='All'?` (${alerts.length})`:''}</button>)}</div>
    <section className="alert-list" aria-label={`${tab} risk alerts`}>{visible.map(alert=><button type="button" className={`alert-card ${alert.level.toLowerCase()}`} key={alert.id} aria-expanded={selectedId===alert.id} onClick={()=>setSelectedId(alert.id)}><span className="alert-level">{alert.level.toUpperCase()}</span><span className="alert-card-copy"><small>{alert.id} · {alert.asset}</small><b>{alert.message}</b><small className="alert-card-status">{reviewedAlertIds.includes(alert.id)?'Reviewed · saved locally':`Latest signal · ${alert.latestObservation}`}</small></span><ArrowRight size={18}/></button>)}{!visible.length&&<p className="alert-empty">No alerts in this category.</p>}</section>
    <Sheet open={Boolean(current)} onOpenChange={open=>!open&&setSelectedId(null)}><SheetContent side="right" className="alert-sheet-content">{current&&<><button type="button" className="drawer-close" aria-label="Close alert details" onClick={()=>setSelectedId(null)}><X/></button><span className={`alert-level ${current.level.toLowerCase()}`}>{current.level.toUpperCase()}</span><small className="alert-drawer-id">{current.id} · RISK MONITORING</small><SheetTitle className="alert-sheet-title">{current.asset}</SheetTitle><SheetDescription>{current.detail}</SheetDescription><div className="alert-detail"><span>Alert<b>{current.message}</b></span><span>Location<b>{current.location}</b></span><span>Latest observation<b>{current.latestObservation}</b></span><span>Evidence<b>{current.evidence}</b></span></div><footer className="alert-sheet-actions"><Button onClick={()=>showEvidence(current)} disabled={!current.evidenceId}><Camera size={14}/> View Evidence</Button><Button variant="secondary" onClick={()=>showMap(current)}><ArrowRight size={14}/> View on Map</Button><Button variant="outline" onClick={()=>{markAlertReviewed(current.id);setSelectedId(null)}}><Check size={14}/> {reviewedAlertIds.includes(current.id)?'Reviewed':'Mark Reviewed'}</Button></footer><p className="prototype-disclaimer"><AlertTriangle size={13}/> Prototype signal only; verify on site before taking official action.</p></>}</SheetContent></Sheet>
  </div>
}
