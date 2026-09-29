import { useEffect, useState, type FormEvent } from 'react'
import { assets, geoImages, inspections as sourceInspections, watersheds } from '../data/mockData'
import { useWorkflow } from '../contexts/WorkflowContext'
import type { FieldObservation } from '../types/domain'
import { Activity, AlertTriangle, ArrowRight, Camera, Check, ChevronDown, LocateFixed, Map, ShieldCheck, Upload, Waves, X } from 'lucide-react'

type Navigate = (view: 'gis' | 'evidence' | 'operations' | 'observation') => void
export type FieldObservationRecord = {
  id: string
  asset: string
  watershed: string
  coordinates: [number, number]
  capturedAt: string
  imageName: string
  water: string
  condition: string
  vegetation: string
  erosion: string
  debris: string
  remarks: string
  status: 'Pending Verification'
}
const storageKey = 'jal-impact-field-observations'
const inspections = sourceInspections.slice(0, 12).map(item => ({ id: item.id, asset: item.assetId, watershed: item.watershedId, officer: item.officer, date: item.lastInspection, condition: item.condition.charAt(0).toUpperCase() + item.condition.slice(1), priority: item.priority.charAt(0).toUpperCase() + item.priority.slice(1), status: item.status === 'Due' ? 'Scheduled' : item.status }))
function loadObservations(): FieldObservationRecord[] {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]') as FieldObservationRecord[] } catch { return [] }
}

export function GovernmentFieldOperations({ navigate, onViewOnMap, initialAssetId, onConsumeTarget, onNewObservation }: { navigate: Navigate; onViewOnMap: (coordinates?: [number, number]) => void; initialAssetId?: string | null; onConsumeTarget?: () => void; onNewObservation: (assetId: string) => void }) {
  const [observations, setObservations] = useState<FieldObservationRecord[]>(loadObservations)
  const [selected, setSelected] = useState(false)
  const [inspectionAssetId, setInspectionAssetId] = useState(initialAssetId || 'WHS-021')
  useEffect(() => { if (!initialAssetId) return; setInspectionAssetId(initialAssetId); setSelected(true); onConsumeTarget?.() }, [initialAssetId, onConsumeTarget])
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('All inspections')
  const [verified, setVerified] = useState<string[]>([])
  useEffect(() => {
    const refresh = () => setObservations(loadObservations())
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('focus', refresh) }
  }, [])
  const setToast = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 3800) }
  const visibleInspections = inspections.filter(item => filter === 'All inspections' || (filter === 'Critical' && item.priority === 'High') || (filter === 'Completed' && verified.includes(item.id)) || ((filter === 'Pending Inspections' || filter === 'Due This Week') && !verified.includes(item.id)))
  return <div className="page content-page operations-page"><section className="operations-hero"><div><span className="eyebrow">FIELD OPERATIONS</span><h1>Verification,<br/><i>where it matters.</i></h1><p>Coordinate inspections, evidence and field observations across watershed assets.</p></div><button type="button" className="primary" onClick={() => onNewObservation(inspectionAssetId)}><LocateFixed size={17}/> New field observation</button></section><section className="ops-kpis">{[['Pending Inspections',String(sourceInspections.filter(item => item.status === 'In progress').length),'blue'],['Completed',String(sourceInspections.filter(item => item.status === 'Completed').length),'green'],['Critical',String(sourceInspections.filter(item => item.priority === 'high').length),'red'],['Due This Week',String(sourceInspections.filter(item => item.status === 'Due').length),'amber']].map(([label,value,tone]) => <button type="button" key={label} className={`${tone} ${filter === label ? 'active' : ''}`} onClick={() => { setFilter(label); setToast(`${label} queue selected.`) }}><b>{value}</b><span>{label}</span><ArrowRight size={15}/></button>)}</section>{notice && <div className="toast" role="status"><Check size={15}/>{notice}</div>}<section className="inspection-table"><div className="inspection-heading"><div><span className="eyebrow">INSPECTION CENTER</span><h2>Active inspections</h2></div><button type="button" className="text-btn" onClick={() => { setFilter('Due This Week'); setToast('Showing this week’s inspection queue.') }}>This week <ChevronDown size={15}/></button></div><div className="inspection-head"><span>Inspection ID</span><span>Asset / Watershed</span><span>Officer</span><span>Last inspection</span><span>Condition</span><span>Priority</span><span>Status</span><span>Actions</span></div>{visibleInspections.map(row => <article className="inspection-row" key={row.id}><b>{row.id}</b><span><b>{row.asset}</b><small>{row.watershed}</small></span><span>{row.officer}</span><span>{row.date}</span><span className={row.condition === 'Damaged' ? 'red-text' : 'amber-text'}>{row.condition}</span><span className={row.priority === 'High' ? 'priority-high' : 'priority-medium'}>{row.priority}</span><span className="inspection-status">{verified.includes(row.id) ? 'Submitted for Review' : row.status}</span><div className="inspection-actions"><button type="button" onClick={() => { setInspectionAssetId(row.asset); setSelected(true) }}>Start Inspection</button><button type="button" onClick={() => navigate('evidence')}>View Evidence</button></div></article>)}</section>{observations.length > 0 && <section className="submitted-observations"><div className="inspection-heading"><div><span className="eyebrow">LOCAL PROTOTYPE RECORDS</span><h2>Recent field observations</h2></div><span className="observation-count">{observations.length} saved</span></div>{observations.slice(0, 5).map(record => <article className="submitted-observation" key={record.id}><span className="observation-icon"><Camera size={18}/></span><div><b>{record.id} · {record.asset}</b><small>{record.capturedAt} · {record.coordinates[0].toFixed(6)}, {record.coordinates[1].toFixed(6)}</small><span>Water {record.water} · Condition {record.condition} · {record.status}</span></div><button type="button" onClick={() => onViewOnMap(record.coordinates)}>View on map <Map size={14}/></button></article>)}</section>}{selected && <InspectionDetail assetId={inspectionAssetId} close={() => setSelected(false)} navigate={navigate} onViewOnMap={onViewOnMap} onStartObservation={onNewObservation} onSubmit={() => { const id = inspections.find(item => item.asset === inspectionAssetId)?.id || inspectionAssetId; setVerified(current => current.includes(id) ? current : [...current, id]); setSelected(false); setToast(`${id} submitted for district review.`) }} onVerify={() => { const id = inspections.find(item => item.asset === inspectionAssetId)?.id || inspectionAssetId; setVerified(current => current.includes(id) ? current : [...current, id]); setToast(`${inspectionAssetId} marked for verification.`) }}/>}</div>
}

