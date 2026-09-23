import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function AdminProtectedRoute({ children, requireRole }) {
  const { adminUser } = useAdmin()
  const loginPath = requireRole === 'superadmin' ? '/superadmin' : '/admin'

  if (!adminUser) {
    return <Navigate to={loginPath} replace />
  }

  if (requireRole && adminUser.role !== requireRole) {
    return <Navigate to={loginPath} replace />
  }

  return children
}