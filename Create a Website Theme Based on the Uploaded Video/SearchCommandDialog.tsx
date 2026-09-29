import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Camera, MapPin, Search, Waves } from 'lucide-react'
import { assets, geoImages, watersheds } from '../data/mockData'
import type { UserRole } from '../types/domain'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'

type Result = { id: string; title: string; detail: string; kind: 'watershed' | 'asset' | 'image' }
type Props = { open: boolean; role: UserRole; onClose: () => void; onOpenWatershed: (id: string) => void; onOpenAsset: (id: string) => void; onOpenImage: (id: string) => void }
export function SearchCommandDialog({ open, role, onClose, onOpenWatershed, onOpenAsset, onOpenImage }: Props) {
  const [query, setQuery] = useState('')
  useEffect(() => { if (!open) setQuery('') }, [open])
  const allResults = useMemo<Result[]>(() => [
    ...watersheds.map(item => ({ id:item.id, title:item.name, detail:`${item.district} · ${item.areaHectares.toLocaleString()} ha · ${item.assetCount} assets`, kind:'watershed' as const })),
    ...assets.map(item => ({ id:item.id, title:`${item.id} · ${item.type}`, detail:`${item.village} · ${item.condition} condition · ${item.waterStatus} water`, kind:'asset' as const })),
    ...geoImages.filter(item => role === 'government' || item.publicApproved).map(item => ({ id:item.id, title:`${item.id} · ${item.village}`, detail:`${item.capturedAt} · ${item.assetId} · ${item.waterStatus} water`, kind:'image' as const })),
  ], [role])
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (needle ? allResults.filter(item => `${item.id} ${item.title} ${item.detail}`.toLowerCase().includes(needle)) : allResults).slice(0, 12)
  }, [allResults, query])
  const choose = (item: Result) => { onClose(); if (item.kind === 'watershed') onOpenWatershed(item.id); else if (item.kind === 'asset') onOpenAsset(item.id); else onOpenImage(item.id) }
  return <Dialog open={open} onOpenChange={visible => !visible && onClose()}>
    <DialogContent className="search-dialog-content"><span className="eyebrow">JAL-IMPACT · GLOBAL SEARCH</span><DialogTitle>Find watershed intelligence</DialogTitle><DialogDescription>Search locations, assets, and {role === 'government' ? 'government evidence' : 'approved public images'}.</DialogDescription>
+      <label className="global-search-field"><Search size={18}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Try WS-001, Kovilur, or WHS-021" aria-label="Search watershed records"/><kbd>ESC</kbd></label>
+      <div className="search-results" role="listbox" aria-label="Search results">{results.map(item => <button type="button" key={`${item.kind}-${item.id}`} role="option" aria-selected="false" onClick={() => choose(item)}><span className="search-result-icon">{item.kind === 'watershed' ? <Waves size={17}/> : item.kind === 'asset' ? <MapPin size={17}/> : <Camera size={17}/>}</span><span><b>{item.title}</b><small>{item.detail}</small></span><ArrowRight size={15}/></button>)}{!results.length && <p className="search-empty">No matching records. Try an ID, village, or asset type.</p>}</div>
+      <div className="search-dialog-footer"><span>{results.length} matching prototype records</span><Button variant="ghost" size="sm" onClick={onClose}>Close</Button></div>
+    </DialogContent>
+  </Dialog>
+}
