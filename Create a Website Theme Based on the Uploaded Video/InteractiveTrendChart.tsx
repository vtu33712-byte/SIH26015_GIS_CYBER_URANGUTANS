import { useState } from 'react'
import { Activity, ArrowRight, Droplets, Leaf, MapPin } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { trendData } from '../data/mockData'
import type { TrendPoint } from '../types/domain'
import type { UserRole } from '../types/domain'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'

export function InteractiveTrendChart({ role, onViewObservations }: { role: UserRole; onViewObservations: () => void }) {
  const [selected, setSelected] = useState<TrendPoint | null>(null)
  const onPointClick = (state: any) => { const point = state?.activePayload?.[0]?.payload as TrendPoint | undefined; if (point) setSelected(point) }
  return <section className="interactive-trend-card" aria-labelledby="trend-heading">
    <div className="interactive-trend-heading"><div><span className="eyebrow">WATER · VEGETATION · FIELD EVIDENCE</span><h2 id="trend-heading">Seasonal watershed signals</h2><p>Hover or focus a month for metrics; select a point for context and next steps.</p></div><span className="trend-source"><Activity size={15}/> Prototype data · Sep 2026</span></div>
    <div className="interactive-trend-chart" role="group" aria-label="Interactive watershed indicators chart">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData} margin={{top:8,right:12,left:-16,bottom:0}} onClick={onPointClick} accessibilityLayer>
          <CartesianGrid stroke="rgba(198,227,241,.12)" strokeDasharray="3 5" vertical={false}/>
          <XAxis dataKey="month" tick={{fill:'#bed0dd',fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="percent" domain={[0,100]} tick={{fill:'#8ea8ba',fontSize:10}} axisLine={false} tickLine={false} width={32}/>
          <YAxis yAxisId="observations" orientation="right" tick={{fill:'#8ea8ba',fontSize:10}} axisLine={false} tickLine={false} width={36}/>
          <Tooltip cursor={{stroke:'rgba(112,225,223,.5)',strokeDasharray:'3 4'}} contentStyle={{background:'rgba(5,23,38,.96)',border:'1px solid rgba(154,221,229,.24)',borderRadius:14,color:'#f1f7fa',boxShadow:'0 14px 36px rgba(0,0,0,.28)'}} labelStyle={{color:'#fff',fontWeight:700}} labelFormatter={(label,payload)=>payload?.[0]?.payload?.date||label} formatter={(value,name)=>[`${value}${name==='fieldObservations'?' observations':'%'}`,name==='waterAvailability'?'Water availability':name==='vegetation'?'Vegetation':'Field observations']}/>
          <Legend verticalAlign="top" align="right" height={32} wrapperStyle={{fontSize:11,color:'#bfd3df'}} formatter={(value)=>value==='waterAvailability'?'Water':value==='vegetation'?'Vegetation':'Observations'}/>
          <Line yAxisId="percent" type="monotone" dataKey="waterAvailability" stroke="#64d9dc" strokeWidth={3} dot={{r:4,fill:'#64d9dc',stroke:'#082338',strokeWidth:2}} activeDot={{r:7,stroke:'#d6ffff',strokeWidth:2,cursor:'pointer'}} isAnimationActive/>
          <Line yAxisId="percent" type="monotone" dataKey="vegetation" stroke="#a5d6a7" strokeWidth={2.5} dot={{r:3,fill:'#a5d6a7',stroke:'#082338',strokeWidth:2}} activeDot={{r:7,stroke:'#efffee',strokeWidth:2,cursor:'pointer'}} isAnimationActive/>
          <Line yAxisId="observations" type="monotone" dataKey="fieldObservations" stroke="#b8a6ff" strokeWidth={2.5} strokeDasharray="5 4" dot={{r:3,fill:'#b8a6ff',stroke:'#082338',strokeWidth:2}} activeDot={{r:7,stroke:'#f4efff',strokeWidth:2,cursor:'pointer'}} isAnimationActive/>
        </LineChart>
      </ResponsiveContainer>
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={open=>!open&&setSelected(null)}>
      <DialogContent><span className="eyebrow">WATERSHED SIGNAL DETAIL</span><DialogTitle>{selected?.month || 'Monthly detail'}</DialogTitle><DialogDescription>{selected?.fieldObservations ?? 0} observations recorded across representative prototype sites.</DialogDescription>
        <div className="trend-detail-grid"><div><Droplets/><small>Water availability</small><b>{selected?.waterAvailability ?? 0}%</b></div><div><Leaf/><small>Vegetation</small><b>{selected?.vegetation ?? 0}%</b></div><div><Activity/><small>Field observations</small><b>{selected?.fieldObservations ?? 0}</b></div></div>
        <p className="trend-detail-note"><MapPin size={16}/><span>{selected?.month === 'Sep 2026' ? 'Kovilur Watershed · WS-001. Water status declined by 12 points from August; field verification is recommended.' : 'Kovilur Watershed · WS-001. Compare this monthly signal with current approved imagery before action.'}</span></p>
        <Button onClick={onViewObservations}>{role === 'public' ? 'View development insights' : 'View Observations'} <ArrowRight size={16}/></Button>
      </DialogContent>
    </Dialog>
  </section>
}
