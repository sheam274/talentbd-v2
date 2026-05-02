import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Users, Briefcase, BookOpen, FileText } from 'lucide-react'

const style = `
.adm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:32px}
.adm-stat{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px;transition:border-color var(--transition)}
.adm-stat:hover{border-color:rgba(45,212,191,.2)}
.adm-stat__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.adm-stat__icon{width:40px;height:40px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center}
.adm-stat__chg{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:20px}
.chg-up{color:var(--color-success);background:rgba(52,211,153,.1)}
.adm-stat__val{font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--color-text);line-height:1;margin-bottom:4px}
.adm-stat__lbl{font-size:.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.adm-charts{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.adm-chart{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px}
.adm-chart h3{font-family:var(--font-display);font-size:.92rem;font-weight:700;color:var(--color-text);margin-bottom:20px}
.bar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.bar-lbl{font-size:.78rem;color:var(--color-text-muted);width:72px;flex-shrink:0}
.bar-track{flex:1;height:8px;background:var(--color-bg-elevated);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width 1s ease}
.bar-val{font-size:.78rem;font-weight:700;color:var(--color-text);width:28px;text-align:right;flex-shrink:0}
.adm-activity{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px}
.adm-activity h3{font-family:var(--font-display);font-size:.92rem;font-weight:700;color:var(--color-text);margin-bottom:16px}
.act-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-md);background:var(--color-bg-elevated);margin-bottom:8px}
.act-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.act-text{flex:1;font-size:.83rem;color:var(--color-text)}
.act-time{font-size:.72rem;color:var(--color-text-faint);flex-shrink:0}
.recent-users{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px}
.recent-users h3{font-family:var(--font-display);font-size:.92rem;font-weight:700;color:var(--color-text);margin-bottom:16px}
.ru-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--color-border-soft)}
.ru-item:last-child{border-bottom:none}
.ru-av{width:32px;height:32px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:.82rem;color:#0a0d12;flex-shrink:0}
.ru-name{font-size:.85rem;font-weight:600;color:var(--color-text)}
.ru-email{font-size:.75rem;color:var(--color-text-muted)}
@media(max-width:1100px){.adm-stats{grid-template-columns:1fr 1fr}.adm-charts{grid-template-columns:1fr}}
@media(max-width:600px){.adm-stats{grid-template-columns:1fr 1fr}}
`

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d=>d.v), 1)
  return data.map(d=>(
    <div key={d.l} className="bar-row">
      <span className="bar-lbl">{d.l}</span>
      <div className="bar-track"><div className="bar-fill" style={{width:`${(d.v/max)*100}%`,background:color}}/></div>
      <span className="bar-val">{d.v}</span>
    </div>
  ))
}

