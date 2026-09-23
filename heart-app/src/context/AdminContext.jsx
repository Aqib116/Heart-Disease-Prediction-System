import { createContext, useContext, useState, useEffect } from 'react'

const AdminContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) return null
  return res.json()
}

async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  return res.json()
}

async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE' })
  return res.json()
}

// Only the active admin session pointer stays in localStorage; everything
// else (admin accounts, active algorithm, approvals) lives in the database.
function loadAdminSession() {
  const data = localStorage.getItem('hdp_admin_session')
  return data ? JSON.parse(data) : null
}

// AdminProvider

export function AdminProvider({ children }) {
  const [accounts, setAccounts] = useState({})
  const [adminUser, setAdminUser] = useState(() => loadAdminSession())
  const [activeAlgorithm, setActiveAlgorithmState] = useState('random_forest')

  const refreshAccounts = async () => {
    const data = await apiGet('/api/admin/accounts')
    setAccounts(data || {})
  }

  useEffect(() => {
    refreshAccounts()
    apiGet('/api/settings/active-algorithm').then(data => {
      if (data?.value) setActiveAlgorithmState(data.value)
    })
  }, [])

  const adminRegister = async (name, email, password) => {
    const result = await apiPost('/api/admin/register', { name, email, password })
    if (result.success) refreshAccounts()
    return result
  }

  const adminLogin = async (email, password, expectedRole = null) => {
    const result = await apiPost('/api/admin/login', { email, password, expectedRole })
    if (result.success) {
      setAdminUser(result.session)
      localStorage.setItem('hdp_admin_session', JSON.stringify(result.session))
    }
    return result
  }

  const adminLogout = () => {
    setAdminUser(null)
    localStorage.removeItem('hdp_admin_session')
  }

  const updateAdminProfile = async (updates) => {
    const result = await apiPost(`/api/admin/profile/${encodeURIComponent(adminUser.email)}`, updates)
    if (result.success) {
      setAdminUser(result.session)
      localStorage.setItem('hdp_admin_session', JSON.stringify(result.session))
      refreshAccounts()
    }
    return result
  }

  const changeAdminPassword = async (currentPassword, newPassword) => {
    return apiPost(`/api/admin/change-password/${encodeURIComponent(adminUser.email)}`, { currentPassword, newPassword })
  }

  const setActiveAlgorithm = async (algo) => {
    setActiveAlgorithmState(algo)
    await apiPost('/api/settings/active-algorithm', { value: algo })
  }

  const approveAdmin = async (email) => {
    setAccounts(a => ({ ...a, [email]: { ...a[email], status: 'active' } }))
    await apiPost(`/api/admin/accounts/${encodeURIComponent(email)}/approve`)
  }

  const rejectAdmin = async (email) => {
    setAccounts(a => {
      const updated = { ...a }
      delete updated[email]
      return updated
    })
    await apiDelete(`/api/admin/accounts/${encodeURIComponent(email)}`)
  }

  const value = {
    adminUser, adminRegister, adminLogin, adminLogout,
    activeAlgorithm, setActiveAlgorithm,
    accounts, approveAdmin, rejectAdmin,
    updateAdminProfile, changeAdminPassword,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
