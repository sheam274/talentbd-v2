// LoginPage
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const authStyle = `
.auth-page{min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:32px 16px;background:radial-gradient(ellipse 60% 50% at 30% 40%,rgba(45,212,191,.06) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 70% 60%,rgba(249,115,22,.04) 0%,transparent 70%)}
.auth-card{width:100%;max-width:420px;padding:36px;display:flex;flex-direction:column;gap:20px}
.auth-card--wide{max-width:620px}
.auth-logo{display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-size:1.1rem;font-weight:600;color:var(--color-text);justify-content:center}
.auth-logo strong{color:var(--color-primary)}
.auth-logo__icon{width:30px;height:30px;background:var(--color-primary);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#0a0d12}
.auth-head{text-align:center}
.auth-head h1{font-family:var(--font-display);font-size:1.55rem;font-weight:800;color:var(--color-text);margin-bottom:6px}
.auth-head p{font-size:.875rem;color:var(--color-text-muted)}
.auth-err{display:flex;align-items:center;gap:8px;background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.22);border-radius:var(--radius-md);padding:11px 14px;font-size:.85rem;color:var(--color-error)}
.auth-form{display:flex;flex-direction:column;gap:14px}
.auth-iw{position:relative}
.auth-iw svg.ai{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--color-text-faint);pointer-events:none}
.auth-input{padding-left:38px!important}
.auth-input--pwd{padding-right:38px!important}
.auth-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--color-text-faint);padding:3px;transition:color var(--transition)}
.auth-eye:hover{color:var(--color-text)}
.auth-submit{width:100%;justify-content:center;padding:12px;font-size:1rem;margin-top:6px}
.auth-role-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.auth-role-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px;border:2px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-elevated);color:var(--color-text-muted);transition:all var(--transition);cursor:pointer}
.auth-role-btn span{font-family:var(--font-display);font-size:.9rem;font-weight:700;color:var(--color-text)}
.auth-role-btn small{font-size:.72rem;color:var(--color-text-faint);text-align:center}
.auth-role-btn--active{border-color:var(--color-primary);background:var(--color-primary-dim);color:var(--color-primary)}
.auth-role-btn--active span{color:var(--color-primary)}
.auth-demo{background:var(--color-bg-elevated);border-radius:var(--radius-md);padding:10px;text-align:center;font-size:.78rem;color:var(--color-text-muted)}
.auth-demo code{background:var(--color-bg);padding:1px 6px;border-radius:4px;font-size:.75rem;color:var(--color-primary)}
.auth-switch{text-align:center;font-size:.875rem;color:var(--color-text-muted)}
.auth-switch a{color:var(--color-primary);font-weight:600}
`

const ERR_MAP = {
  'auth/user-not-found':'No account with this email.','auth/wrong-password':'Incorrect password.',
  'auth/invalid-email':'Invalid email address.','auth/too-many-requests':'Too many attempts. Try later.',
  'auth/email-already-in-use':'Email already registered.','auth/weak-password':'Password too weak.',
  'auth/invalid-credential':'Invalid email or password.',
}

export function LoginPage() {
  const [form, setForm]   = useState({ email:'', password:'' })
  const [show, setShow]   = useState(false)
  const [err,  setErr]    = useState('')
  const [load, setLoad]   = useState(false)
  const { login }         = useAuth()
  const nav               = useNavigate()

  const submit = async e => {
    e.preventDefault()
    if (!form.email||!form.password) return setErr('Please fill in all fields.')
    setLoad(true); setErr('')
    try { await login(form.email, form.password); nav('/') }
    catch(e) { setErr(ERR_MAP[e.code]||'Login failed. Please try again.') }
    finally { setLoad(false) }
  }

  return (
    <>
      <style>{authStyle}</style>
      <div className="auth-page">
        <div className="card auth-card animate-fade-up">
          <div className="auth-logo"><div className="auth-logo__icon"><Zap size={16}/></div><span>Talent<strong>BD</strong></span></div>
          <div className="auth-head"><h1>Welcome back</h1><p>Sign in to your TalentBD account</p></div>
          {err && <div className="auth-err"><AlertCircle size={14}/><span>{err}</span></div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="auth-iw"><Mail size={15} className="ai"/><input className="form-input auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-iw"><Lock size={15} className="ai"/><input className={`form-input auth-input auth-input--pwd`} type={show?'text':'password'} placeholder="Your password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/><button type="button" className="auth-eye" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={14}/>:<Eye size={14}/>}</button></div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={load}>
              {load?<><div className="spinner" style={{width:15,height:15}}/>Signing in…</>:'Sign In'}
            </button>
          </form>
          <div className="auth-demo"><p>🔐 Demo admin: <code>admin@talentbd.com</code> / <code>admin123</code></p></div>
          <p className="auth-switch">Don't have an account? <Link to="/signup">Create one free</Link></p>
        </div>
      </div>
    </>
  )
}

export default LoginPage
