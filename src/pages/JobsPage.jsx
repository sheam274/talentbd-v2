import React, { useState, useCallback } from 'react'
import { Search, MapPin, Clock, Briefcase, ExternalLink, RefreshCw, AlertCircle, Wifi } from 'lucide-react'
import { useJobs } from '../hooks/useJobs'

const style = `
.jobs-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.jobs-search-wrap{display:flex;gap:12px;margin-bottom:20px}
.jobs-search-box{position:relative;flex:1}
.jobs-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--color-text-faint);pointer-events:none}
.jobs-search-input{width:100%;height:48px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:0 14px 0 44px;color:var(--color-text);font-size:.95rem;transition:border-color var(--transition)}
.jobs-search-input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px var(--color-primary-dim)}
.jobs-search-input::placeholder{color:var(--color-text-faint)}
.jobs-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.jf-btn{padding:7px 16px;border-radius:20px;font-size:.82rem;font-weight:500;color:var(--color-text-muted);background:var(--color-bg-card);border:1px solid var(--color-border);transition:all var(--transition);cursor:pointer}
.jf-btn:hover{color:var(--color-text);border-color:var(--color-primary)}
.jf-btn--active{background:var(--color-primary-dim);border-color:var(--color-primary);color:var(--color-primary)}
.jobs-count{font-size:.82rem;color:var(--color-text-muted);margin-bottom:20px}
.jobs-count strong{color:var(--color-text)}
.jobs-notice{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-radius:var(--radius-md);margin-bottom:20px;font-size:.85rem;background:rgba(251,191,36,.07);border:1px solid rgba(251,191,36,.2);color:var(--color-warning)}
.jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
.job-card{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:14px;transition:all var(--transition)}
.job-card:hover{border-color:rgba(45,212,191,.25);transform:translateY(-2px);box-shadow:var(--shadow-card)}
.job-card__top{display:flex;align-items:flex-start;gap:12px}
.job-card__av{width:44px;height:44px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--color-primary);flex-shrink:0}
.job-card__meta{flex:1;min-width:0}
.job-card__title{font-family:var(--font-display);font-size:.95rem;font-weight:700;color:var(--color-text);line-height:1.3;margin-bottom:2px}
.job-card__company{font-size:.82rem;color:var(--color-text-muted)}
.job-card__desc{font-size:.83rem;color:var(--color-text-muted);line-height:1.6;flex:1}
.job-card__tags{display:flex;flex-wrap:wrap;gap:6px}
.job-card__foot{display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--color-border-soft)}
.job-card__apply{font-size:.8rem;padding:6px 14px}
.skel{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:14px}
.skel__row{display:flex;gap:12px;align-items:center}
.skel__circle{width:44px;height:44px;border-radius:var(--radius-md);background:var(--color-bg-elevated);animation:pulse 1.5s infinite;flex-shrink:0}
.skel__line{height:12px;background:var(--color-bg-elevated);border-radius:6px;animation:pulse 1.5s infinite}
.skel__line--lg{height:16px}
.skel__tags{display:flex;gap:6px}
.skel__tag{height:22px;width:70px;background:var(--color-bg-elevated);border-radius:20px;animation:pulse 1.5s infinite}
.spinning{animation:spin .7s linear infinite}
@media(max-width:600px){.jobs-grid{grid-template-columns:1fr}.jobs-search-wrap{flex-direction:column}}
`

const CATS = [
  { value:'all',     label:'All Jobs' },
  { value:'IT',      label:'IT & Tech' },
  { value:'Design',  label:'Design' },
  { value:'Finance', label:'Finance' },
  { value:'Remote',  label:'Remote' },
]

const fmt = (min,max) => {
  if (!min && !max) return null
  const f = n => n >= 1000 ? `৳${Math.round(n/1000)}k` : `৳${n}`
  if (min && max) return `${f(min)}–${f(max)}`
  return min ? `From ${f(min)}` : `Up to ${f(max)}`
}

const ago = (d) => {
  const days = Math.floor((Date.now() - new Date(d))/86400000)
  if (!days) return 'Today'
  if (days===1) return 'Yesterday'
  if (days<7) return `${days}d ago`
  return `${Math.floor(days/7)}w ago`
}

