import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import { AdminProvider } from './context/AdminContext'
import AdminLoginPage from './pages/AdminLoginPage'
import SuperAdminLoginPage from './pages/SuperAdminLoginPage'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AdminPanel from './pages/AdminPanel'


export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><HistoryPage /></ProtectedRoute>
            } />
            <Route path="/account-settings" element={
              <ProtectedRoute><AccountSettingsPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/superadmin" element={<SuperAdminLoginPage />} />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute requireRole="admin"><AdminPanel /></AdminProtectedRoute>
            } />
            <Route path="/superadmin/dashboard" element={
              <AdminProtectedRoute requireRole="superadmin"><AdminPanel /></AdminProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  )
}