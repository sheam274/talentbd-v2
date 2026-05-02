import React, { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Zap, BarChart2, RefreshCw, X } from 'lucide-react'

const style = `
.cva-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.cva-box{max-width:680px;display:flex;flex-direction:column;gap:20px}
.cva-drop{border:2px dashed var(--color-border);border-radius:var(--radius-lg);padding:48px 32px;text-align:center;cursor:pointer;transition:all var(--transition);display:flex;flex-direction:column;align-items:center;gap:12px}
.cva-drop:hover,.cva-drop--over{border-color:var(--color-primary);background:var(--color-primary-dim)}
.cva-drop--filled{border-style:solid;border-color:var(--color-primary);background:var(--color-primary-dim)}
.cva-drop__title{font-family:var(--font-display);font-size:1rem;font-weight:600;color:var(--color-text)}
.cva-drop__hint{font-size:.82rem;color:var(--color-text-muted)}
.cva-drop__file{font-weight:600;color:var(--color-primary)}
.cva-or{display:flex;align-items:center;gap:12px;color:var(--color-text-faint);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}
.cva-or::before,.cva-or::after{content:'';flex:1;height:1px;background:var(--color-border)}
.cva-err{display:flex;align-items:center;gap:10px;background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.22);border-radius:var(--radius-md);padding:12px 16px;font-size:.875rem;color:var(--color-error)}
.cva-btn{align-self:flex-start;padding:11px 32px;font-size:1rem}
.cva-results{display:flex;flex-direction:column;gap:20px}
.cva-overview{display:flex;flex-direction:column;gap:20px}
.cva-scores{display:flex;align-items:center;gap:32px;flex-wrap:wrap}
.cva-grade-wrap{display:flex;flex-direction:column;align-items:center;gap:8px}
.cva-grade{width:64px;height:64px;border:3px solid;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:1.5rem;font-weight:800}
.cva-grade__lbl{font-size:.72rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em}
.cva-summary{font-size:.9rem;color:var(--color-text-muted);line-height:1.7;border-left:3px solid var(--color-primary);padding-left:14px}
.cva-card-title{display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-size:.92rem;font-weight:700;margin-bottom:14px}
.cva-list{list-style:none;display:flex;flex-direction:column;gap:8px}
.cva-list li{font-size:.85rem;padding:8px 12px;border-radius:var(--radius-sm);line-height:1.5}
.cva-list li.good{background:rgba(52,211,153,.07);border-left:3px solid var(--color-success)}
.cva-list li.warn{background:rgba(251,191,36,.07);border-left:3px solid var(--color-warning)}
.cva-improv{display:flex;flex-direction:column;gap:12px}
.cva-improv-item{background:var(--color-bg-elevated);border-radius:var(--radius-md);padding:14px;display:flex;flex-direction:column;gap:8px}
.cva-improv-area{font-family:var(--font-display);font-size:.78rem;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:.04em}
.cva-improv-issue{display:flex;align-items:flex-start;gap:7px;font-size:.83rem;color:var(--color-error);line-height:1.5}
.cva-improv-fix{display:flex;align-items:flex-start;gap:7px;font-size:.83rem;color:var(--color-success);line-height:1.5}
.cva-kw-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.cva-kw-lbl{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px}
.cva-kw-tags{display:flex;flex-wrap:wrap;gap:6px}
.score-ring{display:flex;flex-direction:column;align-items:center;gap:6px}
.score-ring__lbl{font-size:.72rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em}
@media(max-width:600px){.cva-kw-grid{grid-template-columns:1fr}}
`

const GRADE_COLORS = { A:'#34d399', B:'#2dd4bf', C:'#fbbf24', D:'#f97316', F:'#f87171' }

function ScoreRing({ score, label, color }) {
  const r=36, c=2*Math.PI*r, d=c*(score/100)
  return (
    <div className="score-ring">
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={7}/>
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${d} ${c}`} strokeLinecap="round" transform="rotate(-90 45 45)"
          style={{transition:'stroke-dasharray 1s ease'}}/>
        <text x={45} y={50} textAnchor="middle" fill={color}
          style={{fontSize:'15px',fontFamily:'Syne,sans-serif',fontWeight:700}}>{score}</text>
      </svg>
      <span className="score-ring__lbl">{label}</span>
    </div>
  )
}

// Call our backend API — Gemini key stays on server
async function analyzeCV(text) {
  const res = await fetch('/api/analyze-cv', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ cvText: text }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`)
  return data
}

