import React, { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Play, Clock, Search, BookOpen, ChevronRight, Star } from 'lucide-react'

const style = `
.lh-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.lh-stats{display:flex;gap:24px;flex-shrink:0}
.lh-stat strong{display:block;font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:var(--color-primary)}
.lh-stat span{font-size:.72rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.lh-search-wrap{position:relative;margin-bottom:20px}
.lh-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--color-text-faint);pointer-events:none}
.lh-search{padding-left:44px;height:48px;background:var(--color-bg-card)}
.lh-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.lh-cat{padding:7px 16px;border-radius:20px;font-size:.82rem;font-weight:500;color:var(--color-text-muted);background:var(--color-bg-card);border:1px solid var(--color-border);transition:all var(--transition);cursor:pointer}
.lh-cat:hover{border-color:var(--color-primary);color:var(--color-primary)}
.lh-cat--active{background:var(--color-primary-dim);border-color:var(--color-primary);color:var(--color-primary)}
.courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px}
.cc{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;transition:all var(--transition)}
.cc:hover{border-color:rgba(45,212,191,.25);transform:translateY(-3px);box-shadow:var(--shadow-card)}
.cc__thumb{position:relative;aspect-ratio:16/9;overflow:hidden;cursor:pointer}
.cc__thumb img{width:100%;height:100%;object-fit:cover;transition:transform var(--transition-slow)}
.cc:hover .cc__thumb img{transform:scale(1.04)}
.cc__play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);opacity:0;transition:opacity var(--transition)}
.cc:hover .cc__play{opacity:1}
.cc__play-btn{width:50px;height:50px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0a0d12;box-shadow:0 4px 20px rgba(45,212,191,.45)}
.cc__level{position:absolute;top:10px;left:10px}
.cc__body{padding:16px;display:flex;flex-direction:column;gap:10px}
.cc__meta{display:flex;align-items:center;justify-content:space-between}
.cc__rating{display:flex;align-items:center;gap:3px;font-size:.78rem;color:#fbbf24;font-weight:600}
.cc__title{font-family:var(--font-display);font-size:.95rem;font-weight:700;color:var(--color-text);line-height:1.3;cursor:pointer;transition:color var(--transition)}
.cc__title:hover{color:var(--color-primary)}
.cc__desc{font-size:.8rem;color:var(--color-text-muted);line-height:1.6}
.cc__foot{display:flex;align-items:center;justify-content:space-between;font-size:.78rem;color:var(--color-text-faint)}
.cc__dur{display:flex;align-items:center;gap:4px}
.cc__tags{display:flex;flex-wrap:wrap;gap:5px}
.cc__btn{width:100%;justify-content:center;font-size:.82rem;padding:8px}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:400;padding:20px;animation:fadeIn .2s ease}
.modal{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;width:100%;max-width:820px;position:relative;animation:fadeUp .25s ease}
.modal__close{position:absolute;top:12px;right:12px;z-index:10;width:30px;height:30px;background:rgba(0,0,0,.6);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:background var(--transition)}
.modal__close:hover{background:rgba(0,0,0,.9)}
.modal__video{aspect-ratio:16/9}
.modal__video iframe{width:100%;height:100%;border:none}
.modal__info{padding:16px 20px}
.modal__info h3{font-family:var(--font-display);font-size:.95rem;font-weight:700;color:var(--color-text);margin-bottom:3px}
.modal__info p{font-size:.82rem;color:var(--color-text-muted)}
.load-more{text-align:center;margin-top:40px}
@media(max-width:600px){.courses-grid{grid-template-columns:1fr}.lh-stats{display:none}}
`

const CATS = ['All','Web Dev','Data Science','Career','Design','DevOps','AI / ML','Mobile','Other']
const LEVEL_C = { Beginner:'badge-green', Intermediate:'badge-orange', Advanced:'badge-orange', 'All Levels':'badge-teal' }

