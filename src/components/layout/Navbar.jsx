import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, FileText, Search, BookOpen, Menu, X, Zap, Shield, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/jobs',        label: 'Live Jobs',    icon: Briefcase },
  { to: '/cv-builder',  label: 'CV Builder',   icon: FileText  },
  { to: '/cv-analyzer', label: 'CV Analyzer',  icon: Search    },
  { to: '/learning',    label: 'Learning Hub', icon: BookOpen  },
]

const style = `
.navbar{position:sticky;top:0;z-index:100;height:68px;background:rgba(10,13,18,0.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid transparent;transition:all .3s ease}
.navbar--scrolled{background:rgba(10,13,18,0.94);border-bottom-color:var(--color-border)}
.navbar__inner{display:flex;align-items:center;height:100%;gap:32px}
.navbar__logo{display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-size:1.15rem;font-weight:600;color:var(--color-text);white-space:nowrap}
.navbar__logo strong{color:var(--color-primary)}
.navbar__logo-icon{width:30px;height:30px;background:var(--color-primary);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#0a0d12}
.navbar__links{display:flex;align-items:center;gap:4px;list-style:none;flex:1}
.navbar__link{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--radius-sm);font-size:0.875rem;font-weight:500;color:var(--color-text-muted);transition:all var(--transition)}
.navbar__link:hover{color:var(--color-text);background:var(--color-bg-elevated)}
.navbar__link--active{color:var(--color-primary);background:var(--color-primary-dim)}
.navbar__actions{display:flex;align-items:center;gap:12px;margin-left:auto}
.navbar__cta{font-size:0.85rem;padding:8px 18px}
.navbar__login{font-size:0.875rem}
.navbar__hamburger{display:none;padding:8px;color:var(--color-text-muted);border-radius:var(--radius-sm)}
.navbar__hamburger:hover{color:var(--color-text)}
.navbar__mobile{display:flex;flex-direction:column;gap:4px;padding:16px 20px 20px;border-top:1px solid var(--color-border);background:rgba(10,13,18,.98);animation:fadeIn .2s ease}
.navbar__mobile-link{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:var(--radius-md);font-size:.95rem;color:var(--color-text-muted);transition:all var(--transition)}
.navbar__mobile-link:hover,.navbar__mobile-link--active{color:var(--color-primary);background:var(--color-primary-dim)}
.navbar__user{position:relative;display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 10px;border-radius:var(--radius-md);transition:background var(--transition)}
.navbar__user:hover{background:var(--color-bg-elevated)}
.navbar__avatar{width:32px;height:32px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:.85rem;color:#0a0d12;flex-shrink:0}
.navbar__username{font-size:.875rem;font-weight:500;color:var(--color-text)}
.navbar__dropdown{position:absolute;top:calc(100% + 8px);right:0;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:8px;min-width:210px;box-shadow:var(--shadow-card);z-index:200;animation:fadeUp .15s ease}
.navbar__dropdown-header{padding:10px 12px 8px;border-bottom:1px solid var(--color-border-soft);margin-bottom:6px}
.navbar__dropdown-header strong{display:block;font-size:.875rem;color:var(--color-text)}
.navbar__dropdown-header span{font-size:.75rem;color:var(--color-text-muted)}
.navbar__dropdown-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border-radius:var(--radius-sm);font-size:.875rem;color:var(--color-text-muted);transition:all var(--transition);text-align:left}
.navbar__dropdown-item:hover{background:var(--color-bg-elevated);color:var(--color-text)}
.navbar__dropdown-item--danger:hover{color:var(--color-error);background:rgba(248,113,113,.08)}
@media(max-width:768px){.navbar__links,.navbar__cta,.navbar__login{display:none}.navbar__hamburger{display:flex}}
`

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { user, userProfile, isAdmin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropRef  = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenu(false) }, [location])

  // Close dropdown when clicking outside
  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <>
      <style>{style}</style>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          <NavLink to="/" className="navbar__logo">
            <div className="navbar__logo-icon"><Zap size={16} /></div>
            <span>Talent<strong>BD</strong></span>
          </NavLink>

          <ul className="navbar__links">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                  <Icon size={15} />{label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                  <Shield size={15} />Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="navbar__actions">
            {user ? (
              <div className="navbar__user" ref={dropRef} onClick={() => setUserMenu(v => !v)}>
                <div className="navbar__avatar">{userProfile?.name?.charAt(0).toUpperCase() || '?'}</div>
                <span className="navbar__username">{userProfile?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
                {userMenu && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <strong>{userProfile?.name}</strong>
                      <span>{userProfile?.email}</span>
                    </div>
                    {isAdmin && (
                      <NavLink to="/admin" className="navbar__dropdown-item">
                        <Shield size={14} />Admin Dashboard
                      </NavLink>
                    )}
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                      <LogOut size={14} />Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login"  className="btn btn-ghost navbar__login">Sign In</NavLink>
                <NavLink to="/signup" className="btn btn-primary navbar__cta">Get Started</NavLink>
              </>
            )}
            <button className="navbar__hamburger" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="navbar__mobile">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}>
                <Icon size={16} />{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className="navbar__mobile-link"><Shield size={16} />Admin Panel</NavLink>
            )}
            <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 0' }} />
            {user
              ? <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={handleLogout}><LogOut size={16} />Sign Out</button>
              : <><NavLink to="/login" className="btn btn-outline">Sign In</NavLink><NavLink to="/signup" className="btn btn-primary" style={{ marginTop: 8 }}>Get Started</NavLink></>
            }
          </div>
        )}
      </nav>
    </>
  )
}
