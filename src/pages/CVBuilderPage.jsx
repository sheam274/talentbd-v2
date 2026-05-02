import React, { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Plus, Trash2, Download, Eye, EyeOff, User, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Star, Award } from 'lucide-react'

const style = `
.cvb-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.cvb-header__btns{display:flex;gap:10px;flex-shrink:0}
.cvb-layout{display:grid;grid-template-columns:1fr 420px;gap:32px;align-items:start}
.cvb-layout--preview-only{grid-template-columns:1fr}
.cvb-form{display:flex;flex-direction:column;gap:20px}
.cvb-form__fields{display:flex;flex-direction:column;gap:14px;margin-top:14px}
.cvb-section-head{display:flex;align-items:center;justify-content:space-between}
.cvb-section-head__left{display:flex;align-items:center;gap:8px}
.cvb-section-head__left h3{font-family:var(--font-display);font-size:.95rem;font-weight:600;color:var(--color-text)}
.cvb-section-head__left svg{color:var(--color-primary)}
.cvb-add-btn{font-size:.78rem;color:var(--color-primary);padding:4px 10px}
.cvb-empty-hint{font-size:.82rem;color:var(--color-text-faint);font-style:italic;padding:8px 0}
.cvb-entry{background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:14px;display:flex;flex-direction:column;gap:10px}
.cvb-entry__head{display:flex;align-items:center;justify-content:space-between}
.cvb-entry__num{font-size:.72rem;font-weight:700;color:var(--color-primary);background:var(--color-primary-dim);padding:2px 8px;border-radius:20px}
.cvb-remove{color:var(--color-text-faint);padding:4px;border-radius:6px;transition:all var(--transition)}
.cvb-remove:hover{color:var(--color-error);background:rgba(248,113,113,.1)}
.cvb-skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.cvb-skill-row{display:flex;gap:6px;align-items:center}
.cvb-skill-row .form-input{flex:1}
.cvb-preview-sticky{position:sticky;top:88px}
.cv-preview{background:#fff;color:#1a1a2e;font-family:'DM Sans',sans-serif;font-size:11pt;padding:40px 44px;border-radius:var(--radius-lg);border:1px solid var(--color-border);min-height:640px;box-shadow:var(--shadow-card)}
.cv-preview__head{border-bottom:2.5px solid #2dd4bf;padding-bottom:16px;margin-bottom:18px}
.cv-preview__head h1{font-family:'Syne',sans-serif;font-size:22pt;font-weight:800;color:#0f172a;margin-bottom:2px}
.cv-preview__role{font-size:11pt;color:#2dd4bf;font-weight:600;margin-bottom:10px}
.cv-preview__contacts{display:flex;flex-wrap:wrap;gap:10px;font-size:9pt;color:#475569}
.cv-preview__sec{margin-bottom:18px}
.cv-preview__sec h2{font-family:'Syne',sans-serif;font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:10px}
.cv-preview__item{margin-bottom:10px}
.cv-preview__item-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:3px}
.cv-preview__item-head strong{font-size:10.5pt;color:#0f172a}
.cv-preview__co{color:#475569}
.cv-preview__date{font-size:9pt;color:#94a3b8;white-space:nowrap;flex-shrink:0}
.cv-preview__item p{font-size:9.5pt;color:#475569;line-height:1.6}
.cv-preview__skills-wrap{display:flex;flex-wrap:wrap;gap:5px}
.cv-preview__skill{background:#f0fdfa;border:1px solid #99f6e4;color:#0d9488;font-size:9pt;padding:2px 9px;border-radius:20px}
@media print{body{background:#fff!important}.navbar,.footer,.cvb-form,.cvb-header{display:none!important}.cvb-layout{display:block!important}.cvb-preview-sticky{position:static}.cv-preview{border:none!important;box-shadow:none!important;border-radius:0!important;padding:0!important}}
@media(max-width:1100px){.cvb-layout{grid-template-columns:1fr}.cvb-preview-sticky{position:static}}
@media(max-width:600px){.cvb-header__btns{flex-direction:column}}
`

const uid = () => Math.random().toString(36).slice(2,9)

const INIT = {
  personal:{ name:'',title:'',email:'',phone:'',location:'',website:'',summary:'' },
  experience:[], education:[], skills:[], certifications:[],
}

function SHead({ icon:Icon, title, onAdd, addLabel }) {
  return (
    <div className="cvb-section-head">
      <div className="cvb-section-head__left"><Icon size={15}/><h3>{title}</h3></div>
      {onAdd && <button className="btn btn-ghost cvb-add-btn" onClick={onAdd}><Plus size={13}/>{addLabel}</button>}
    </div>
  )
}

