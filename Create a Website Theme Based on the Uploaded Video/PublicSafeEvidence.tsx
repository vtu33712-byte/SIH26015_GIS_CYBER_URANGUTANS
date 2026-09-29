import { useEffect, useState } from 'react'
import { ArrowRight, Camera, LocateFixed, Map, Search, X } from 'lucide-react'
import { assets, geoImages, watersheds } from '../data/mockData'

type PublicImage = { id: string; location: string; date: string; watershed: string; asset: string; observation: string }
const images: PublicImage[] = geoImages.filter(image => image.publicApproved).map(image => {
  const asset = assets.find(item => item.id === image.assetId)!
  const watershed = watersheds.find(item => item.id === image.watershedId)!
  return { id:image.id, location:image.village, date:image.capturedAt.split(',')[0], watershed:`${watershed.id} · ${watershed.name}`, asset:`${asset.id} · ${asset.type}`, observation:image.observation || 'Approved public image available for watershed context.' }
})

export function PublicEvidenceExplorer({ navigate, onViewLocation, initialImageId = null }: { navigate: (view: 'gis' | 'evidence') => void; onViewLocation: (id: string) => void; initialImageId?: string | null }) {
  const [selected, setSelected] = useState<PublicImage | null>(null)
  const [comparison, setComparison] = useState<PublicImage | null>(null)
  useEffect(() => { if (!initialImageId) return; const image = images.find(item => item.id === initialImageId); if (image) setSelected(image) }, [initialImageId])
  const close = () => { setSelected(null); setComparison(null) }
  const viewLocation = (image: PublicImage) => { setSelected(null); setComparison(null); onViewLocation(image.id); navigate('gis') }
  return <div className="page content-page public-evidence public-safe-evidence">
    <section className="content-hero"><span className="eyebrow">PUBLIC GEO-CODED IMAGES</span><h1>See development<br/><i>on the ground.</i></h1><p>Explore approved image context without access to internal field or administrative records.</p></section>
    <div className="evidence-grid">{images.map((image, index) => <article className="evidence-card" key={image.id}>
      <button type="button" className={`evidence-img img-${index}`} aria-label={`View ${image.id}`} onClick={() => setSelected(image)}><span><Camera size={16}/> Public image</span><i><Search size={17}/></i></button>
      <div className="public-safe-image-copy"><small>{image.id}</small><h3>{image.location}</h3><p><LocateFixed size={13}/> {image.date}</p><p><Map size={13}/> {image.watershed}</p>
        <div className="public-safe-fields"><span>Asset<b>{image.asset}</b></span><span>General observation<b>{image.observation}</b></span></div>
        <footer><button type="button" onClick={() => setSelected(image)}>View</button><button type="button" onClick={() => viewLocation(image)}>View Location</button><button type="button" onClick={() => setComparison(image)}>Compare</button></footer>
      </div>
    </article>)}</div>
    {selected && <div className="image-modal" onClick={close}><article onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Public image ${selected.id}`}>
      <button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Close public image"><X/></button><div className={`modal-image img-${images.findIndex(item => item.id === selected.id)}`}></div><span className="eyebrow">APPROVED PUBLIC GEO-CODED IMAGE</span><h2>{selected.id} · {selected.location}</h2>
      <div className="public-safe-detail"><span>Date<b>{selected.date}</b></span><span>Watershed<b>{selected.watershed}</b></span><span>Asset<b>{selected.asset}</b></span><span>General observation<b>{selected.observation}</b></span></div>
      <button type="button" className="primary" onClick={() => viewLocation(selected)}>View Location <Map size={16}/></button>
    </article></div>}
    {comparison && <div className="image-modal public-compare-modal" onClick={close}><article onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Public comparison for ${comparison.id}`}>
      <button type="button" className="modal-close" onClick={() => setComparison(null)} aria-label="Close comparison"><X/></button><span className="eyebrow">PUBLIC IMAGE COMPARISON</span><h2>{comparison.watershed}</h2><p>{comparison.asset} · {comparison.location}</p>
      <div className="public-comparison-grid"><div><small>Earlier public image</small><div className="public-comparison-image img-2"></div><span>02 Sep 2026</span></div><div><small>Selected public image · {comparison.id}</small><div className={`public-comparison-image img-${images.findIndex(item => item.id === comparison.id)}`}></div><span>{comparison.date}</span></div></div>
      <p className="public-prototype-note">Illustrative comparison of approved public image examples only; not an official inspection or administrative assessment.</p>
      <button type="button" className="primary" onClick={() => viewLocation(comparison)}>View on public map <Map size={16}/></button><button type="button" className="compare-secondary" onClick={() => viewLocation(comparison)}>View selected location <ArrowRight size={15}/></button>
    </article></div>}
  </div>
}
