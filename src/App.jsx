import React from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar  from './components/layout/Navbar'
import Footer  from './components/layout/Footer'
import Chatbot from './components/Chatbot/Chatbot'

import HomePage        from './pages/HomePage'
import JobsPage        from './pages/JobsPage'
import CVBuilderPage   from './pages/CVBuilderPage'
import CVAnalyzerPage  from './pages/CVAnalyzerPage'
import LearningHubPage from './pages/LearningHubPage'
import LoginPage       from './pages/LoginPage'
import SignupPage      from './pages/SignupPage'

import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminJobs      from './pages/admin/AdminJobs'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminVideos    from './pages/admin/AdminVideos'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
      <Chatbot />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/"            element={<HomePage />} />
            <Route path="/jobs"        element={<JobsPage />} />
            <Route path="/cv-builder"  element={<CVBuilderPage />} />
            <Route path="/cv-analyzer" element={<CVAnalyzerPage />} />
            <Route path="/learning"    element={<LearningHubPage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/signup"      element={<SignupPage />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
          }>
            <Route index         element={<AdminDashboard />} />
            <Route path="jobs"   element={<AdminJobs />} />
            <Route path="users"  element={<AdminUsers />} />
            <Route path="videos" element={<AdminVideos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
