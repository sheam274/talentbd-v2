import React, { useState, useEffect, useCallback } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query, writeBatch
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Plus, Search, Trash2, Edit2, X, Youtube, Upload, Play } from 'lucide-react'

const style = `
.adm-table-wrap{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden}
.adm-table-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--color-border);gap:14px;flex-wrap:wrap}
.adm-table-head h2{font-family:var(--font-display);font-size:.95rem;font-weight:700;color:var(--color-text)}
.adm-search-wrap{position:relative}
.adm-search-wrap svg.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-faint)}
.adm-search-wrap input{background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:8px 12px 8px 32px;color:var(--color-text);font-size:.85rem;width:220px;transition:border-color var(--transition)}
.adm-search-wrap input:focus{outline:none;border-color:var(--color-primary)}
table{width:100%;border-collapse:collapse}
thead{background:var(--color-bg-elevated)}
th{padding:10px 18px;text-align:left;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-faint);border-bottom:1px solid var(--color-border)}
td{padding:12px 18px;font-size:.85rem;color:var(--color-text);border-bottom:1px solid var(--color-border-soft)}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.adm-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.adm-page-head h1{font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--color-text);margin-bottom:4px}
.adm-page-head p{font-size:.85rem;color:var(--color-text-muted)}
.adm-modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:300;padding:20px;animation:fadeIn .15s ease}
.adm-modal{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:32px;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;animation:fadeUp .2s ease}
.adm-modal h2{font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--color-text);margin-bottom:20px}
.adm-modal-form{display:flex;flex-direction:column;gap:14px}
.adm-modal-acts{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}
.adm-err{display:flex;align-items:center;gap:8px;background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2);border-radius:var(--radius-md);padding:10px 14px;font-size:.85rem;color:var(--color-error);margin-bottom:8px}
.v-cat-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.v-cat-btn{padding:6px 14px;border-radius:20px;font-size:.8rem;font-weight:500;color:var(--color-text-muted);background:var(--color-bg-card);border:1px solid var(--color-border);transition:all var(--transition);cursor:pointer}
.v-cat-btn:hover{border-color:var(--color-primary);color:var(--color-primary)}
.v-cat-btn--active{background:var(--color-primary-dim);border-color:var(--color-primary);color:var(--color-primary)}
.v-thumb{width:72px;height:40px;border-radius:6px;overflow:hidden;background:#000;position:relative;flex-shrink:0}
.v-thumb img{width:100%;height:100%;object-fit:cover}
.v-thumb svg{position:absolute;bottom:3px;right:3px;color:#fff;opacity:.8}
`

const CATS  = ['Web Dev','Data Science','Career','Design','DevOps','AI / ML','Mobile','Other']
const LEVS  = ['Beginner','Intermediate','Advanced','All Levels']
const BLANK = { title:'', instructor:'', youtubeId:'', category:'Web Dev', level:'Beginner', duration:'', description:'', tags:'' }

function extractId(v) {
  if (!v) return ''
  if (/^[a-zA-Z0-9_-]{11}$/.test(v.trim())) return v.trim()
  const m = v.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : ''
}

