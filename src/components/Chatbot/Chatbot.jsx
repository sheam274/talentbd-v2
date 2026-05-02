import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader, Minimize2, Sparkles, Trash2 } from 'lucide-react'

const SYSTEM_FALLBACKS = {
  cv:        '📄 For a strong CV: keep it 1-2 pages, use action verbs, tailor per job.\nTry our **CV Builder** to make a PDF instantly, then **CV Analyzer** for your AI score!',
  job:       '💼 Top BD roles right now: React/Vue devs, Python engineers, Data Analysts, DevOps.\nCompanies hiring: bKash, Shohoz, Brain Station 23, BJIT, Pathao.\nCheck **Live Jobs** for the latest!',
  salary:    '💰 Dhaka salaries:\n• Fresh dev: ৳30k–50k/month\n• Mid-level: ৳55k–85k\n• Senior: ৳90k–150k+\n• Data Scientist: ৳50k–120k\nRemote jobs often pay significantly more!',
  interview: '🎯 Interview tips:\n• Research the company thoroughly\n• Practice DSA problems daily\n• Prepare STAR-format behavioral answers\n• Ask thoughtful questions\n• Send a thank-you email after!',
  learn:     '📚 Our **Learning Hub** has free courses:\nReact, Node.js, Python, Data Science, Figma, Docker, AI/ML, Flutter and career skills.\nAll free — go check it out!',
  default:   '👋 I can help with BD job search, CV tips, interview prep, salary info, and learning resources.\nWhat would you like to know?',
}

function getSmartFallback(text) {
  const t = text.toLowerCase()
  if (t.match(/cv|resume|curriculum/))    return SYSTEM_FALLBACKS.cv
  if (t.match(/job|work|hire|company/))   return SYSTEM_FALLBACKS.job
  if (t.match(/salary|pay|income|wage/))  return SYSTEM_FALLBACKS.salary
  if (t.match(/interview|question/))      return SYSTEM_FALLBACKS.interview
  if (t.match(/learn|course|skill/))      return SYSTEM_FALLBACKS.learn
  return SYSTEM_FALLBACKS.default
}

const WELCOME = {
  role: 'assistant',
  content: "Assalamu Alaikum! 👋 I'm TalentBot, your Gemini AI career assistant.\n\nI can help with BD jobs, CV tips, interview prep, salary info, and how to use TalentBD. What's on your mind?",
}

const SUGGESTIONS = [
  'What tech jobs are in demand in BD?',
  'How to make my CV ATS-friendly?',
  'Tips for a fresh CSE graduate?',
  'Expected salary for a React developer?',
]

const style = `
.cb-fab{position:fixed;bottom:28px;right:28px;z-index:500;width:58px;height:58px;border-radius:50%;background:var(--color-primary);color:#0a0d12;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(45,212,191,.45);transition:all var(--transition)}
.cb-fab:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(45,212,191,.6)}
.cb-fab--open{background:var(--color-bg-elevated);color:var(--color-text);box-shadow:var(--shadow-card)}
.cb-fab__badge{position:absolute;top:-4px;right:-4px;background:var(--color-accent);color:#fff;font-size:.6rem;font-weight:700;padding:2px 5px;border-radius:10px;letter-spacing:.04em}
.cb-window{position:fixed;bottom:100px;right:28px;z-index:499;width:360px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);box-shadow:0 8px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;max-height:560px}
.cb-window--min{max-height:66px}
.cb-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,rgba(45,212,191,.1),rgba(249,115,22,.05));border-bottom:1px solid var(--color-border);flex-shrink:0}
.cb-head__info{display:flex;align-items:center;gap:10px}
.cb-head__avatar{width:34px;height:34px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0a0d12}
.cb-head__name{display:block;font-family:var(--font-display);font-size:.9rem;font-weight:700;color:var(--color-text)}
.cb-head__status{display:flex;align-items:center;gap:4px;font-size:.7rem;color:var(--color-text-muted)}
.cb-status-dot{width:6px;height:6px;background:var(--color-success);border-radius:50%;animation:pulse 2s infinite}
.cb-head__btns{display:flex;gap:4px}
.cb-head__btn{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--color-text-muted);transition:all var(--transition)}
.cb-head__btn:hover{background:var(--color-bg-elevated);color:var(--color-text)}
.cb-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;min-height:200px;max-height:340px}
.cb-msgs::-webkit-scrollbar{width:3px}
.cb-msgs::-webkit-scrollbar-thumb{background:var(--color-bg-elevated);border-radius:2px}
.cb-msg{display:flex;gap:8px;align-items:flex-end}
.cb-msg--user{flex-direction:row-reverse}
.cb-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cb-av--bot{background:var(--color-primary-dim);color:var(--color-primary)}
.cb-av--user{background:var(--color-accent-dim);color:var(--color-accent)}
.cb-bubble{max-width:82%;padding:9px 13px;border-radius:14px;font-size:.875rem;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.cb-bubble--bot{background:var(--color-bg-elevated);border:1px solid var(--color-border);color:var(--color-text);border-bottom-left-radius:4px}
.cb-bubble--user{background:var(--color-primary);color:#0a0d12;font-weight:500;border-bottom-right-radius:4px}
.cb-bubble--typing{display:flex;gap:5px;align-items:center;padding:12px 16px}
.cb-bubble--typing span{width:7px;height:7px;background:var(--color-text-faint);border-radius:50%;animation:bounce 1.2s infinite}
.cb-bubble--typing span:nth-child(2){animation-delay:.2s}
.cb-bubble--typing span:nth-child(3){animation-delay:.4s}
.cb-sugg{display:flex;flex-direction:column;gap:6px;padding:0 16px 12px}
.cb-sugg-btn{text-align:left;padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:.78rem;color:var(--color-text-muted);background:var(--color-bg-elevated);transition:all var(--transition)}
.cb-sugg-btn:hover{border-color:var(--color-primary);color:var(--color-primary);background:var(--color-primary-dim)}
.cb-input-area{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--color-border);flex-shrink:0}
.cb-input{flex:1;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:9px 12px;color:var(--color-text);font-size:.875rem;resize:none;line-height:1.5;max-height:80px;overflow-y:auto;transition:border-color var(--transition);font-family:var(--font-body)}
.cb-input:focus{outline:none;border-color:var(--color-primary)}
.cb-input::placeholder{color:var(--color-text-faint)}
.cb-send{width:38px;height:38px;background:var(--color-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:#0a0d12;flex-shrink:0;align-self:flex-end;transition:all var(--transition)}
.cb-send:hover:not(:disabled){background:#5eead4;transform:translateY(-1px)}
.cb-send:disabled{opacity:.4;cursor:not-allowed}
.cb-footer{text-align:center;font-size:.68rem;color:var(--color-text-faint);padding-bottom:8px;flex-shrink:0}
@media(max-width:480px){.cb-window{right:10px;bottom:90px;width:calc(100vw - 20px)}.cb-fab{right:14px;bottom:18px}}
`