function CVPreview({ cv }) {
  const { personal:p, experience, education, skills, certifications } = cv
  return (
    <div className="cv-preview">
      <div className="cv-preview__head">
        <h1>{p.name||'Your Name'}</h1>
        <p className="cv-preview__role">{p.title||'Professional Title'}</p>
        <div className="cv-preview__contacts">
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.website  && <span>🌐 {p.website}</span>}
        </div>
      </div>
      {p.summary && <div className="cv-preview__sec"><h2>Summary</h2><p style={{fontSize:'9.5pt',color:'#475569',lineHeight:1.65}}>{p.summary}</p></div>}
      {experience.length>0 && <div className="cv-preview__sec"><h2>Work Experience</h2>{experience.map(e=>(
        <div key={e.id} className="cv-preview__item">
          <div className="cv-preview__item-head"><div><strong>{e.role}</strong><span className="cv-preview__co"> — {e.company}</span></div><span className="cv-preview__date">{e.from} – {e.to||'Present'}</span></div>
          {e.description&&<p>{e.description}</p>}
        </div>
      ))}</div>}
      {education.length>0 && <div className="cv-preview__sec"><h2>Education</h2>{education.map(e=>(
        <div key={e.id} className="cv-preview__item">
          <div className="cv-preview__item-head"><div><strong>{e.degree}</strong><span className="cv-preview__co"> — {e.institution}</span></div><span className="cv-preview__date">{e.from} – {e.to||'Present'}</span></div>
          {e.gpa&&<p>GPA: {e.gpa}</p>}
        </div>
      ))}</div>}
      {skills.length>0 && <div className="cv-preview__sec"><h2>Skills</h2><div className="cv-preview__skills-wrap">{skills.map(s=><span key={s.id} className="cv-preview__skill">{s.name}</span>)}</div></div>}
      {certifications.length>0 && <div className="cv-preview__sec"><h2>Certifications</h2>{certifications.map(c=>(
        <div key={c.id} className="cv-preview__item"><strong>{c.name}</strong> — {c.issuer}{c.year&&<span className="cv-preview__date"> ({c.year})</span>}</div>
      ))}</div>}
    </div>
  )
}

