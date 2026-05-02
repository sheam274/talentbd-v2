import React, { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Search, Trash2, Shield, User, Mail } from 'lucide-react'

const style = `
.adm-table-wrap{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden}
.adm-table-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--color-border);gap:14px;flex-wrap:wrap}
.adm-table-head h2{font-family:var(--font-display);font-size:.95rem;font-weight:700;color:var(--color-text)}
.adm-search-wrap{position:relative}
.adm-search-wrap svg.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-faint)}
.adm-search-wrap input{background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:8px 12px 8px 32px;color:var(--color-text);font-size:.85rem;width:240px;transition:border-color var(--transition)}
.adm-search-wrap input:focus{outline:none;border-color:var(--color-primary)}
table{width:100%;border-collapse:collapse}
thead{background:var(--color-bg-elevated)}
th{padding:10px 18px;text-align:left;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-faint);border-bottom:1px solid var(--color-border)}
td{padding:13px 18px;font-size:.85rem;color:var(--color-text);border-bottom:1px solid var(--color-border-soft)}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.adm-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:16px;flex-wrap:wrap}
.adm-page-head h1{font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--color-text);margin-bottom:4px}
.adm-page-head p{font-size:.85rem;color:var(--color-text-muted)}
.u-av{width:34px;height:34px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:.88rem;color:#0a0d12;flex-shrink:0}
`

export default function AdminUsers() {
  const [users,  setUsers]  = useState([])
  const [loading,setLoading]= useState(true)
  const [q,      setQ]      = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change ${u.name}'s role to "${newRole}"?`)) return
    await updateDoc(doc(db, 'users', u.id), { role: newRole })
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x))
  }

  const del = async (u) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return
    await deleteDoc(doc(db, 'users', u.id))
    setUsers(prev => prev.filter(x => x.id !== u.id))
  }

  const fmt = ts => ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : '—'

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(q.toLowerCase()) ||
    u.email?.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <style>{style}</style>
      <div className="adm-page-head animate-fade-up">
        <div>
          <h1>Users</h1>
          <p>Manage all registered users and their roles</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <span className="badge badge-teal">{users.length} Total</span>
          <span className="badge badge-orange">{users.filter(u => u.role==='admin').length} Admins</span>
        </div>
      </div>

      <div className="adm-table-wrap animate-fade-up">
        <div className="adm-table-head">
          <h2>{filtered.length} User{filtered.length !== 1 ? 's' : ''}</h2>
          <div className="adm-search-wrap">
            <Search size={13} className="si"/>
            <input placeholder="Search name or email…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
        </div>

        {loading
          ? <div style={{ display:'flex', justifyContent:'center', padding:48 }}><div className="spinner" style={{ width:32,height:32 }}/></div>
          : filtered.length === 0
            ? <div className="empty-state"><User size={40}/><h3>No users found</h3></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>User</th><th>Email</th><th>Role</th>
                    <th>Joined</th><th>CV Analyses</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="u-av">{u.name?.charAt(0).toUpperCase() || '?'}</div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--color-text-muted)', fontSize:'.82rem' }}>
                          <Mail size={11}/>{u.email}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.role==='admin' ? 'badge-orange' : 'badge-teal'}`}>
                          {u.role==='admin' ? <Shield size={10}/> : <User size={10}/>} {u.role}
                        </span>
                      </td>
                      <td style={{ color:'var(--color-text-muted)', fontSize:'.8rem' }}>{fmt(u.createdAt)}</td>
                      <td><span className="badge badge-teal">{u.cvCount || 0}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:8 }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding:'4px 10px', fontSize:'.78rem' }}
                            onClick={() => toggleRole(u)}
                          >
                            <Shield size={11}/>
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding:'4px 8px', color:'var(--color-error)' }}
                            onClick={() => del(u)}
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>
    </>
  )
}
