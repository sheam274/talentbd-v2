import React from 'react'
import { NavLink } from 'react-router-dom'
import { Briefcase, FileText, Search, BookOpen, ArrowRight, CheckCircle, Users, TrendingUp, Zap } from 'lucide-react'

const style = `
.hero{position:relative;padding:96px 0 80px;overflow:hidden}
.hero__bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 20% 30%,rgba(45,212,191,.08) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 80% 60%,rgba(249,115,22,.06) 0%,transparent 70%);pointer-events:none}
.hero__inner{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px}
.hero__title{font-family:var(--font-display);font-size:clamp(2.8rem,7vw,5.5rem);font-weight:800;line-height:1.05;letter-spacing:-.03em;color:var(--color-text)}
.hero__accent{background:linear-gradient(135deg,#2dd4bf,#5eead4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero__sub{max-width:580px;font-size:clamp(1rem,2vw,1.15rem);color:var(--color-text-muted);line-height:1.75}
.hero__btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.hero__cta{padding:12px 32px;font-size:1rem}
.hero__checks{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.hero__check{display:flex;align-items:center;gap:6px;font-size:.85rem;color:var(--color-text-muted)}
.hero__check svg{color:var(--color-success)}
.stats-bar{border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border);background:var(--color-bg-card);padding:24px 0}
.stats-bar__inner{display:flex;justify-content:center;gap:64px;flex-wrap:wrap}
.stat-item{display:flex;align-items:center;gap:12px}
.stat-item strong{display:block;font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--color-text);line-height:1}
.stat-item span{font-size:.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.features{padding:80px 0}
.features__header{text-align:center;margin-bottom:48px}
.features__grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.feat-card{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:28px;display:flex;flex-direction:column;gap:14px;transition:all var(--transition-slow);position:relative;overflow:hidden}
.feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ic);opacity:0;transition:opacity var(--transition)}
.feat-card:hover{border-color:rgba(45,212,191,.2);transform:translateY(-4px);box-shadow:var(--shadow-card)}
.feat-card:hover::before{opacity:1}
.feat-card__icon{width:48px;height:48px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center}
.feat-card h3{font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--color-text)}
.feat-card p{font-size:.9rem;color:var(--color-text-muted);line-height:1.65;flex:1}
.feat-card__link{display:flex;align-items:center;gap:6px;font-size:.85rem;font-weight:600;color:var(--color-primary);transition:gap var(--transition)}
.feat-card:hover .feat-card__link{gap:10px}
.cta-banner{background:linear-gradient(135deg,rgba(45,212,191,.1),rgba(249,115,22,.06));border:1px solid rgba(45,212,191,.15);border-radius:var(--radius-xl);margin:0 24px 80px}
.cta-banner__inner{display:flex;align-items:center;justify-content:space-between;gap:32px;padding:40px 48px;flex-wrap:wrap}
.cta-banner h2{font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--color-text);margin-bottom:4px}
.cta-banner p{color:var(--color-text-muted);font-size:.95rem}
@media(max-width:768px){.features__grid{grid-template-columns:1fr}.cta-banner__inner{flex-direction:column;text-align:center}.stats-bar__inner{gap:32px}}
`

const FEATURES = [
  { icon: Briefcase, title: 'Live Job Market',   desc: 'Real-time openings from top Bangladeshi companies and global remote positions.', to: '/jobs',        color: '#2dd4bf' },
  { icon: FileText,  title: 'CV Builder',         desc: 'Create a polished, ATS-optimized CV in minutes and export to PDF instantly.',    to: '/cv-builder',  color: '#f97316' },
  { icon: Search,    title: 'CV Analyzer',         desc: 'AI-powered analysis — get your score, fix weak spots, and pass ATS filters.',    to: '/cv-analyzer', color: '#a78bfa' },
  { icon: BookOpen,  title: 'Learning Hub',        desc: 'Free curated video courses in tech, design, data science, and career skills.',   to: '/learning',    color: '#34d399' },
]

export default function HomePage() {
  return (
    <>
      <style>{style}</style>
      <div className="hero">
        <div className="hero__bg" aria-hidden />
        <div className="container hero__inner">
          <span className="badge badge-teal animate-fade-up">🇧🇩 Made for Bangladesh</span>
          <h1 className="hero__title animate-fade-up">Your Career<br /><span className="hero__accent">Starts Here</span></h1>
          <p className="hero__sub animate-fade-up">Bangladesh's smartest job & career platform. Find live jobs, build a professional CV, get AI feedback, and learn in-demand skills — all in one place.</p>
          <div className="hero__btns animate-fade-up">
            <NavLink to="/jobs"       className="btn btn-primary hero__cta">Browse Live Jobs <ArrowRight size={16} /></NavLink>
            <NavLink to="/cv-builder" className="btn btn-outline">Build My CV</NavLink>
          </div>
          <div className="hero__checks animate-fade-up">
            {['100% Free','No Sign-up Required','BD-focused Jobs'].map(t => (
              <span key={t} className="hero__check"><CheckCircle size={14} />{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="container stats-bar__inner">
          {[[Briefcase,'500+','Job Listings'],[Users,'10k+','Users'],[TrendingUp,'95%','Success Rate']].map(([Icon,v,l]) => (
            <div key={l} className="stat-item">
              <Icon size={22} style={{ color:'var(--color-primary)' }} />
              <div><strong>{v}</strong><span>{l}</span></div>
            </div>
          ))}
        </div>
      </div>

      <section className="features">
        <div className="container">
          <div className="features__header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">A complete career toolkit built for Bangladeshi students & professionals.</p>
          </div>
          <div className="features__grid">
            {FEATURES.map(({ icon: Icon, title, desc, to, color }) => (
              <NavLink key={to} to={to} className="feat-card" style={{ '--ic': color }}>
                <div className="feat-card__icon" style={{ background: `${color}1a`, color }}>
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="feat-card__link">Explore <ArrowRight size={14} /></span>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2>Ready to Build Your Future?</h2>
            <p>Start with your CV — it takes less than 5 minutes.</p>
          </div>
          <NavLink to="/cv-builder" className="btn btn-primary" style={{ padding:'12px 36px', fontSize:'1rem', flexShrink:0 }}>
            Get Started Free <ArrowRight size={16} />
          </NavLink>
        </div>
      </div>
    </>
  )
}
