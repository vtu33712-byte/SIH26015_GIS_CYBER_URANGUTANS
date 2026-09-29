import { useEffect, useMemo, useRef, useState } from 'react'
import { DomEvent } from 'leaflet'
import { CircleMarker, Polyline, useMap, useMapEvents } from 'react-leaflet'
import { Activity, LocateFixed, Maximize2, Minus, Plus, Ruler, X } from 'lucide-react'

type Point = [number, number]

export function GovernmentMapControls() {
  const map = useMap()
  const toolbar = useRef<HTMLDivElement>(null)
  const [measuring, setMeasuring] = useState(false)
  const [points, setPoints] = useState<Point[]>([])
  const [message, setMessage] = useState('')
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!toolbar.current) return
    DomEvent.disableClickPropagation(toolbar.current)
    DomEvent.disableScrollPropagation(toolbar.current)
  }, [])

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === map.getContainer())
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [map])

  useMapEvents({
    click(event) {
      if (!measuring) return
      const target = event.originalEvent.target as HTMLElement | null
      if (target?.closest('.gov-map-tools')) return
      setPoints(current => [...current, [event.latlng.lat, event.latlng.lng]])
    },
  })

  const distanceMeters = useMemo(() => points.slice(1).reduce((sum, point, index) => sum + map.distance(points[index], point), 0), [points, map])
  const distanceLabel = distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${Math.round(distanceMeters)} m`
  const showMessage = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 3500)
  }

  const locate = () => {
    if (!navigator.geolocation) {
      map.flyTo([12.979, 79.970], 14, { duration: .8 })
      showMessage('Location is unavailable; centered on WS-001.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        map.flyTo([position.coords.latitude, position.coords.longitude], 15, { duration: .8 })
        showMessage('Map centered on your current location.')
      },
      () => {
        map.flyTo([12.979, 79.970], 14, { duration: .8 })
        showMessage('Location access unavailable; centered on WS-001.')
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    )
  }

  const toggleFullscreen = async () => {
    const container = map.getContainer()
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await container.requestFullscreen()
    } catch {
      showMessage('Fullscreen is not available in this browser.')
    }
  }

  return <>
    <div ref={toolbar} className="gov-map-tools" role="toolbar" aria-label="Map controls">
      <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => map.zoomIn()}><Plus size={16}/></button>
      <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => map.zoomOut()}><Minus size={16}/></button>
      <button type="button" title="Locate" aria-label="Center map on current location" onClick={locate}><LocateFixed size={16}/></button>
      <button type="button" title={measuring ? 'Stop measuring' : 'Measure distance'} aria-label={measuring ? 'Stop measuring' : 'Measure distance'} aria-pressed={measuring} className={measuring ? 'measure-active' : ''} onClick={() => { setMeasuring(value => !value); setPoints([]) }}><Ruler size={16}/></button>
      <button type="button" title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}><Maximize2 size={15}/></button>
    </div>
    {measuring && <div className="gov-measure-readout"><b><Activity size={13}/> Distance measure</b><span>{points.length < 2 ? 'Click map to add points' : `${points.length} points · ${distanceLabel}`}</span><button type="button" onClick={() => setPoints([])}>Clear <X size={12}/></button></div>}
    {message && <div className="gov-tool-message" role="status">{message}</div>}
    {points.length > 1 && <Polyline positions={points} pathOptions={{ color: '#31c5d3', weight: 3, dashArray: '6 5' }}/>}
    {points.map((point, index) => <CircleMarker key={`measure-${index}`} center={point} radius={5} pathOptions={{ color: '#06263c', fillColor: '#7fe7ec', fillOpacity: 1, weight: 2 }}/>) }
  </>
}