export default function CVBuilderPage() {
  const [cv, setCV]             = useState(INIT)
  const [preview, setPreview]   = useState(false)
  const printRef                = useRef()

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: `CV - ${cv.personal.name||'TalentBD'}` })

  const upP = (k,v) => setCV(c=>({...c, personal:{...c.personal,[k]:v}}))
  const add  = (sec,tmpl) => setCV(c=>({...c,[sec]:[...c[sec],{id:uid(),...tmpl}]}))
  const del  = (sec,id)   => setCV(c=>({...c,[sec]:c[sec].filter(x=>x.id!==id)}))
  const upI  = (sec,id,k,v) => setCV(c=>({...c,[sec]:c[sec].map(x=>x.id===id?{...x,[k]:v}:x)}))

  return (
    <>
      <style>{style}</style>
      <div className="page-wrapper">
        <div className="container">
          <div className="cvb-header animate-fade-up">
            <div><h1 className="section-title">CV Builder</h1><p className="section-subtitle">Build a professional CV and download as PDF</p></div>
            <div className="cvb-header__btns">
              <button className="btn btn-outline" onClick={()=>setPreview(v=>!v)}>
                {preview?<><EyeOff size={14}/>Edit</>:<><Eye size={14}/>Preview</>}
              </button>
              <button className="btn btn-primary" onClick={handlePrint}><Download size={14}/>Download PDF</button>
            </div>
          </div>

          <div className={`cvb-layout ${preview?'cvb-layout--preview-only':''}`}>
            {!preview && (
              <div className="cvb-form animate-fade-up">
                {/* Personal */}
                <div className="card">
                  <SHead icon={User} title="Personal Information"/>
                  <div className="cvb-form__fields">
                    <div className="grid-2">
                      {[['Full Name','name','Sheikh Ahmed'],['Professional Title','title','Full Stack Developer'],['Email','email','you@example.com'],['Phone','phone','+880 17XX XXXXXX'],['Location','location','Dhaka, Bangladesh'],['Website / LinkedIn','website','linkedin.com/in/you']].map(([lbl,key,ph])=>(
                        <div key={key} className="form-group">
                          <label className="form-label">{lbl}</label>
                          <input className="form-input" placeholder={ph} value={cv.personal[key]} onChange={e=>upP(key,e.target.value)}/>
                        </div>
                      ))}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Professional Summary</label>
                      <textarea className="form-input" rows={4} placeholder="Brief overview of your background and key strengths…" value={cv.personal.summary} onChange={e=>upP('summary',e.target.value)}/>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="card">
                  <SHead icon={Briefcase} title="Work Experience" onAdd={()=>add('experience',{role:'',company:'',from:'',to:'',description:''})} addLabel="Add"/>
                  <div className="cvb-form__fields">
                    {cv.experience.length===0&&<p className="cvb-empty-hint">No experience added yet.</p>}
                    {cv.experience.map((e,i)=>(
                      <div key={e.id} className="cvb-entry">
                        <div className="cvb-entry__head"><span className="cvb-entry__num">#{i+1}</span><button className="cvb-remove" onClick={()=>del('experience',e.id)}><Trash2 size={13}/></button></div>
                        <div className="grid-2">
                          {[['Job Title','role','Software Engineer'],['Company','company','bKash Limited'],['From','from','Jan 2022'],['To (blank = present)','to','Present']].map(([lbl,key,ph])=>(
                            <div key={key} className="form-group"><label className="form-label">{lbl}</label><input className="form-input" placeholder={ph} value={e[key]} onChange={ev=>upI('experience',e.id,key,ev.target.value)}/></div>
                          ))}
                        </div>
                        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} placeholder="Describe responsibilities and achievements…" value={e.description} onChange={ev=>upI('experience',e.id,'description',ev.target.value)}/></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="card">
                  <SHead icon={GraduationCap} title="Education" onAdd={()=>add('education',{degree:'',institution:'',from:'',to:'',gpa:''})} addLabel="Add"/>
                  <div className="cvb-form__fields">
                    {cv.education.length===0&&<p className="cvb-empty-hint">No education added yet.</p>}
                    {cv.education.map((e,i)=>(
                      <div key={e.id} className="cvb-entry">
                        <div className="cvb-entry__head"><span className="cvb-entry__num">#{i+1}</span><button className="cvb-remove" onClick={()=>del('education',e.id)}><Trash2 size={13}/></button></div>
                        <div className="grid-2">
                          {[['Degree','degree','B.Sc. in CSE'],['Institution','institution','RUET'],['From','from','2020'],['To','to','2024']].map(([lbl,key,ph])=>(
                            <div key={key} className="form-group"><label className="form-label">{lbl}</label><input className="form-input" placeholder={ph} value={e[key]} onChange={ev=>upI('education',e.id,key,ev.target.value)}/></div>
                          ))}
                          <div className="form-group"><label className="form-label">GPA (optional)</label><input className="form-input" placeholder="3.75 / 4.00" value={e.gpa} onChange={ev=>upI('education',e.id,'gpa',ev.target.value)}/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="card">
                  <SHead icon={Star} title="Skills" onAdd={()=>add('skills',{name:''})} addLabel="Add Skill"/>
                  <div className="cvb-form__fields">
                    {cv.skills.length===0&&<p className="cvb-empty-hint">Add your technical and soft skills.</p>}
                    <div className="cvb-skills-grid">
                      {cv.skills.map(s=>(
                        <div key={s.id} className="cvb-skill-row">
                          <input className="form-input" placeholder="e.g. React.js" value={s.name} onChange={e=>upI('skills',s.id,'name',e.target.value)}/>
                          <button className="cvb-remove" onClick={()=>del('skills',s.id)}><Trash2 size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="card">
                  <SHead icon={Award} title="Certifications" onAdd={()=>add('certifications',{name:'',issuer:'',year:''})} addLabel="Add"/>
                  <div className="cvb-form__fields">
                    {cv.certifications.length===0&&<p className="cvb-empty-hint">Add certifications, courses, or awards.</p>}
                    {cv.certifications.map((c,i)=>(
                      <div key={c.id} className="cvb-entry">
                        <div className="cvb-entry__head"><span className="cvb-entry__num">#{i+1}</span><button className="cvb-remove" onClick={()=>del('certifications',c.id)}><Trash2 size={13}/></button></div>
                        <div className="grid-2">
                          {[['Certificate Name','name','AWS Solutions Architect'],['Issuer','issuer','Amazon'],['Year','year','2024']].map(([lbl,key,ph])=>(
                            <div key={key} className="form-group"><label className="form-label">{lbl}</label><input className="form-input" placeholder={ph} value={c[key]} onChange={e=>upI('certifications',c.id,key,e.target.value)}/></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className={preview?'':' cvb-preview-sticky'}>
              <div ref={printRef}><CVPreview cv={cv}/></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
