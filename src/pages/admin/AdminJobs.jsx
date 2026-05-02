import React, { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Plus, Search, Trash2, Edit2, X, Briefcase } from 'lucide-react'

const tableStyle = `
.adm-table-wrap{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden}
.adm-table-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--color-border);gap:14px;flex-wrap:wrap}
.adm-table-head h2{font-family:var(--font-display);font-size:.95rem;font-weight:700;color:var(--color-text)}
.adm-search-wrap{position:relative}
.adm-search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-faint)}
.adm-search-wrap input{background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:8px 12px 8px 32px;color:var(--color-text);font-size:.85rem;width:220px;transition:border-color var(--transition)}
.adm-search-wrap input:focus{outline:none;border-color:var(--color-primary)}
table{width:100%;border-collapse:collapse}
thead{background:var(--color-bg-elevated)}
th{padding:10px 18px;text-align:left;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-faint);border-bottom:1px solid var(--color-border)}
td{padding:13px 18px;font-size:.85rem;color:var(--color-text);border-bottom:1px solid var(--color-border-soft)}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.adm-modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:300;padding:20px;animation:fadeIn .15s ease}
.adm-modal{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:32px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;animation:fadeUp .2s ease}
.adm-modal h2{font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--color-text);margin-bottom:20px}
.adm-modal-form{display:flex;flex-direction:column;gap:14px}
.adm-modal-acts{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}
.adm-err{display:flex;align-items:center;gap:8px;background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2);border-radius:var(--radius-md);padding:10px 14px;font-size:.85rem;color:var(--color-error);margin-bottom:8px}
`

const TYPES = ['Full-time','Part-time','Remote','Contract','Internship']
const CATS  = ['IT Jobs','Design Jobs','Finance','Marketing','Education','Other']
const BLANK = { title:'',company:'',location:'',type:'Full-time',category:'IT Jobs',salary_min:'',salary_max:'',description:'',redirect_url:'' }

function JobModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(job||BLANK)
  const [load, setLoad] = useState(false)
  const [err,  setErr]  = useState('')
  const up = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    if (!form.title||!form.company||!form.description) return setErr('Title, company and description are required.')
    setLoad(true)
    try {
      await onSave({ ...form, salary_min:Number(form.salary_min)||0, salary_max:Number(form.salary_max)||0, source:'admin', created:serverTimestamp() })
      onClose()
    } catch(e) { setErr(e.message) }
    finally { setLoad(false) }
  }

  return (
    <div className="adm-modal-ov" onClick={onClose}>
      <div className="adm-modal" onClick={e=>e.stopPropagation()}>
        <h2>{job?.id?'Edit Job':'Add Job Listing'}</h2>
        {err&&<div className="adm-err"><X size={13}/><span>{err}</span></div>}
        <div className="adm-modal-form">
          <div className="grid-2">
            {[['Job Title *','title','Frontend Developer'],['Company *','company','bKash Limited'],['Location','location','Dhaka, Bangladesh'],['Apply URL','redirect_url','https://…'],['Min Salary ৳','salary_min','30000'],['Max Salary ৳','salary_max','60000']].map(([l,k,p])=>(
              <div key={k} className="form-group"><label className="form-label">{l}</label><input className="form-input" placeholder={p} value={form[k]} onChange={e=>up(k,e.target.value)}/></div>
            ))}
            <div className="form-group"><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={e=>up('type',e.target.value)}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e=>up('category',e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" rows={5} placeholder="Describe the role, requirements, responsibilities…" value={form.description} onChange={e=>up('description',e.target.value)}/></div>
        </div>
        <div className="adm-modal-acts">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={load}>
            {load?<><div className="spinner" style={{width:13,height:13}}/>Saving…</>:'Save Job'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminJobs() {
  const [jobs,  setJobs]  = useState([])
  const [load,  setLoad]  = useState(true)
  const [q,     setQ]     = useState('')
  const [modal, setModal] = useState(null)

  const fetch = async () => {
    setLoad(true)
    try { const s=await getDocs(query(collection(db,'jobs'),orderBy('created','desc'))); setJobs(s.docs.map(d=>({id:d.id,...d.data()}))) }
    catch { setJobs([]) }
    finally { setLoad(false) }
  }
  useEffect(()=>{ fetch() },[])

  const save = async (payload) => {
    if (modal?.id) await updateDoc(doc(db,'jobs',modal.id), payload)
    else await addDoc(collection(db,'jobs'), payload)
    await fetch()
  }

  const del = async (id) => {
    if (!confirm('Delete this job?')) return
    await deleteDoc(doc(db,'jobs',id)); setJobs(j=>j.filter(x=>x.id!==id))
  }

  const filtered = jobs.filter(j=>j.title?.toLowerCase().includes(q.toLowerCase())||j.company?.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <style>{tableStyle}</style>
      <div className="adm-page-head animate-fade-up">
        <div><h1>Job Listings</h1><p>Manage all job postings shown on the platform</p></div>
        <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/>Add Job</button>
      </div>

      <div className="adm-table-wrap animate-fade-up">
        <div className="adm-table-head">
          <h2>{filtered.length} Job{filtered.length!==1?'s':''}</h2>
          <div className="adm-search-wrap"><Search size={13}/><input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        </div>
        {load ? <div style={{display:'flex',justifyContent:'center',padding:48}}><div className="spinner" style={{width:32,height:32}}/></div>
        : filtered.length===0 ? <div className="empty-state"><Briefcase size={40}/><h3>No jobs yet</h3><p>Add your first job listing.</p></div>
        : <table>
            <thead><tr><th>Title</th><th>Company</th><th>Category</th><th>Type</th><th>Location</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(j=>(
                <tr key={j.id}>
                  <td><strong>{j.title}</strong></td>
                  <td style={{color:'var(--color-text-muted)'}}>{j.company}</td>
                  <td><span className="badge badge-teal">{j.category}</span></td>
                  <td><span className="badge badge-orange">{j.type||j.contract_type}</span></td>
                  <td style={{color:'var(--color-text-muted)',fontSize:'.78rem'}}>{j.location}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={()=>setModal(j)}><Edit2 size={13}/></button>
                      <button className="btn btn-ghost" style={{padding:'4px 8px',color:'var(--color-error)'}} onClick={()=>del(j.id)}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
      {modal && <JobModal job={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={save}/>}
    </>
  )
}