const STATIC = [
  {id:'s1',title:'React.js Complete Course 2024',instructor:'Traversy Media',category:'Web Dev',duration:'12h 30m',level:'Beginner',youtubeId:'w7ejDZ8SWv8',thumbnail:'https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg',description:'Learn React from scratch — hooks, context, routing, and real projects.',tags:['React','JavaScript','Frontend']},
  {id:'s2',title:'Node.js & Express for Beginners',instructor:'Traversy Media',category:'Web Dev',duration:'8h 15m',level:'Beginner',youtubeId:'fBNz5xF-Kx4',thumbnail:'https://img.youtube.com/vi/fBNz5xF-Kx4/hqdefault.jpg',description:'Build REST APIs and server-side apps with Node.js and Express.',tags:['Node.js','Express','Backend']},
  {id:'s3',title:'Python for Data Science',instructor:'freeCodeCamp',category:'Data Science',duration:'6h 00m',level:'Intermediate',youtubeId:'LHBE6Q9oYDo',thumbnail:'https://img.youtube.com/vi/LHBE6Q9oYDo/hqdefault.jpg',description:'Pandas, NumPy, Matplotlib — everything to start analyzing data.',tags:['Python','Pandas','Data']},
  {id:'s4',title:'How to Write a Winning CV',instructor:'CareerVidz',category:'Career',duration:'45m',level:'All Levels',youtubeId:'aKjsy-b00QM',thumbnail:'https://img.youtube.com/vi/aKjsy-b00QM/hqdefault.jpg',description:'Exact formula hiring managers look for. ATS-optimized tips.',tags:['CV','Career','Jobs']},
  {id:'s5',title:'Figma UI/UX Masterclass',instructor:'DesignCourse',category:'Design',duration:'10h 20m',level:'Beginner',youtubeId:'FTFaQWZBqQ8',thumbnail:'https://img.youtube.com/vi/FTFaQWZBqQ8/hqdefault.jpg',description:'Design stunning UIs from wireframe to prototype with Figma.',tags:['Figma','UI/UX','Design']},
  {id:'s6',title:'Docker & Kubernetes Crash Course',instructor:'TechWorld with Nana',category:'DevOps',duration:'5h 00m',level:'Intermediate',youtubeId:'3c-iBn73dDE',thumbnail:'https://img.youtube.com/vi/3c-iBn73dDE/hqdefault.jpg',description:'Containerize apps with Docker and orchestrate with Kubernetes.',tags:['Docker','Kubernetes','DevOps']},
  {id:'s7',title:'Machine Learning with Python',instructor:'Sentdex',category:'AI / ML',duration:'14h 30m',level:'Intermediate',youtubeId:'OGxgnH8y2NM',thumbnail:'https://img.youtube.com/vi/OGxgnH8y2NM/hqdefault.jpg',description:'scikit-learn, neural networks, and real ML projects from scratch.',tags:['ML','Python','AI']},
  {id:'s8',title:'Tech Interview Prep',instructor:'CS Dojo',category:'Career',duration:'1h 15m',level:'All Levels',youtubeId:'1qw5ITr3k9E',thumbnail:'https://img.youtube.com/vi/1qw5ITr3k9E/hqdefault.jpg',description:'Ace coding interviews, behavioral questions, salary negotiation.',tags:['Interview','Career','Tech']},
  {id:'s9',title:'Full Stack Web Dev 2024',instructor:'Colt Steele',category:'Web Dev',duration:'63h 00m',level:'Beginner',youtubeId:'nu_pCVPKzTk',thumbnail:'https://img.youtube.com/vi/nu_pCVPKzTk/hqdefault.jpg',description:'HTML, CSS, JavaScript, Node.js, React, MongoDB — the complete stack.',tags:['HTML','CSS','JavaScript']},
  {id:'s10',title:'Flutter App Development',instructor:'Mitch Koko',category:'Mobile',duration:'4h 30m',level:'Beginner',youtubeId:'VPvVD8t02U8',thumbnail:'https://img.youtube.com/vi/VPvVD8t02U8/hqdefault.jpg',description:'Build beautiful cross-platform mobile apps with Flutter and Dart.',tags:['Flutter','Dart','Mobile']},
  {id:'s11',title:'TypeScript Full Course',instructor:'freeCodeCamp',category:'Web Dev',duration:'4h 00m',level:'Intermediate',youtubeId:'30LWjhZzg50',thumbnail:'https://img.youtube.com/vi/30LWjhZzg50/hqdefault.jpg',description:'Master TypeScript — types, interfaces, generics, and advanced patterns.',tags:['TypeScript','JavaScript']},
  {id:'s12',title:'SQL for Beginners',instructor:'Programming with Mosh',category:'Data Science',duration:'3h 00m',level:'Beginner',youtubeId:'7S_tz1z_5bA',thumbnail:'https://img.youtube.com/vi/7S_tz1z_5bA/hqdefault.jpg',description:'Learn SQL from scratch — queries, joins, indexes, and stored procedures.',tags:['SQL','Database','MySQL']},
]

const PER_PAGE = 12

function VideoModal({ v, onClose }) {
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__video">
          <iframe src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
            title={v.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen/>
        </div>
        <div className="modal__info"><h3>{v.title}</h3><p>{v.instructor} · {v.duration}</p></div>
      </div>
    </div>
  )
}

