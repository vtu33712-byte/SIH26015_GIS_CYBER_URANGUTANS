import { Activity, ArrowRight, Bell, Building2, Camera, FileText, Layers3, LogOut, Map, Moon, ShieldCheck, Sun, Waves } from 'lucide-react'
import type { AppView } from '../routes/routes'
import type { UserRole } from '../types/domain'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './ui/sheet'

type Props = { open: boolean; onClose: () => void; role: UserRole; governmentRole?: string | null; theme: string; onCycleTheme: () => void; onNavigate: (view: AppView) => void; onLogout: () => void }
export function ControlCenter({ open, onClose, role, governmentRole, theme, onCycleTheme, onNavigate, onLogout }: Props) {
  const actions: Array<{label:string;view:AppView;icon:typeof Waves;public?:boolean;roles?:string[]}> = [
    {label:'Dashboard',view:'overview',icon:Waves,public:true},{label:'GIS map',view:'gis',icon:Layers3,public:true},{label:'Watersheds',view:'watersheds',icon:Map,public:true},{label:'Evidence',view:'evidence',icon:Camera,public:true},
    {label:'Spatial analytics',view:'insights',icon:Activity,roles:['administrator','district_officer']},{label:'Inspections',view:'operations',icon:ShieldCheck,roles:['administrator','district_officer','field_officer']},{label:'Alerts',view:'alerts',icon:Bell,roles:['administrator','district_officer','field_officer']},{label:'Reports',view:'reports',icon:FileText,public:true,roles:['administrator','district_officer']},
  ]
  const visible = actions.filter(item => role === 'public' ? item.public : item.roles?.includes(governmentRole || 'field_officer'))
  const themeLabel = theme === 'water' ? 'Ocean glass' : theme === 'dark' ? 'Midnight' : 'Daylight'
  const ThemeIcon = theme === 'water' ? Waves : theme === 'dark' ? Moon : Sun
  return <Sheet open={open} onOpenChange={value => !value && onClose()}>
    <SheetContent side="right" className="control-center-sheet"><span className="eyebrow">QUICK CONTROLS</span><SheetTitle className="control-center-title">Control Center</SheetTitle><SheetDescription>Session controls and one-tap navigation for the watershed workspace.</SheetDescription>
      <button type="button" className="control-center-theme" onClick={onCycleTheme}><span className="control-theme-icon"><ThemeIcon size={20}/></span><span><b>Appearance</b><small>{themeLabel} · tap to switch theme</small></span><ArrowRight size={16}/></button>
      <div className="control-center-section"><div><h3>Quick access</h3><small>{role === 'government' ? 'Authorized workspace' : 'Public workspace'}</small></div><div className="control-center-grid">{visible.map(({label,view,icon:Icon})=><Button key={view} variant="secondary" onClick={()=>{onNavigate(view);onClose()}}><Icon size={17}/><span>{label}</span></Button>)}</div></div>
      <div className="control-center-session"><span className="session-orb"><Building2 size={18}/></span><div><b>{role === 'government' ? `${(governmentRole || 'district_officer').replaceAll('_',' ')}` : 'Public portal'}</b><small>{role === 'government' ? 'Authorized demo session' : 'Read-only public access'} · Kandhamal region</small></div><span className="session-live">LOCAL DEMO</span></div>
      <p className="control-center-note">Prototype mode · Changes are stored locally in this browser. No backend services or official records are submitted.</p>
      <Button variant="ghost" className="control-center-signout" onClick={()=>{onClose();onLogout()}}><LogOut size={17}/> Sign out</Button>
    </SheetContent>
  </Sheet>
}