function JobCard({ job }) {
  const salary = fmt(job.salary_min, job.salary_max)
  const company = job.company?.display_name || job.company || 'Unknown'
  return (
    <article className="job-card animate-fade-up">
      <div className="job-card__top">
        <div className="job-card__av">{company.charAt(0)}</div>
        <div className="job-card__meta">
          <div className="job-card__title">{job.title}</div>
          <div className="job-card__company">{company}</div>
        </div>
        {job.source==='live' && <span className="badge badge-green" style={{gap:4,flexShrink:0}}><Wifi size={9}/>Live</span>}
        {job.source==='admin' && <span className="badge badge-teal" style={{flexShrink:0}}>Featured</span>}
      </div>
      <p className="job-card__desc">{(job.description||'').slice(0,130)}{(job.description||'').length>130?'…':''}</p>
      <div className="job-card__tags">
        {job.location?.display_name && <span className="tag"><MapPin size={10}/>{job.location.display_name}</span>}
        {(job.contract_type||job.type) && <span className="tag"><Briefcase size={10}/>{job.contract_type||job.type}</span>}
        {job.created && <span className="tag"><Clock size={10}/>{ago(job.created?.seconds ? new Date(job.created.seconds*1000) : job.created)}</span>}
        {salary && <span className="tag">{salary}</span>}
      </div>
      <div className="job-card__foot">
        <span className="badge badge-teal">{job.category?.label||job.category||'General'}</span>
        <a href={job.redirect_url||'#'} target="_blank" rel="noopener noreferrer" className="btn btn-outline job-card__apply">
          Apply <ExternalLink size={12}/>
        </a>
      </div>
    </article>
  )
}

function Skeleton() {
  return (
    <div className="jobs-grid">
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} className="skel">
          <div className="skel__row">
            <div className="skel__circle"/>
            <div style={{flex:1}}>
              <div className="skel__line skel__line--lg" style={{width:'65%',marginBottom:8}}/>
              <div className="skel__line" style={{width:'40%'}}/>
            </div>
          </div>
          <div className="skel__line" style={{width:'100%'}}/>
          <div className="skel__line" style={{width:'80%'}}/>
          <div className="skel__tags">{[1,2,3].map(t=><div key={t} className="skel__tag"/>)}</div>
        </div>
      ))}
    </div>
  )
}

export default function JobsPage() {
  const [input,    setInput]    = useState('')
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  const { jobs, loading, error, refetch } = useJobs({ query: search, filter })

  const handleSearch = useCallback(e => { e.preventDefault(); setSearch(input) }, [input])

  return (
    <>
      <style>{style}</style>
      <div className="page-wrapper">
        <div className="container">
          <div className="jobs-header animate-fade-up">
            <div>
              <h1 className="section-title">Live Job Market</h1>
              <p className="section-subtitle">Real-time openings from top companies — Bangladesh & remote</p>
            </div>
            <button className="btn btn-ghost" onClick={refetch} disabled={loading}>
              <RefreshCw size={15} className={loading?'spinning':''}/> Refresh
            </button>
          </div>

          <form className="jobs-search-wrap" onSubmit={handleSearch}>
            <div className="jobs-search-box">
              <Search size={17} className="jobs-search-icon"/>
              <input className="jobs-search-input" placeholder="Search jobs, companies, skills…"
                value={input} onChange={e=>setInput(e.target.value)}/>
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="jobs-filters">
            {CATS.map(c=>(
              <button key={c.value} className={`jf-btn ${filter===c.value?'jf-btn--active':''}`}
                onClick={()=>setFilter(c.value)}>{c.label}</button>
            ))}
          </div>

          {error && (
            <div className="jobs-notice">
              <AlertCircle size={15}/><span>Live API unavailable — showing curated BD jobs. ({error})</span>
            </div>
          )}

          {!loading && <p className="jobs-count">Showing <strong>{jobs.length}</strong> job{jobs.length!==1?'s':''}{search?` for "${search}"`:''}.</p>}

          {loading ? <Skeleton/> : jobs.length===0 ? (
            <div className="empty-state">
              <Briefcase size={44}/>
              <h3>No jobs found</h3>
              <p>Try a different keyword or clear your filters.</p>
              <button className="btn btn-outline" style={{marginTop:16}}
                onClick={()=>{setSearch('');setInput('');setFilter('all')}}>Clear filters</button>
            </div>
          ) : (
            <div className="jobs-grid">{jobs.map(j=><JobCard key={j.id} job={j}/>)}</div>
          )}
        </div>
      </div>
    </>
  )
}