function CourseCard({ v, onPlay }) {
  return (
    <article className="cc animate-fade-up">
      <div className="cc__thumb" onClick={()=>onPlay(v)}>
        <img src={v.thumbnail} alt={v.title} loading="lazy"/>
        <div className="cc__play"><div className="cc__play-btn"><Play size={18} fill="currentColor"/></div></div>
        <span className={`badge ${LEVEL_C[v.level]||'badge-teal'} cc__level`}>{v.level}</span>
      </div>
      <div className="cc__body">
        <div className="cc__meta">
          <span className="tag">{v.category}</span>
          {v.rating && <span className="cc__rating"><Star size={10} fill="#fbbf24" stroke="none"/>{v.rating}</span>}
        </div>
        <h3 className="cc__title" onClick={()=>onPlay(v)}>{v.title}</h3>
        {v.description && <p className="cc__desc">{v.description.slice(0,90)}{v.description.length>90?'…':''}</p>}
        <div className="cc__foot">
          <span>{v.instructor}</span>
          {v.duration && <span className="cc__dur"><Clock size={11}/>{v.duration}</span>}
        </div>
        {v.tags?.length>0 && <div className="cc__tags">{v.tags.slice(0,3).map(t=><span key={t} className="tag">{t}</span>)}</div>}
        <button className="btn btn-outline cc__btn" onClick={()=>onPlay(v)}>Watch Now <ChevronRight size={13}/></button>
      </div>
    </article>
  )
}

export default function LearningHubPage() {
  const [videos, setVideos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat]         = useState('All')
  const [search, setSearch]   = useState('')
  const [active, setActive]   = useState(null)
  const [page, setPage]       = useState(1)

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      try {
        const snap = await getDocs(query(collection(db,'videos'),orderBy('createdAt','desc')))
        const db_v = snap.docs.map(d=>({id:d.id,...d.data()}))
        setVideos(db_v.length>0 ? [...db_v,...STATIC.filter(s=>!db_v.find(d=>d.youtubeId===s.youtubeId))] : STATIC)
      } catch { setVideos(STATIC) }
      finally { setLoading(false) }
    })()
  },[])

  useEffect(()=>setPage(1),[cat,search])

  const filtered = videos.filter(v=>{
    const mc = cat==='All'||v.category===cat
    const ms = !search || v.title?.toLowerCase().includes(search.toLowerCase()) || v.tags?.some(t=>t.toLowerCase().includes(search.toLowerCase())) || v.instructor?.toLowerCase().includes(search.toLowerCase())
    return mc&&ms
  })

  const paged   = filtered.slice(0,page*PER_PAGE)
  const hasMore = paged.length<filtered.length

  return (
    <>
      <style>{style}</style>
      <div className="page-wrapper">
        <div className="container">
          <div className="lh-header animate-fade-up">
            <div><h1 className="section-title">Learning Hub</h1><p className="section-subtitle">{loading?'Loading…':`${filtered.length} free courses — grow your skills today`}</p></div>
            <div className="lh-stats">
              <div className="lh-stat"><strong>{videos.length}+</strong><span>Courses</span></div>
              <div className="lh-stat"><strong>Free</strong><span>Always</span></div>
            </div>
          </div>

          <div className="lh-search-wrap">
            <Search size={16} className="lh-search-icon"/>
            <input className="form-input lh-search" placeholder="Search courses, skills, instructors…"
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          <div className="lh-cats">
            {CATS.map(c=><button key={c} className={`lh-cat ${cat===c?'lh-cat--active':''}`} onClick={()=>setCat(c)}>{c}</button>)}
          </div>

          <p style={{fontSize:'.82rem',color:'var(--color-text-muted)',marginBottom:20}}>
            <strong style={{color:'var(--color-text)'}}>{filtered.length}</strong> course{filtered.length!==1?'s':''} available
          </p>

          {loading ? (
            <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" style={{width:40,height:40}}/></div>
          ) : filtered.length===0 ? (
            <div className="empty-state"><BookOpen size={44}/><h3>No courses found</h3><p>Try a different search or category.</p></div>
          ) : (
            <>
              <div className="courses-grid">{paged.map(v=><CourseCard key={v.id} v={v} onPlay={setActive}/>)}</div>
              {hasMore && (
                <div className="load-more">
                  <button className="btn btn-outline" style={{padding:'11px 40px'}} onClick={()=>setPage(p=>p+1)}>Load More Courses</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {active && <VideoModal v={active} onClose={()=>setActive(null)}/>}
    </>
  )
}
