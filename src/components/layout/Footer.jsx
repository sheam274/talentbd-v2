import React from 'react'
import { NavLink } from 'react-router-dom'
import { Zap, Github, Linkedin, Mail } from 'lucide-react'

const style = `
.footer{border-top:1px solid var(--color-border);background:var(--color-bg-card);padding:48px 0 24px;margin-top:80px}
.footer__inner{display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:start}
.footer__logo{display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-size:1.1rem;font-weight:600;color:var(--color-text);margin-bottom:12px}
.footer__logo strong{color:var(--color-primary)}
.footer__logo-icon{width:28px;height:28px;background:var(--color-primary);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#0a0d12}
.footer__tagline{font-size:.85rem;color:var(--color-text-muted);line-height:1.7}
.footer__links h4{font-family:var(--font-display);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--color-text-faint);margin-bottom:12px}
.footer__links ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.footer__links a{font-size:.875rem;color:var(--color-text-muted);transition:color var(--transition)}
.footer__links a:hover{color:var(--color-primary)}
.footer__bottom{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding-top:24px;border-top:1px solid var(--color-border-soft);font-size:.78rem;color:var(--color-text-faint)}
.footer__socials{display:flex;gap:18px}
.footer__socials a{color:var(--color-text-faint);transition:color var(--transition)}
.footer__socials a:hover{color:var(--color-primary)}
@media(max-width:600px){.footer__inner{grid-template-columns:1fr}.footer__bottom{flex-direction:column;gap:12px;text-align:center}}
`

export default function Footer() {
  return (
    <>
      <style>{style}</style>
      <footer className="footer">
        <div className="container footer__inner">
          <div>
            <NavLink to="/" className="footer__logo">
              <div className="footer__logo-icon"><Zap size={14} /></div>
              <span>Talent<strong>BD</strong></span>
            </NavLink>
            <p className="footer__tagline">Bangladesh's smartest career platform.<br />Build, analyze, and grow your career.</p>
          </div>
          <div className="footer__links">
            <h4>Platform</h4>
            <ul>
              {[['Live Jobs','/jobs'],['CV Builder','/cv-builder'],['CV Analyzer','/cv-analyzer'],['Learning Hub','/learning']].map(([l,t]) => (
                <li key={t}><NavLink to={t}>{l}</NavLink></li>
              ))}
            </ul>
          </div>
          <div className="footer__bottom">
            <span>© 2026 TalentBD — CSE Final Year Project By Sheam/CSE 21</span>
            <div className="footer__socials">
              <a href="#" aria-label="GitHub"><Github size={16} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <a href="#" aria-label="Email"><Mail size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
