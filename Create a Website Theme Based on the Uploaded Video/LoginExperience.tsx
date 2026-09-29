import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, LockKeyhole } from 'lucide-react'
import { GovernmentRole, UserRole, useAuth } from '../auth'
import { useNavigate } from 'react-router-dom'

function LoginBrand() {
  return <div className="brand"><div className="mark"><span></span><i></i><b></b></div><div><strong>JAL-IMPACT</strong><small>Geospatial Watershed Intelligence</small></div></div>
}

export function LoginExperience() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('public')
  const [governmentRole, setGovernmentRole] = useState<GovernmentRole>('district_officer')
  const [email, setEmail] = useState('public@jalimpact.demo')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')
  const chooseRole = (next: UserRole) => {
    setRole(next)
    setEmail(next === 'government' ? 'officer@jalimpact.gov.demo' : 'public@jalimpact.demo')
    setPassword('demo123')
    setError('')
  }
  const enter = (selected: UserRole) => {
    login(selected, governmentRole)
    navigate('/', { replace: true })
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const expected = role === 'government' ? 'officer@jalimpact.gov.demo' : 'public@jalimpact.demo'
    if (email.trim().toLowerCase() !== expected || password !== 'demo123') {
      setError('Use the demo credentials shown for this prototype role.')
      return
    }
    setError('')
    enter(role)
  }
  return <main className={role === 'government' ? 'login government-login' : 'login'}>
    <section className="login-visual"><div className="login-map-grid"></div><div className="login-river r-one"></div><div className="login-river r-two"></div><div className="login-contours"></div><div className="login-brand"><LoginBrand/><span className="eyebrow">NATIONAL WATERSHED INTELLIGENCE</span><h1>From Geo-Coded Images<br/>to <i>Watershed Intelligence.</i></h1><p>Geospatial Watershed Development Monitoring &amp; Decision Support Platform</p></div><div className="login-signal"><span className="pulse"></span> Live environmental monitoring</div></section>
    <section className="login-panel"><div className="login-inner"><span className="eyebrow">{role === 'government' ? 'SECURE GOVERNMENT ACCESS' : 'WELCOME TO JAL-IMPACT'}</span><h2>Choose your portal</h2><p className="login-lead">Select how you want to experience watershed intelligence.</p>
      <div className="role-cards"><button type="button" className={role === 'public' ? 'login-role selected' : 'login-role'} onClick={() => chooseRole('public')}><span className="role-icon">👤</span><div><b>PUBLIC USER</b><small>Explore watershed data and development insights</small></div>{role === 'public' && <Check size={17}/>}</button><button type="button" className={role === 'government' ? 'login-role selected government' : 'login-role'} onClick={() => chooseRole('government')}><span className="role-icon">🏛️</span><div><b>GOVERNMENT USER</b><small>Monitor, inspect and manage watershed assets</small></div>{role === 'government' && <Check size={17}/>}</button></div>
      <form className="login-form" onSubmit={submit}><div className="form-title"><b>{role === 'government' ? 'Government User Login' : 'Public User'}</b><span>Demo credentials for prototype presentation.</span></div>
        <label>{role === 'government' ? 'Official Email' : 'Email / Mobile Number'}<input autoComplete="username" value={email} onChange={event => { setEmail(event.target.value); setError('') }}/></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => { setPassword(event.target.value); setError('') }}/></label>
        {role === 'government' && <label>Government role<select value={governmentRole} onChange={event => setGovernmentRole(event.target.value as GovernmentRole)}><option value="administrator">Administrator</option><option value="district_officer">District Officer</option><option value="field_officer">Field Officer</option></select></label>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <button type="submit" className="login-submit">{role === 'government' ? <><LockKeyhole size={17}/> Secure Government Login</> : <>Login <ArrowRight size={17}/></>}</button>
        {role === 'public' && <button type="button" className="guest" onClick={() => enter('public')}>Continue as Guest</button>}
        {role === 'government' && <div className="security-note"><LockKeyhole size={17}/><span><b>Authorized Government Access</b>Restricted monitoring and field-operation features are available only to authorized personnel.</span></div>}
      </form>
      <div className="demo-actions"><button type="button" onClick={() => enter('public')}>Try Public Demo</button><button type="button" onClick={() => enter('government')}>Try Government Demo</button></div>
    </div></section>
  </main>
}
