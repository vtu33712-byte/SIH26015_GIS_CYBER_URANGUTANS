import { useEffect, useState } from 'react'
import { ArrowRight, Building2, Camera, Layers3, LocateFixed, Map, Search, Waves, X } from 'lucide-react'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'

type PublicView = 'gis' | 'watersheds' | 'assets' | 'evidence' | 'insights' | 'indicator'
type Navigate = (view: PublicView) => void

type PublicImage = {
  id: string
  place: string
  date: string
  asset: string
  water: string
  condition: string
  coordinates: [number, number]
}

const publicImages: PublicImage[] = [
  { id: 'IMG-1024', place: 'Kovilur', date: '11 Sep 2026', asset: 'WHS-021', water: 'Poor', condition: 'Moderate', coordinates: [12.970, 80.006] },
  { id: 'IMG-1025', place: 'Kovilur', date: '08 Sep 2026', asset: 'WHS-028', water: 'Poor', condition: 'Moderate', coordinates: [12.976, 79.990] },
  { id: 'IMG-1028', place: 'Madurantakam', date: '02 Sep 2026', asset: 'WHS-009', water: 'Poor', condition: 'Moderate', coordinates: [12.511, 79.884] },
]

const publicWatershed = {
  type: 'Feature' as const,
  properties: { id: 'WS-001', name: 'Kovilur Watershed' },
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[79.919, 12.946], [80.001, 12.946], [80.024, 12.990], [79.965, 13.016], [79.913, 12.982], [79.919, 12.946]]],
  },
}

const publicAgriculture = {
  type: 'Feature' as const,
  properties: { name: 'Kovilur public agriculture area' },
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[79.936, 12.951], [79.956, 12.952], [79.963, 12.966], [79.948, 12.976], [79.932, 12.966], [79.936, 12.951]]],
  },
}

const layerDefaults = { watersheds: true, water: true, assets: true, agriculture: true, villages: true, images: true }

function FocusPublicImage({ imageId }: { imageId: string | null }) {
  const map = useMap()
  useEffect(() => {
    const image = publicImages.find(item => item.id === imageId)
    if (image) map.setView(image.coordinates, 15, { animate: false })
  }, [imageId, map])
  return null
}

function PublicImageMapPopup({ image, navigate }: { image: PublicImage; navigate: Navigate }) {
  return <div className="public-popup"><b>{image.id}</b><small>{image.place} · {image.date}</small><p>Approved public geo-coded image · {image.asset}</p><button type="button" onClick={() => navigate('evidence')}>View public image <ArrowRight size={13}/></button></div>
}

function PublicMapWatershedPopup({ navigate }: { navigate: Navigate }) {
  return <div className="public-popup"><b>🌊 Kovilur Watershed</b><small>WS-001 · Kancheepuram</small><div><span>Area<b>2,450 ha</b></span><span>Assets<b>84</b></span><span>Geo Images<b>428</b></span><span>Development<b>82 / 100</b></span></div><p>Status: <strong>Healthy</strong></p><footer><button type="button" onClick={() => navigate('watersheds')}>Explore</button><button type="button" onClick={() => navigate('indicator')}>View Analytics</button></footer></div>
}

function PublicMapAssetPopup({ navigate }: { navigate: Navigate }) {
  return <div className="public-popup"><b>WHS-021</b><small>CHECK DAM · Kovilur</small><p>Condition: <strong>Moderate</strong><br/>Water: <strong>Poor</strong></p><footer><button type="button" onClick={() => navigate('assets')}>View Asset</button><button type="button" onClick={() => navigate('evidence')}>View Public Evidence</button></footer></div>
}

