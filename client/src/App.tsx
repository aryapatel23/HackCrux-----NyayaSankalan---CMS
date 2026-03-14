import './App.css'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Login } from './pages/auth/Login'
import { PoliceDashboard } from './pages/police/Dashboard'
import { SHODashboard } from './pages/sho/Dashboard'

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/police/dashboard" element={<PoliceDashboard />} />
        <Route path="/sho/dashboard" element={<SHODashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