function Results({ r }) {
  const gc = GRADE_COLORS[r.grade] || '#8892a4'
  return (
    <div className="cva-results animate-fade-up">
      <div className="card cva-overview">
        <div className="cva-scores">
          <ScoreRing score={r.score||0}     label="Overall"   color="#2dd4bf"/>
          <ScoreRing score={r.ats_score||0} label="ATS Score" color="#f97316"/>
          <div className="cva-grade-wrap">
            <div className="cva-grade" style={{color:gc,borderColor:gc}}>{r.grade}</div>
            <span className="cva-grade__lbl">Grade</span>
          </div>
        </div>
        <p className="cva-summary">{r.summary}</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="cva-card-title"><CheckCircle size={15} style={{color:'var(--color-success)'}}/>Strengths</div>
          <ul className="cva-list">{(r.strengths||[]).map((s,i)=><li key={i} className="good">{s}</li>)}</ul>
        </div>
        <div className="card">
          <div className="cva-card-title"><AlertTriangle size={15} style={{color:'var(--color-warning)'}}/>Missing Sections</div>
          {(r.missing_sections||[]).length>0
            ? <ul className="cva-list">{r.missing_sections.map((s,i)=><li key={i} className="warn">{s}</li>)}</ul>
            : <p style={{fontSize:'.85rem',color:'var(--color-success)'}}>No critical sections missing ✓</p>}
        </div>
      </div>

      {(r.improvements||[]).length>0 && (
        <div className="card">
          <div className="cva-card-title"><Zap size={15} style={{color:'var(--color-primary)'}}/>Suggested Improvements</div>
          <div className="cva-improv">
            {r.improvements.map((imp,i)=>(
              <div key={i} className="cva-improv-item">
                <div className="cva-improv-area">{imp.area}</div>
                <div className="cva-improv-issue"><XCircle size={12} style={{marginTop:2,flexShrink:0}}/>{imp.issue}</div>
                <div className="cva-improv-fix"><CheckCircle size={12} style={{marginTop:2,flexShrink:0}}/><strong>Fix:</strong>&nbsp;{imp.fix}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="cva-card-title"><BarChart2 size={15} style={{color:'var(--color-primary)'}}/>ATS Keyword Analysis</div>
        <div className="cva-kw-grid">
          <div>
            <p className="cva-kw-lbl" style={{color:'var(--color-success)'}}>Found</p>
            <div className="cva-kw-tags">{(r.ats_keywords_found||[]).map((k,i)=><span key={i} className="tag" style={{borderColor:'rgba(52,211,153,.3)',color:'var(--color-success)'}}>{k}</span>)}</div>
          </div>
          <div>
            <p className="cva-kw-lbl" style={{color:'var(--color-warning)'}}>Missing</p>
            <div className="cva-kw-tags">{(r.ats_keywords_missing||[]).map((k,i)=><span key={i} className="tag" style={{borderColor:'rgba(251,191,36,.3)',color:'var(--color-warning)'}}>{k}</span>)}</div>
          </div>
        </div>
      </div>

      {(r.weak_phrases||[]).length>0 && (
        <div className="card">
          <div className="cva-card-title"><AlertTriangle size={15} style={{color:'var(--color-accent)'}}/>Weak Phrases to Avoid</div>
          <div className="cva-kw-tags" style={{marginTop:8}}>
            {r.weak_phrases.map((p,i)=><span key={i} className="tag" style={{borderColor:'rgba(249,115,22,.3)',color:'var(--color-accent)',fontStyle:'italic'}}>"{p}"</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CVAnalyzerPage() {
  const [file,    setFile]    = useState(null)
  const [text,    setText]    = useState('')
  const [over,    setOver]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const handleFile = useCallback(f => {
    if (!f) return
    setFile(f); setResult(null); setError('')
    const reader = new FileReader()
    reader.onload  = e => setText(e.target.result)
    reader.onerror = () => setError('Could not read file.')
    reader.readAsText(f)
  }, [])

  const handleAnalyze = async () => {
    const src = text || (file ? `File: ${file.name}` : '')
    if (!src.trim()) return setError('Please upload a CV file or paste your CV text.')
    setLoading(true); setError(''); setResult(null)
    try { setResult(await analyzeCV(src)) }
    catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{style}</style>
      <div className="page-wrapper">
        <div className="container">
          <div className="cva-header animate-fade-up">
            <div>
              <h1 className="section-title">CV Analyzer</h1>
              <p className="section-subtitle">AI-powered feedback — score, ATS check, and actionable improvements</p>
            </div>
            {result && (
              <button className="btn btn-ghost" onClick={()=>{setResult(null);setFile(null);setText('')}}>
                <RefreshCw size={14}/>Analyze Another
              </button>
            )}
          </div>

          {!result && (
            <div className="card cva-box animate-fade-up">
              <div
                className={`cva-drop ${over?'cva-drop--over':''} ${file?'cva-drop--filled':''}`}
                onDragOver={e=>{e.preventDefault();setOver(true)}}
                onDragLeave={()=>setOver(false)}
                onDrop={e=>{e.preventDefault();setOver(false);handleFile(e.dataTransfer.files[0])}}
                onClick={()=>document.getElementById('cv-file-input').click()}
              >
                <input id="cv-file-input" type="file" accept=".pdf,.txt,.doc,.docx"
                  style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
                {file
                  ? <><FileText size={36} style={{color:'var(--color-primary)'}}/><p className="cva-drop__file">{file.name}</p><p className="cva-drop__hint">Click to change file</p></>
                  : <><Upload size={36} style={{color:'var(--color-text-faint)'}}/><p className="cva-drop__title">Drop your CV here</p><p className="cva-drop__hint">PDF, TXT, DOC · or click to browse</p></>
                }
              </div>

              <div className="cva-or"><span>OR paste your CV text</span></div>

              <textarea className="form-input" rows={8}
                placeholder="Paste your CV content here…"
                value={text} onChange={e=>{setText(e.target.value);setFile(null)}}/>

              {error && <div className="cva-err"><AlertTriangle size={15}/><span>{error}</span></div>}

              <button className="btn btn-primary cva-btn" onClick={handleAnalyze}
                disabled={loading||(!file&&!text.trim())}>
                {loading
                  ? <><div className="spinner" style={{width:16,height:16}}/>Analyzing…</>
                  : <><Zap size={15}/>Analyze My CV</>
                }
              </button>
            </div>
          )}

          {result && <Results r={result}/>}
        </div>
      </div>
    </>
  )
}
