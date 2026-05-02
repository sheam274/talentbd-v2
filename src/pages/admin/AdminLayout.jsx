import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users, BookOpen, LogOut, Menu, X, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const style = `
.adm-shell{display:grid;grid-template-columns:240px 1fr;min-height:100vh;background:var(--color-bg)}
.adm-shell--col{grid-template-columns:64px 1fr}
.adm-side{background:var(--color-bg-card);border-right:1px solid var(--color-border);display:flex;flex-direction:column;padding:16px 0;position:sticky;top:0;height:100vh;overflow-y:auto;transition:all var(--transition)}
.adm-side__top{display:flex;align-items:center;justify-content:space-between;padding:0 16px 16px;border-bottom:1px solid var(--color-border-soft);margin-bottom:12px}
.adm-logo{display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-size:1rem;font-weight:700;color:var(--color-text)}
.adm-logo strong{color:var(--color-primary)}
.adm-logo-icon{width:28px;height:28px;background:var(--color-primary);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#0a0d12;flex-shrink:0}
.adm-toggle{color:var(--color-text-muted);padding:6px;border-radius:6px;transition:all var(--transition)}
.adm-toggle:hover{color:var(--color-text);background:var(--color-bg-elevated)}
.adm-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-text-faint);padding:0 16px 8px}
.adm-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px;flex:1}
.adm-link{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--radius-md);font-size:.875rem;font-weight:500;color:var(--color-text-muted);transition:all var(--transition);white-space:nowrap}
.adm-link:hover{color:var(--color-text);background:var(--color-bg-elevated)}
.adm-link--active{background:var(--color-primary-dim);color:var(--color-primary)}
.adm-bottom{padding:16px 10px 0;border-top:1px solid var(--color-border-soft);margin-top:auto;display:flex;flex-direction:column;gap:10px}
.adm-user{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius-md);background:var(--color-bg-elevated)}
.adm-av{width:32px;height:32px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:.85rem;color:#0a0d12;flex-shrink:0}
.adm-uname{font-size:.82rem;font-weight:600;color:var(--color-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adm-urole{font-size:.7rem;color:var(--color-primary)}
.adm-logout{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--radius-md);font-size:.875rem;color:var(--color-text-muted);transition:all var(--transition);width:100%}
.adm-logout:hover{color:var(--color-error);background:rgba(248,113,113,.08)}
.adm-main{padding:32px;overflow-y:auto;min-height:100vh}
.adm-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.adm-page-head h1{font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--color-text);margin-bottom:4px}
.adm-page-head p{font-size:.85rem;color:var(--color-text-muted)}
@media(max-width:768px){.adm-shell{grid-template-columns:1fr}.adm-side{display:none}.adm-main{padding:20px}}
`

const NAV = [
  { to:'/admin',        label:'Dashboard', icon:LayoutDashboard, end:true },
  { to:'/admin/jobs',   label:'Jobs',      icon:Briefcase },
  { to:'/admin/users',  label:'Users',     icon:Users },
  { to:'/admin/videos', label:'Videos',    icon:BookOpen },
]

export default function AdminLayout() {
  const [col, setCol] = useState(false)
  const { userProfile, logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = async () => { await logout(); nav('/login') }

  return (
    <>
      <style>{style}</style>
      <div className={`adm-shell ${col?'adm-shell--col':''}`}>
        <aside className="adm-side">
          <div className="adm-side__top">
            <div className="adm-logo">
              <div className="adm-logo-icon"><Zap size={14}/></div>
              {!col && <span>Talent<strong>BD</strong></span>}
            </div>
            <button className="adm-toggle" onClick={()=>setCol(v=>!v)}>
              {col?<ChevronRight size={16}/>:<Menu size={16}/>}
            </button>
          </div>
          {!col && <p className="adm-label">Admin Panel</p>}
          <nav className="adm-nav">
            {NAV.map(({to,label,icon:Icon,end})=>(
              <NavLink key={to} to={to} end={end}
                className={({isActive})=>`adm-link ${isActive?'adm-link--active':''}`}
                title={col?label:undefined}>
                <Icon size={18}/>{!col&&<span>{label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="adm-bottom">
            {!col && userProfile && (
              <div className="adm-user">
                <div className="adm-av">{userProfile.name?.charAt(0).toUpperCase()||'A'}</div>
                <div style={{overflow:'hidden'}}><div className="adm-uname">{userProfile.name}</div><div className="adm-urole">Administrator</div></div>
              </div>
            )}
            <button className="adm-logout" onClick={handleLogout} title="Sign out">
              <LogOut size={15}/>{!col&&<span>Sign Out</span>}
            </button>
          </div>
        </aside>
        <main className="adm-main"><Outlet/></main>
      </div>
    </>
  )
}
