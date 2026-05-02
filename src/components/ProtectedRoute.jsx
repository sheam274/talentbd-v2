import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && userProfile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}
