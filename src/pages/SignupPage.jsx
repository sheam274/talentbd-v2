import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Zap, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const authStyle = `
.auth-page{min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:32px 16px;background:radial-gradient(ellipse 60% 50% at 30% 40%,rgba(45,212,191,.06) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 70% 60%,rgba(249,115,22,.04) 0%,transparent 70%)}
.auth-card{width:100%;max-width:420px;padding:36px;display:flex;flex-direction:column;gap:20px}
.auth-card--wide{max-width:640px}
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
.auth-role-btn--active svg,.auth-role-btn--active span{color:var(--color-primary)}
.auth-switch{text-align:center;font-size:.875rem;color:var(--color-text-muted)}
.auth-switch a{color:var(--color-primary);font-weight:600}
`

const ERR_MAP = {
  'auth/email-already-in-use':'Email already registered.',
  'auth/invalid-email':'Invalid email address.',
  'auth/weak-password':'Password is too weak (min 6 chars).',
}
const ADMIN_CODE = 'TALENTBD2025'

export default function SignupPage() {
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirm:'', role:'user' })
  const [show, setShow]   = useState(false)
  const [code, setCode]   = useState('')
  const [err,  setErr]    = useState('')
  const [load, setLoad]   = useState(false)
  const { signup }        = useAuth()
  const nav               = useNavigate()

  const up = (k,v) => setForm(f=>({...f,[k]:v}))

  const validate = () => {
    if (!form.name.trim())    return 'Full name is required.'
    if (!form.email.trim())   return 'Email is required.'
    if (form.password.length<6) return 'Password must be at least 6 characters.'
    if (form.password!==form.confirm) return 'Passwords do not match.'
    if (form.role==='admin'&&code!==ADMIN_CODE) return 'Invalid admin access code.'
    return null
  }

  const submit = async e => {
    e.preventDefault()
    const e2 = validate(); if (e2) return setErr(e2)
    setLoad(true); setErr('')
    try { await signup(form.email, form.password, form.name, form.role); nav(form.role==='admin'?'/admin':'/') }
    catch(e) { setErr(ERR_MAP[e.code]||'Signup failed. Please try again.') }
    finally { setLoad(false) }
  }

  return (
    <>
      <style>{authStyle}</style>
      <div className="auth-page">
        <div className="card auth-card auth-card--wide animate-fade-up">
          <div className="auth-logo"><div className="auth-logo__icon"><Zap size={16}/></div><span>Talent<strong>BD</strong></span></div>
          <div className="auth-head"><h1>Create your account</h1><p>Join thousands of Bangladeshi professionals</p></div>

          <div className="auth-role-grid">
            {[{role:'user',icon:User,label:'Job Seeker',desc:'Find jobs, build CV, learn skills'},
              {role:'admin',icon:Shield,label:'Admin',desc:'Manage platform content'}].map(({role,icon:Icon,label,desc})=>(
              <button key={role} type="button" className={`auth-role-btn ${form.role===role?'auth-role-btn--active':''}`} onClick={()=>up('role',role)}>
                <Icon size={20}/><span>{label}</span><small>{desc}</small>
              </button>
            ))}
          </div>

          {err && <div className="auth-err"><AlertCircle size={14}/><span>{err}</span></div>}

          <form className="auth-form" onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name</label><div className="auth-iw"><User size={14} className="ai"/><input className="form-input auth-input" placeholder="Your full name" value={form.name} onChange={e=>up('name',e.target.value)}/></div></div>
              <div className="form-group"><label className="form-label">Email</label><div className="auth-iw"><Mail size={14} className="ai"/><input className="form-input auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>up('email',e.target.value)}/></div></div>
              <div className="form-group"><label className="form-label">Password</label><div className="auth-iw"><Lock size={14} className="ai"/><input className={`form-input auth-input auth-input--pwd`} type={show?'text':'password'} placeholder="Min 6 characters" value={form.password} onChange={e=>up('password',e.target.value)}/><button type="button" className="auth-eye" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={13}/>:<Eye size={13}/>}</button></div></div>
              <div className="form-group"><label className="form-label">Confirm Password</label><div className="auth-iw"><Lock size={14} className="ai"/><input className="form-input auth-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e=>up('confirm',e.target.value)}/></div></div>
            </div>
            {form.role==='admin' && (
              <div className="form-group">
                <label className="form-label">Admin Access Code</label>
                <div className="auth-iw"><Shield size={14} className="ai"/><input className="form-input auth-input" placeholder="Enter admin code" value={code} onChange={e=>setCode(e.target.value)}/></div>
                <small style={{fontSize:'.75rem',color:'var(--color-text-faint)'}}>Contact the platform owner for the admin access code.</small>
              </div>
            )}
            <button type="submit" className="btn btn-primary auth-submit" disabled={load}>
              {load?<><div className="spinner" style={{width:15,height:15}}/>Creating account…</>:'Create Account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </>
  )
}