export function PublicGISExplorer({ navigate, focusImageId = null }: { navigate: Navigate; focusImageId?: string | null }) {
  const [layers, setLayers] = useState(layerDefaults)
  const toggle = (key: keyof typeof layerDefaults) => setLayers(current => ({ ...current, [key]: !current[key] }))
  const layerLabels = [['watersheds', 'Watersheds'], ['water', 'Water Bodies'], ['assets', 'Public Assets'], ['agriculture', 'Agriculture'], ['villages', 'Villages'], ['images', 'Public Geo-Coded Images']] as const
  return <div className="public-gis"><div className="public-gis-head"><span className="eyebrow">WATERSHED EXPLORER</span><h1>Explore public spatial information</h1><p>Tap a map feature to discover its public development story.</p></div><div className="leaflet-wrap"><MapContainer center={[12.979, 79.970]} zoom={12} scrollWheelZoom className="public-leaflet"><FocusPublicImage imageId={focusImageId}/><TileLayer attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" subdomains={['a', 'b', 'c']} maxZoom={19}/>{layers.watersheds && <GeoJSON data={publicWatershed} style={{ color: '#49c6dc', weight: 2, fillColor: '#2ec4c7', fillOpacity: .18 }}><Popup><PublicMapWatershedPopup navigate={navigate}/></Popup></GeoJSON>}{layers.water && <CircleMarker center={[12.979, 79.96]} radius={13} pathOptions={{ color: '#168aad', fillColor: '#74d9e8', fillOpacity: .8 }}><Popup><div className="public-popup"><b>🌊 Kovilur Water Body</b><small>Public water resource</small><p>Publicly viewable water-body location and watershed context.</p></div></Popup></CircleMarker>}{layers.assets && <CircleMarker center={[12.997, 79.985]} radius={10} pathOptions={{ color: '#f4b942', fillColor: '#f4b942', fillOpacity: .9 }}><Popup><PublicMapAssetPopup navigate={navigate}/></Popup></CircleMarker>}{layers.agriculture && <GeoJSON data={publicAgriculture} style={{ color: '#91c879', weight: 2, fillColor: '#85c26f', fillOpacity: .24 }}><Popup><div className="public-popup"><b>Kovilur Agriculture Area</b><small>Public land-use layer</small><p>Indicative agriculture coverage for watershed exploration.</p></div></Popup></GeoJSON>}{layers.villages && <CircleMarker center={[12.962, 79.94]} radius={7} pathOptions={{ color: '#2e8b57', fillColor: '#2e8b57', fillOpacity: .9 }}><Popup><div className="public-popup"><b>Kovilur Village</b><small>Public village context</small><p>Village location within the watershed area.</p></div></Popup></CircleMarker>}{layers.images && publicImages.map((image, index) => <CircleMarker key={image.id} center={image.coordinates} radius={focusImageId === image.id ? 10 : 7} pathOptions={{ color: focusImageId === image.id ? '#ffdc71' : '#0b5fa5', fillColor: '#fff', fillOpacity: 1, weight: focusImageId === image.id ? 4 : 2 }}><Popup><PublicImageMapPopup image={image} navigate={navigate}/></Popup></CircleMarker>)}</MapContainer><div className="public-layer-card"><b><Layers3 size={16}/> Public layers</b>{layerLabels.map(([key, label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={() => toggle(key)}/>{label}</label>)}</div><div className="public-map-note"><LocateFixed size={16}/>{focusImageId ? `Showing ${focusImageId} location · read-only public map` : 'Read-only public spatial information'}</div></div></div>
}

export function PublicWatershedExplorer({ navigate }: { navigate: Navigate }) {
  return <div className="page content-page public-watersheds-page"><section className="content-hero"><span className="eyebrow">PUBLIC WATERSHED EXPLORER</span><h1>Watersheds, understood.</h1><p>Explore a public sample profile with boundaries, water resources, assets, and development indicators.</p></section><article className="public-watershed-profile"><div className="public-profile-heading"><span className="public-profile-icon"><Waves size={21}/></span><div><span className="eyebrow">PUBLIC SAMPLE · WS-001</span><h2>Kovilur Watershed</h2><p>Kancheepuram · 2,450 ha</p></div><span className="public-status">Healthy</span></div><div className="public-profile-stats"><div><small>Watershed Assets</small><b>84</b></div><div><small>Public Geo Images</small><b>428</b></div><div><small>Development Indicator</small><b>82 <i>/ 100</i></b></div></div><p className="public-prototype-note">Prototype indicator for demonstration purposes. This sample profile contains public summary information only.</p><div className="public-profile-actions"><button className="primary" type="button" onClick={() => navigate('gis')}>Explore on GIS map <Map size={16}/></button><button type="button" onClick={() => navigate('indicator')}>View Development Indicator <ArrowRight size={16}/></button></div></article></div>
}