function DonutChart({ segs }) {
  const total = segs.reduce((s,g)=>s+g.v,0)||1
  const R=52, C=2*Math.PI*R
  let off=0
  return (
    <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {segs.map((s,i)=>{
          const d=C*(s.v/total), cur=off; off+=d
          return <circle key={i} cx={60} cy={60} r={R} fill="none" stroke={s.c} strokeWidth={16}
            strokeDasharray={`${d} ${C}`} strokeDashoffset={-cur} transform="rotate(-90 60 60)"
            style={{transition:'stroke-dasharray 1s ease'}}/>
        })}
        <text x={60} y={65} textAnchor="middle" fill="#e8eaf0"
          style={{fontSize:'16px',fontFamily:'Syne,sans-serif',fontWeight:800}}>{total}</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {segs.map(s=>(
          <div key={s.l} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:9,height:9,borderRadius:'50%',background:s.c,flexShrink:0}}/>
            <span style={{fontSize:'.78rem',color:'var(--color-text-muted)'}}>{s.l} <strong style={{color:'var(--color-text)'}}>({s.v})</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,  setStats]  = useState({ users:0, jobs:0, videos:0, admins:0 })
  const [recent, setRecent] = useState([])
  const [load,   setLoad]   = useState(true)

  useEffect(()=>{
    (async()=>{
      try {
        const [us,js,vs] = await Promise.all([
          getDocs(collection(db,'users')),
          getDocs(collection(db,'jobs')),
          getDocs(collection(db,'videos')),
        ])
        const users = us.docs.map(d=>({id:d.id,...d.data()}))
        setStats({ users:us.size, jobs:js.size, videos:vs.size, admins:users.filter(u=>u.role==='admin').length })
        setRecent(users.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5))
      } catch(e){ console.error(e) }
      finally { setLoad(false) }
    })()
  },[])

  const STAT_CARDS = [
    { icon:Users,    label:'Total Users',  val:stats.users,  change:12, ic:'rgba(45,212,191,.12)',  ic2:'#2dd4bf' },
    { icon:Briefcase,label:'Job Listings', val:stats.jobs,   change:8,  ic:'rgba(249,115,22,.12)',   ic2:'#f97316' },
    { icon:BookOpen, label:'Videos',       val:stats.videos, change:24, ic:'rgba(167,139,250,.12)', ic2:'#a78bfa' },
    { icon:Users,    label:'Admins',       val:stats.admins, change:0,  ic:'rgba(52,211,153,.12)',   ic2:'#34d399' },
  ]

  const jobBars = [
    {l:'IT / Tech', v:Math.max(stats.jobs,8)},
    {l:'Design',    v:12},{l:'Finance',v:9},
    {l:'Marketing', v:7},{l:'Remote',  v:15},
  ]

  const userSegs = [
    {l:'Job Seekers',v:Math.max(stats.users-stats.admins,0),c:'#2dd4bf'},
    {l:'Admins',     v:stats.admins, c:'#f97316'},
  ]

  const activity = [
    {t:'New user signed up',           time:'2m ago',  c:'#2dd4bf'},
    {t:'CV analyzed successfully',      time:'8m ago',  c:'#a78bfa'},
    {t:'Job listing added by admin',    time:'15m ago', c:'#f97316'},
    {t:'New video added to Learning Hub',time:'1h ago', c:'#34d399'},
    {t:'User downloaded their CV PDF',  time:'2h ago',  c:'#fbbf24'},
  ]

  return (
    <>
      <style>{style}</style>
      <div className="adm-page-head animate-fade-up">
        <div><h1>Dashboard</h1><p>Welcome back — here's what's happening on TalentBD.</p></div>
      </div>

      <div className="adm-stats">
        {STAT_CARDS.map(({icon:Icon,label,val,change,ic,ic2})=>(
          <div key={label} className="adm-stat animate-fade-up">
            <div className="adm-stat__head">
              <div className="adm-stat__icon" style={{background:ic}}><Icon size={20} style={{color:ic2}}/></div>
              <span className="adm-stat__chg chg-up">+{change}%</span>
            </div>
            <div className="adm-stat__val">{load?'—':val}</div>
            <div className="adm-stat__lbl">{label}</div>
          </div>
        ))}
      </div>

      <div className="adm-charts">
        <div className="adm-chart animate-fade-up">
          <h3>Jobs by Category</h3>
          <BarChart data={jobBars} color="#2dd4bf"/>
        </div>
        <div className="adm-chart animate-fade-up">
          <h3>User Distribution</h3>
          <DonutChart segs={userSegs}/>
        </div>
      </div>

      <div className="adm-charts">
        <div className="adm-activity animate-fade-up">
          <h3>Recent Activity</h3>
          {activity.map((a,i)=>(
            <div key={i} className="act-item">
              <div className="act-dot" style={{background:a.c}}/>
              <span className="act-text">{a.t}</span>
              <span className="act-time">{a.time}</span>
            </div>
          ))}
        </div>

        <div className="recent-users animate-fade-up">
          <h3>Recent Users</h3>
          {load ? <div style={{display:'flex',justifyContent:'center',padding:24}}><div className="spinner"/></div>
           : recent.length===0 ? <p style={{fontSize:'.85rem',color:'var(--color-text-muted)'}}>No users yet.</p>
           : recent.map(u=>(
            <div key={u.id} className="ru-item">
              <div className="ru-av">{u.name?.charAt(0).toUpperCase()||'?'}</div>
              <div style={{flex:1,overflow:'hidden'}}>
                <div className="ru-name">{u.name}</div>
                <div className="ru-email">{u.email}</div>
              </div>
              <span className={`badge ${u.role==='admin'?'badge-orange':'badge-teal'}`}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