function VideoModal({ video, onClose, onSave }) {
  const [form, setForm] = useState(video ? { ...video, tags: Array.isArray(video.tags) ? video.tags.join(', ') : video.tags || '' } : BLANK)
  const [load, setLoad] = useState(false)
  const [err,  setErr]  = useState('')
  const up = (k,v) => setForm(f=>({...f,[k]:v}))
  const pid = extractId(form.youtubeId)

  const save = async () => {
    const id = extractId(form.youtubeId)
    if (!form.title || !id) return setErr('Title and a valid YouTube URL/ID are required.')
    setLoad(true)
    try {
      await onSave({
        ...form,
        youtubeId:  id,
        thumbnail:  `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        tags:       form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        createdAt:  serverTimestamp(),
      })
      onClose()
    } catch(e) { setErr(e.message) }
    finally { setLoad(false) }
  }

  return (
    <div className="adm-modal-ov" onClick={onClose}>
      <div className="adm-modal" onClick={e=>e.stopPropagation()}>
        <h2>{video?.id ? 'Edit Video' : 'Add Video'}</h2>
        {err && <div className="adm-err"><X size={13}/><span>{err}</span></div>}

        {pid && (
          <div style={{ aspectRatio:'16/9', borderRadius:10, overflow:'hidden', background:'#000', marginBottom:14 }}>
            <img src={`https://img.youtube.com/vi/${pid}/hqdefault.jpg`} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
          </div>
        )}

        <div className="adm-modal-form">
          <div className="form-group">
            <label className="form-label">YouTube URL or Video ID *</label>
            <div style={{ position:'relative' }}>
              <Youtube size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-error)' }}/>
              <input className="form-input" style={{ paddingLeft:36 }}
                placeholder="https://youtube.com/watch?v=... or 11-char ID"
                value={form.youtubeId} onChange={e=>up('youtubeId',e.target.value)}/>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" placeholder="React Complete Course" value={form.title} onChange={e=>up('title',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Instructor</label><input className="form-input" placeholder="Traversy Media" value={form.instructor} onChange={e=>up('instructor',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e=>up('category',e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Level</label><select className="form-input" value={form.level} onChange={e=>up('level',e.target.value)}>{LEVS.map(l=><option key={l}>{l}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="8h 30m" value={form.duration} onChange={e=>up('duration',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="React, JavaScript" value={form.tags} onChange={e=>up('tags',e.target.value)}/></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} placeholder="What will learners gain from this course?" value={form.description} onChange={e=>up('description',e.target.value)}/></div>
        </div>
        <div className="adm-modal-acts">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={load}>
            {load?<><div className="spinner" style={{width:13,height:13}}/>Saving…</>:'Save Video'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkModal({ onClose, onDone }) {
  const EXAMPLE = `React Complete Course,Traversy Media,w7ejDZ8SWv8,Web Dev,Beginner,12h 30m,React JavaScript
Python for ML,freeCodeCamp,LHBE6Q9oYDo,Data Science,Intermediate,6h 00m,Python ML AI
Figma Masterclass,DesignCourse,FTFaQWZBqQ8,Design,Beginner,10h 20m,Figma UIX Design`

  const [text, setText]   = useState('')
  const [load, setLoad]   = useState(false)
  const [err,  setErr]    = useState('')

  const run = async () => {
    const lines = text.trim().split('\n').filter(Boolean)
    if (!lines.length) return setErr('Paste at least one video line.')
    setLoad(true)
    try {
      const batch  = writeBatch(db)
      const colRef = collection(db, 'videos')
      let count = 0
      for (const line of lines) {
        const [title, instructor, youtubeId, category, level, duration, tagsRaw] = line.split(',').map(s=>s.trim())
        const id = extractId(youtubeId)
        if (!title || !id) continue
        batch.set(doc(colRef), {
          title, instructor: instructor||'', youtubeId: id,
          category: category||'Other', level: level||'All Levels',
          duration: duration||'', description: '',
          tags: tagsRaw ? tagsRaw.split(' ').filter(Boolean) : [],
          thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          createdAt: serverTimestamp(),
        })
        count++
      }
      await batch.commit()
      onDone(count)
      onClose()
    } catch(e) { setErr(e.message) }
    finally { setLoad(false) }
  }

  return (
    <div className="adm-modal-ov" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth:660 }} onClick={e=>e.stopPropagation()}>
        <h2>Bulk Import Videos</h2>
        <p style={{ fontSize:'.85rem',color:'var(--color-text-muted)',marginBottom:14 }}>
          One video per line:&nbsp;
          <code style={{ fontSize:'.78rem',color:'var(--color-primary)' }}>
            title, instructor, youtubeId, category, level, duration, tags(space separated)
          </code>
        </p>
        <button className="btn btn-ghost" style={{ fontSize:'.78rem',marginBottom:10 }} onClick={()=>setText(EXAMPLE)}>
          Load example
        </button>
        {err && <div className="adm-err"><X size={13}/><span>{err}</span></div>}
        <textarea className="form-input" rows={12}
          placeholder={EXAMPLE} value={text} onChange={e=>setText(e.target.value)}
          style={{ fontFamily:'monospace', fontSize:'.8rem', marginBottom:0 }}/>
        <div className="adm-modal-acts">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={run} disabled={load}>
            {load?<><div className="spinner" style={{width:13,height:13}}/>Importing…</>:<><Upload size={13}/>Import</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([])
  const [load,   setLoad]   = useState(true)
  const [q,      setQ]      = useState('')
  const [cat,    setCat]    = useState('All')
  const [modal,  setModal]  = useState(null)
  const [bulk,   setBulk]   = useState(false)

  const fetch = useCallback(async () => {
    setLoad(true)
    try {
      const snap = await getDocs(query(collection(db,'videos'), orderBy('createdAt','desc')))
      setVideos(snap.docs.map(d=>({ id:d.id, ...d.data() })))
    } catch { setVideos([]) }
    finally { setLoad(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const save = async (payload) => {
    if (modal?.id) await updateDoc(doc(db,'videos',modal.id), payload)
    else await addDoc(collection(db,'videos'), payload)
    await fetch()
  }

  const del = async (id) => {
    if (!confirm('Delete this video?')) return
    await deleteDoc(doc(db,'videos',id))
    setVideos(v=>v.filter(x=>x.id!==id))
  }

  const allCats = ['All', ...CATS]

  const filtered = videos.filter(v => {
    const mc = cat==='All' || v.category===cat
    const mq = !q || v.title?.toLowerCase().includes(q.toLowerCase()) || v.instructor?.toLowerCase().includes(q.toLowerCase())
    return mc && mq
  })

  return (
    <>
      <style>{style}</style>
      <div className="adm-page-head animate-fade-up">
        <div><h1>Learning Hub Videos</h1><p>Add videos one by one or bulk-import thousands at once</p></div>
        <div style={{ display:'flex',gap:10 }}>
          <button className="btn btn-outline" onClick={()=>setBulk(true)}><Upload size={14}/>Bulk Import</button>
          <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/>Add Video</button>
        </div>
      </div>

      <div className="v-cat-filters">
        {allCats.map(c=>(
          <button key={c} className={`v-cat-btn ${cat===c?'v-cat-btn--active':''}`} onClick={()=>setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="adm-table-wrap animate-fade-up">
        <div className="adm-table-head">
          <h2>{filtered.length} Video{filtered.length!==1?'s':''}</h2>
          <div className="adm-search-wrap">
            <Search size={13} className="si"/>
            <input placeholder="Search title or instructor…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
        </div>

        {load
          ? <div style={{ display:'flex',justifyContent:'center',padding:48 }}><div className="spinner" style={{ width:32,height:32 }}/></div>
          : filtered.length===0
            ? <div className="empty-state"><Youtube size={40}/><h3>No videos found</h3><p>Add a video or use Bulk Import to add thousands at once.</p></div>
            : (
              <table>
                <thead>
                  <tr><th>Thumb</th><th>Title</th><th>Instructor</th><th>Category</th><th>Level</th><th>Duration</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(v=>(
                    <tr key={v.id}>
                      <td>
                        <div className="v-thumb">
                          <img src={v.thumbnail} alt={v.title}/>
                          <Play size={10}/>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize:'.85rem' }}>{v.title}</strong>
                        {v.tags?.length>0 && (
                          <div style={{ display:'flex',gap:4,marginTop:4,flexWrap:'wrap' }}>
                            {v.tags.slice(0,3).map(t=>(
                              <span key={t} style={{ fontSize:'.68rem',padding:'1px 6px',background:'var(--color-bg-elevated)',borderRadius:10,color:'var(--color-text-muted)' }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ color:'var(--color-text-muted)',fontSize:'.82rem' }}>{v.instructor}</td>
                      <td><span className="badge badge-teal">{v.category}</span></td>
                      <td><span className="badge badge-orange">{v.level}</span></td>
                      <td style={{ color:'var(--color-text-muted)',fontSize:'.8rem' }}>{v.duration}</td>
                      <td>
                        <div style={{ display:'flex',gap:6 }}>
                          <button className="btn btn-ghost" style={{ padding:'4px 8px' }} onClick={()=>setModal(v)}><Edit2 size={13}/></button>
                          <button className="btn btn-ghost" style={{ padding:'4px 8px',color:'var(--color-error)' }} onClick={()=>del(v.id)}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>

      {modal && (
        <VideoModal
          video={modal==='add' ? null : modal}
          onClose={()=>setModal(null)}
          onSave={save}
        />
      )}

      {bulk && (
        <BulkModal
          onClose={()=>setBulk(false)}
          onDone={count=>{ alert(`✅ Successfully imported ${count} videos!`); fetch() }}
        />
      )}
    </>
  )
}