export function PublicAssetExplorer({ navigate }: { navigate: Navigate }) {
  const [showDetail, setShowDetail] = useState(false)
  return <div className="page content-page public-assets-page"><section className="content-hero"><span className="eyebrow">PUBLIC WATERSHED ASSETS</span><h1>Assets in public view.</h1><p>Explore publicly shared asset condition and water context. Internal inspection and administrative records are not shown.</p></section><article className="public-asset-profile"><div className="public-asset-visual img-0"><span><Building2 size={17}/> PUBLIC SAMPLE ASSET</span></div><div className="public-asset-copy"><span className="eyebrow">WHS-021 · KOVILUR</span><h2>Check Dam</h2><p>Public watershed asset summary</p><div className="public-asset-metrics"><span><small>Condition</small><b>Moderate</b></span><span><small>Water</small><b>Poor</b></span></div><div className="public-profile-actions"><button type="button" className="primary" onClick={() => setShowDetail(true)}>View Asset <ArrowRight size={16}/></button><button type="button" onClick={() => navigate('evidence')}>View Public Evidence <Camera size={16}/></button></div></div></article><p className="public-prototype-note">1,250 watershed assets are represented in the dashboard demo total; WHS-021 is the sample public detail record shown here.</p>{showDetail && <div className="image-modal public-asset-modal" onClick={() => setShowDetail(false)}><article onClick={event => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setShowDetail(false)} aria-label="Close asset details"><X/></button><span className="eyebrow">PUBLIC ASSET DETAIL</span><h2>WHS-021 · Check Dam</h2><p>Kovilur · Public summary only</p><div className="public-asset-metrics"><span><small>Condition</small><b>Moderate</b></span><span><small>Water</small><b>Poor</b></span></div><p className="public-prototype-note">No inspection status, officer information, internal remarks, or administrative recommendations are available in this public view.</p><button type="button" className="primary" onClick={() => { setShowDetail(false); navigate('evidence') }}>View Public Evidence <ArrowRight size={16}/></button></article></div>}</div>
}

export function PublicEvidenceExplorer({ navigate, onViewLocation }: { navigate: Navigate; onViewLocation: (id: string) => void }) {
  const [selected, setSelected] = useState<PublicImage | null>(null)
  const [comparison, setComparison] = useState<PublicImage | null>(null)
  const closeModals = () => { setSelected(null); setComparison(null) }
  return <div className="page content-page public-evidence"><section className="content-hero"><span className="eyebrow">PUBLIC GEO-CODED IMAGES</span><h1>See development<br/><i>on the ground.</i></h1><p>Approved images and public watershed context—without internal inspection details.</p></section><div className="evidence-grid">{publicImages.map((image, index) => <article className="evidence-card" key={image.id}><button type="button" className={`evidence-img img-${index}`} aria-label={`View ${image.id}`} onClick={() => setSelected(image)}><span><Camera size={16}/> Public image</span><i><Search size={17}/></i></button><div><small>{image.id}</small><h3>{image.place}</h3><p>{image.date} · {image.asset}</p><div className="public-image-stats"><span>Water <b>{image.water}</b></span><span>Condition <b>{image.condition}</b></span></div><footer><button type="button" onClick={() => setSelected(image)}>View</button><button type="button" onClick={() => onViewLocation(image.id)}>View Location</button><button type="button" onClick={() => setComparison(image)}>Compare</button></footer></div></article>)}</div>{selected && <div className="image-modal" onClick={closeModals}><article onClick={event => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Close image"> <X/></button><div className={`modal-image img-${publicImages.findIndex(image => image.id === selected.id)}`}></div><span className="eyebrow">APPROVED PUBLIC GEO-CODED IMAGE</span><h2>{selected.id} · {selected.place}</h2><p>{selected.date} · {selected.asset}</p><div className="public-image-stats"><span>Water <b>{selected.water}</b></span><span>Condition <b>{selected.condition}</b></span><span>Publicly approved</span></div><button type="button" className="primary" onClick={() => { setSelected(null); onViewLocation(selected.id) }}>View Location <Map size={16}/></button></article></div>}{comparison && <div className="image-modal public-compare-modal" onClick={closeModals}><article onClick={event => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setComparison(null)} aria-label="Close comparison"><X/></button><span className="eyebrow">PUBLIC IMAGE COMPARISON</span><h2>{comparison.asset} · {comparison.place}</h2><div className="public-comparison-grid"><div><small>Earlier public image</small><div className="public-comparison-image img-2"></div><span>02 Sep 2026</span></div><div><small>Latest public image</small><div className={`public-comparison-image img-${publicImages.findIndex(image => image.id === comparison.id)}`}></div><span>{comparison.date}</span></div></div><p className="public-prototype-note">Illustrative prototype comparison using publicly approved image examples; not an official inspection or administrative assessment.</p><button type="button" className="primary" onClick={() => { setComparison(null); navigate('gis') }}>View on public map <Map size={16}/></button></article></div>}</div>
}