function InspectionDetail({ assetId, close, navigate, onViewOnMap, onStartObservation, onSubmit, onVerify }: { assetId: string; close: () => void; navigate: Navigate; onViewOnMap: (coordinates?: [number, number]) => void; onStartObservation: (assetId: string) => void; onSubmit: () => void; onVerify: () => void }) {
  const asset = assets.find(item => item.id === assetId)
  const image = geoImages.find(item => item.id === asset?.latestImageId)
  const watershed = watersheds.find(item => item.id === asset?.watershedId)
  const inspection = sourceInspections.find(item => item.assetId === assetId)
  return <div className="gov-modal-backdrop inspection-backdrop" onClick={close}><aside className="inspection-drawer" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Inspection detail"><button type="button" className="drawer-close" onClick={close} aria-label="Close inspection"><X/></button><span className="eyebrow">INSPECTION DETAIL · {inspection?.id || 'NEW REVIEW'}</span><h2>{assetId}<br/><i>{asset?.type || 'Watershed asset'}</i></h2><div className="inspection-location"><LocateFixed size={17}/><span>GPS location<br/><b>{asset?.center[0].toFixed(6) || '—'}, {asset?.center[1].toFixed(6) || '—'}</b></span><button type="button" onClick={() => onViewOnMap(asset?.center)}>Open GIS <ArrowRight size={14}/></button></div><div className="inspection-images"><div className="img-0"><small>Latest image · {image?.capturedAt || 'No linked image'}</small></div><div className="img-2"><small>{watershed?.name || 'Watershed sample'} · {asset?.lastInspection || 'Review due'}</small></div></div><div className="inspection-signals">{[['Water condition',asset?.waterStatus || 'Unknown',asset?.waterStatus === 'poor' ? 'red-text' : 'amber-text'],['Structure condition',asset?.condition || 'Unknown',asset?.condition === 'damaged' || asset?.condition === 'critical' ? 'red-text' : 'amber-text'],['Vegetation','Good','green-text'],['Erosion','Possible','amber-text'],['Silt / debris','Observed','amber-text']].map(([name,value,tone]) => <div key={name}><span>{name}</span><b className={tone}>{value}</b></div>)}</div><section className="remarks"><b>Previous inspection</b><p>Outlet flow was stable; light debris noted near spillway.</p><b>Current observation</b><p>Reduced water retention visible in current geo-coded evidence.</p><b>Officer remarks</b><p>Verify after next rainfall event and assess silt removal requirement.</p></section><footer className="drawer-actions"><button type="button" onClick={() => onStartObservation(assetId)}>Start Inspection</button><button type="button" onClick={onSubmit}>Submit Inspection</button><button type="button" onClick={onVerify}>Mark for Verification</button></footer></aside></div>
}