export default function Chatbot() {
  const [open,     setOpen]     = useState(false)
  const [minimized,setMin]      = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100) }, [open, minimized])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return

    const newMessages = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // Call our backend API — key is safe on server
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:  q,
          messages: messages, // send history for context
        }),
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

    } catch (err) {
      console.warn('[TalentBot] API failed, using fallback:', err.message)
      // Smart local fallback if backend fails
      await new Promise(r => setTimeout(r, 500))
      setMessages(prev => [...prev, { role: 'assistant', content: getSmartFallback(q) }])
    } finally {
      setLoading(false)
    }
  }

  const clear = () => setMessages([{ ...WELCOME, content: 'Chat cleared! How can I help you today? 😊' }])

  return (
    <>
      <style>{style}</style>

      {/* FAB */}
      <button
        className={`cb-fab ${open ? 'cb-fab--open' : ''}`}
        onClick={() => { setOpen(v => !v); setMin(false) }}
        aria-label="TalentBot"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="cb-fab__badge">AI</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className={`cb-window animate-fade-up ${minimized ? 'cb-window--min' : ''}`}>

          {/* Header */}
          <div className="cb-head">
            <div className="cb-head__info">
              <div className="cb-head__avatar"><Sparkles size={15} /></div>
              <div>
                <span className="cb-head__name">TalentBot</span>
                <span className="cb-head__status">
                  <span className="cb-status-dot" /> Gemini AI · Online
                </span>
              </div>
            </div>
            <div className="cb-head__btns">
              <button className="cb-head__btn" onClick={clear} title="Clear chat"><Trash2 size={13} /></button>
              <button className="cb-head__btn" onClick={() => setMin(v => !v)} title="Minimize"><Minimize2 size={13} /></button>
              <button className="cb-head__btn" onClick={() => setOpen(false)} title="Close"><X size={13} /></button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="cb-msgs">
                {messages.map((m, i) => (
                  <div key={i} className={`cb-msg cb-msg--${m.role === 'assistant' ? 'bot' : 'user'}`}>
                    <div className={`cb-av cb-av--${m.role === 'assistant' ? 'bot' : 'user'}`}>
                      {m.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
                    </div>
                    <div className={`cb-bubble cb-bubble--${m.role === 'assistant' ? 'bot' : 'user'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="cb-msg cb-msg--bot">
                    <div className="cb-av cb-av--bot"><Bot size={13} /></div>
                    <div className="cb-bubble cb-bubble--typing"><span /><span /><span /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggested questions on fresh chat */}
              {messages.length === 1 && (
                <div className="cb-sugg">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="cb-sugg-btn" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="cb-input-area">
                <textarea
                  ref={inputRef}
                  className="cb-input"
                  rows={1}
                  placeholder="Ask about jobs, CV tips, careers…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                />
                <button
                  className="cb-send"
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                >
                  {loading ? <Loader size={15} className="spinning" /> : <Send size={15} />}
                </button>
              </div>

              <p className="cb-footer">Powered by Gemini AI · TalentBD</p>
            </>
          )}
        </div>
      )}
    </>
  )
}
