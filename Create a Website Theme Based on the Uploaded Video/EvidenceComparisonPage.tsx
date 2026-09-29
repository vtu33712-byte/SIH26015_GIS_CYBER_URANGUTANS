import { useEffect, useState } from 'react'
import { ArrowRight, Camera, X } from 'lucide-react'

type CompareRecord = { place: string; date: string; asset: string; watershed: string }
const records: Record<string, CompareRecord> = {
  'IMG-1024': { place: 'Kovilur', date: '11 Sep 2026', asset: 'WHS-021 · Check Dam', watershed: 'WS-001 · Kovilur' },
  'IMG-1025': { place: 'Kovilur', date: '10 Sep 2026', asset: 'WHS-028 · Check Dam', watershed: 'WS-001 · Kovilur' },
  'IMG-1028': { place: 'Madurantakam', date: '08 Sep 2026', asset: 'WHS-009 · Recharge Structure', watershed: 'WS-003 · Madurantakam' },
}

const dateWindows = [
  'June 2026 → September 2026',
  'May 2026 → September 2026',
  'June 2026 → August 2026',
]

export function EvidenceComparisonPage({ imageId, clearImage }: { imageId: string | null; clearImage: () => void }) {
  const record = imageId ? records[imageId] : undefined
  const [position, setPosition] = useState(55)
  const [watershed, setWatershed] = useState(record?.watershed || 'WS-001 · Kovilur')
  const [asset, setAsset] = useState(record?.asset || 'WHS-021 · Check Dam')
  const [dateWindow, setDateWindow] = useState(dateWindows[0])
  const [beforeDate, afterDate] = dateWindow.split(' → ')

  useEffect(() => {
    setPosition(55)
    if (!record) return
    setWatershed(record.watershed)
    setAsset(record.asset)
  }, [imageId])

  const score = Math.round(position)
  const water = score >= 55 ? 'Poor' : score <= 24 ? 'Good' : 'Moderate'
  const vegetation = score >= 55 ? 'Sparse' : score <= 24 ? 'Good' : 'Moderate'
  const structure = score >= 55 ? 'Damaged' : score <= 24 ? 'Good' : 'Moderate'

  return <div className="page content-page temporal-page">
    <section className="temporal-hero">
      <div><span className="eyebrow">TEMPORAL WATERSHED ANALYSIS</span><h1>See change.<br/><i>Understand impact.</i></h1><p>Compare dated geo-coded evidence to identify possible change requiring field verification.</p></div>
      <div className="temporal-selects">
        <label>Watershed<select value={watershed} onChange={event => setWatershed(event.target.value)}><option>WS-001 · Kovilur</option><option>WS-003 · Madurantakam</option></select></label>
        <label>Asset<select value={asset} onChange={event => setAsset(event.target.value)}><option>WHS-021 · Check Dam</option><option>WHS-028 · Check Dam</option><option>WHS-009 · Recharge Structure</option><option>WHS-042 · Farm Pond</option></select></label>
        <label>Date<select value={dateWindow} onChange={event => setDateWindow(event.target.value)}>{dateWindows.map(window => <option key={window}>{window}</option>)}</select></label>
      </div>
    </section>

    {imageId && record && <div className="selected-compare-evidence"><Camera size={16}/><span>Selected evidence <b>{imageId}</b> · {record.place} · captured {record.date}</span><button type="button" onClick={clearImage} aria-label="Clear selected evidence"><X size={15}/></button></div>}

    <section className="comparison-stage comparison-reveal" aria-label={`Image comparison: ${beforeDate} before and ${afterDate} after`}>
      <div className="compare-label before">BEFORE <b>{beforeDate}</b></div>
      <div className="compare-label after">AFTER <b>{afterDate}</b></div>
      <div className="compare-before" aria-hidden="true"></div>
      <div className="compare-after" style={{ clipPath: `inset(0 0 0 ${position}%)` }} aria-hidden="true"></div>
      <input aria-label="Drag to compare before and after imagery" aria-valuetext={`After image revealed from ${score}% across the comparison`} type="range" min="0" max="100" step="1" value={position} onChange={event => setPosition(Number(event.target.value))}/>
      <span className="comparison-handle" style={{ left: `${position}%` }} aria-hidden="true"><i>↔</i></span>
      <span className="comparison-hint"><ArrowRight size={13}/> Drag to compare</span>
    </section>

    <section className="comparison-results">
      <div><span className="eyebrow">COMPARISON RESULT · {asset.split(' · ')[0]}</span><h2>POSSIBLE DEVELOPMENT DECLINE</h2><p>Illustrative visual indicators only; no official measurements are represented.</p></div>
      <div className="temporal-indicators" aria-live="polite" aria-atomic="true">
        <span>Water Presence <b>Good → <i className={water === 'Poor' ? 'red-text' : water === 'Good' ? 'green-text' : 'amber-text'}>{water}</i></b></span>
        <span>Vegetation <b>Moderate → <i className={vegetation === 'Sparse' ? 'red-text' : vegetation === 'Good' ? 'green-text' : 'amber-text'}>{vegetation}</i></b></span>
        <span>Structure <b>Good → <i className={structure === 'Damaged' ? 'red-text' : structure === 'Good' ? 'green-text' : 'amber-text'}>{structure}</i></b></span>
      </div>
      <div className="decline-signals"><span>↓ Water availability</span><span>↓ Vegetation</span><span>↓ Asset condition</span></div>
      <p className="analysis-disclaimer">Requires field verification. This illustrative comparison is a prototype, not an official government measurement.</p>
    </section>
  </div>
}