function StatusSelector({ title, value, options, onChange }: { title: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <fieldset className="field-select"><legend>{title}</legend><div>{options.map(option => <button key={option} type="button" className={value === option ? 'selected' : ''} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div></fieldset>
}

export function FieldObservationPage({ navigate, onViewOnMap, initialAssetId, onConsumeTarget }: { navigate: Navigate; onViewOnMap: (coordinates?: [number, number]) => void; initialAssetId?: string | null; onConsumeTarget?: () => void }) {
  const workflow = useWorkflow()
  const { addObservation } = workflow
  const [fieldAssetId, setFieldAssetId] = useState(initialAssetId || workflow.selectedAssetId || 'WHS-021')
  const fieldAsset = assets.find(item => item.id === fieldAssetId) || assets.find(item => item.id === 'WHS-021')!
  useEffect(() => { if (!initialAssetId) return; setFieldAssetId(initialAssetId); onConsumeTarget?.() }, [initialAssetId, onConsumeTarget])
  const [water, setWater] = useState('Moderate')
  const [condition, setCondition] = useState('Moderate')
  const [vegetation, setVegetation] = useState('Good')
  const [erosion, setErosion] = useState('No')
  const [debris, setDebris] = useState('No')
  const [remarks, setRemarks] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [gps, setGps] = useState<[number, number]>(fieldAsset.center)
  useEffect(() => { setGps(fieldAsset.center) }, [fieldAsset.id])
  const [gpsCaptured, setGpsCaptured] = useState(false)
  const [gpsMessage, setGpsMessage] = useState('Sample GPS location loaded. Use refresh to capture this device location.')
  const [submitted, setSubmitted] = useState<FieldObservationRecord | null>(null)

  useEffect(() => { if (!preview) return; return () => URL.revokeObjectURL(preview) }, [preview])
  const captureGps = () => {
    if (!navigator.geolocation) { setGpsMessage('Device GPS is unavailable; using the sample coordinates.'); return }
    setGpsMessage('Requesting device location…')
    navigator.geolocation.getCurrentPosition(position => {
      setGps([position.coords.latitude, position.coords.longitude]); setGpsCaptured(true); setGpsMessage('Device location captured successfully.')
    }, () => setGpsMessage('Location permission unavailable; sample coordinates remain selected.'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 })
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!photo) { setError('Capture or upload a field image before submitting.'); return }
    const now = new Date()
    const capturedAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(now)
    const record: FieldObservationRecord = { id: `OBS-${String(Date.now()).slice(-6)}`, asset: `${fieldAsset.id} · ${fieldAsset.type}`, watershed: fieldAsset.watershedId, coordinates: gps, capturedAt, imageName: photo.name, water, condition, vegetation, erosion, debris, remarks: remarks.trim(), status: 'Pending Verification' }
    const all = loadObservations()
    try { localStorage.setItem(storageKey, JSON.stringify([record, ...all])) } catch { setError('Could not save this draft locally. Try a smaller image and submit again.'); return }
    const sharedRecord: FieldObservation = { id: record.id, assetId: fieldAsset.id, watershedId: fieldAsset.watershedId, capturedAt, water: water.toLowerCase(), condition: condition.toLowerCase() as FieldObservation['condition'], vegetation: vegetation.toLowerCase(), erosion: erosion === 'Yes', status: 'pending_verification', officer: 'Field Officer · Prototype', coordinates: gps, note: remarks.trim() || `Field image captured: ${record.imageName}` }
    addObservation(sharedRecord)
    setSubmitted(record)
  }

  return <div className="field-observation"><header className="field-header"><button type="button" onClick={() => navigate('operations')} aria-label="Back to inspections"><ArrowRight size={18}/></button><div><span className="eyebrow">FIELD OPERATIONS</span><h1>FIELD OBSERVATION</h1></div><button type="button" className={`gps-live ${gpsCaptured ? 'gps-captured' : ''}`} onClick={captureGps}><i></i>{gpsCaptured ? 'Location captured' : 'GPS ready · demo'}</button></header><form className="field-observation-form" onSubmit={submit}><main><section className="field-asset"><span>Asset</span><b>{fieldAsset.id} · {fieldAsset.type}</b><small><LocateFixed size={14}/> {gps[0].toFixed(6)}, {gps[1].toFixed(6)}</small><button type="button" className="gps-refresh" onClick={captureGps}><LocateFixed size={14}/> Refresh GPS</button><small className="gps-help">{gpsMessage}</small></section><label className={`capture-image ${photo ? 'has-photo' : ''}`}><Camera size={26}/><span>{photo ? photo.name : 'Capture / Upload Geo-Coded Image'}</span><small>{preview ? 'Image attached · stored locally in this prototype' : 'Camera and GPS metadata ready'}</small><input type="file" accept="image/*" capture="environment" onChange={event => { const file = event.target.files?.[0] || null; setPhoto(file); setPreview(file ? URL.createObjectURL(file) : ''); setError('') }}/></label>{preview && <div className="field-photo-preview"><img src={preview} alt="Selected field evidence preview"/><button type="button" onClick={() => { setPhoto(null); setPreview('') }}><X size={14}/> Remove image</button></div>}<section className="field-form"><StatusSelector title="Water" value={water} options={['Good','Moderate','Poor','None']} onChange={setWater}/><StatusSelector title="Condition" value={condition} options={['Good','Moderate','Damaged','Critical']} onChange={setCondition}/><StatusSelector title="Vegetation" value={vegetation} options={['Good','Moderate','Poor']} onChange={setVegetation}/><div className="field-duo"><StatusSelector title="Erosion" value={erosion} options={['Yes','No']} onChange={setErosion}/><StatusSelector title="Silt / Debris" value={debris} options={['Yes','No']} onChange={setDebris}/></div><label className="remarks-input">Remarks<textarea value={remarks} onChange={event => setRemarks(event.target.value)} placeholder="Add field observation notes for verification..."/></label></section>{error && <p className="field-form-error" role="alert">{error}</p>}<button type="submit" className="submit-observation"><Check size={18}/> SUBMIT FIELD OBSERVATION</button><p className="field-save-note"><ShieldCheck size={14}/> Saves a local prototype record as Pending Verification; no external submission is made.</p></main></form>{submitted && <FieldObservationSuccess record={submitted} close={() => setSubmitted(null)} navigate={navigate} onViewOnMap={onViewOnMap}/>}</div>
}

function FieldObservationSuccess({ record, close, navigate, onViewOnMap }: { record: FieldObservationRecord; close: () => void; navigate: Navigate; onViewOnMap: (coordinates?: [number, number]) => void }) {
  return <div className="image-modal success-modal" onClick={close}><article onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Observation submitted"><span className="success-check"><Check size={34}/></span><span className="eyebrow">OBSERVATION SUBMITTED</span><h2>{record.asset.split(' · ')[0]}</h2><p>Geo-coded evidence successfully recorded in this browser session.</p><div className="success-meta"><span>GPS <b>{record.coordinates[0].toFixed(6)}, {record.coordinates[1].toFixed(6)}</b></span><span>Time <b>{record.capturedAt} IST</b></span><span>Asset <b>{record.asset}</b></span><span>Status <b>{record.status}</b></span></div><p className="success-image-name"><Camera size={14}/> {record.imageName}</p><footer><button type="button" onClick={() => { close(); navigate('operations') }}>View Observation</button><button type="button" onClick={() => { close(); onViewOnMap(record.coordinates) }}>View on Map</button></footer></article></div>
}
