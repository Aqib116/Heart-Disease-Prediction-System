import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

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


function loadSessionEmail() {
  return localStorage.getItem('hdp_current_user')
}

// AuthProvider

export function AuthProvider({ children }) {
  const [users, setUsers] = useState({})
  const [user, setUser] = useState(() => {
    const email = loadSessionEmail()
    return email ? { email } : null
  })
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [predictionsInfo, setPredictionsInfo] = useState({ total: 0, highRisk: 0, perUser: {} })

  const refreshUsers = async () => {
    const data = await apiGet('/api/users')
    setUsers(data || {})
  }

  const refreshStats = async () => {
    const data = await apiGet('/api/stats')
    setPredictionsInfo(data || { total: 0, highRisk: 0, perUser: {} })
  }

  
  useEffect(() => {
    refreshUsers()
    refreshStats()
  }, [])


  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileLoaded(false)
      setPredictions([])
      return
    }
    setProfileLoaded(false)
    apiGet(`/api/profile/${encodeURIComponent(user.email)}`).then(p => { setProfile(p); setProfileLoaded(true) })
    apiGet(`/api/predictions/${encodeURIComponent(user.email)}`).then(list => setPredictions(list || []))
  }, [user])

  const login = async (email, password) => {
    const result = await apiPost('/api/login', { email, password })
    if (result.success) {
      setUser({ email })
      localStorage.setItem('hdp_current_user', email)
    }
    return result
  }

  const register = async (email, password) => {
    const result = await apiPost('/api/register', { email, password })
    if (result.success) {
      setUser({ email })
      localStorage.setItem('hdp_current_user', email)
      refreshUsers()
    }
    return result
  }

  const logout = () => {
    setUser(null)
    setProfile(null)
    setPredictions([])
    localStorage.removeItem('hdp_current_user')
  }

  const saveProfile = async (profileData) => {
    setProfile(profileData)
    setProfileLoaded(true)
    await apiPost(`/api/profile/${encodeURIComponent(user.email)}`, profileData)
  }

  const banUser = async (email) => {
    setUsers(u => ({ ...u, [email]: { ...u[email], banned: true } }))
    await apiPost(`/api/users/${encodeURIComponent(email)}/ban`)
  }

  const unbanUser = async (email) => {
    setUsers(u => ({ ...u, [email]: { ...u[email], banned: false } }))
    await apiPost(`/api/users/${encodeURIComponent(email)}/unban`)
  }

  const deleteUser = async (email) => {
    setUsers(u => {
      const updated = { ...u }
      delete updated[email]
      return updated
    })
    await apiDelete(`/api/users/${encodeURIComponent(email)}`)
    refreshStats()
  }

  const changePassword = async (currentPassword, newPassword) => {
    return apiPost(`/api/users/${encodeURIComponent(user.email)}/change-password`, { currentPassword, newPassword })
  }

  const deleteAccount = async () => {
    await apiDelete(`/api/account/${encodeURIComponent(user.email)}`)
    localStorage.removeItem('hdp_current_user')
    setUser(null)
    setProfile(null)
    setPredictions([])
    refreshUsers()
  }

  const addPrediction = async (predictionData) => {
    const newEntry = await apiPost(`/api/predictions/${encodeURIComponent(user.email)}`, predictionData)
    setPredictions(p => [newEntry, ...p])
    refreshStats()
    return newEntry
  }

  const deletePrediction = async (id) => {
    setPredictions(p => p.filter(pr => pr.id !== id))
    await apiDelete(`/api/predictions/${encodeURIComponent(user.email)}/${id}`)
    refreshStats()
  }

  const deleteAllPredictions = async () => {
    setPredictions([])
    await apiDelete(`/api/predictions/${encodeURIComponent(user.email)}`)
    refreshStats()
  }

  const getPredictionsInfo = () => predictionsInfo

  const exportDataset = async () => {
    const rows = await apiGet('/api/dataset')
    const header = ['email', 'age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo',
      'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bmi',
      'prediction', 'risk_percent', 'risk_level', 'algorithm_used', 'date']

    const csvRows = [header]
    ;(rows || []).forEach(r => {
      csvRows.push(header.map(col => r[col] ?? ''))
    })

    const csvText = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvText], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'heart_dataset_export.csv'
    link.click()
  }

  const clearAllData = async () => {
    await Promise.all(Object.keys(users).map(email => apiDelete(`/api/predictions/${encodeURIComponent(email)}`)))
    if (user) {
      const list = await apiGet(`/api/predictions/${encodeURIComponent(user.email)}`)
      setPredictions(list || [])
    }
    refreshStats()
  }

  const createBackup = async () => {
    const backup = await apiGet('/api/backup')
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `hdp_backup_${Date.now()}.json`
    link.click()
  }

  const restoreBackup = async (backupData) => {
    await apiPost('/api/restore', backupData)
    await refreshUsers()
    await refreshStats()
  }

  const value = {
    user, login, register, logout, profile, profileLoaded, saveProfile,
    users, banUser, unbanUser, deleteUser,
    predictions, addPrediction, deletePrediction, deleteAllPredictions,
    getPredictionsInfo, exportDataset, clearAllData,
    createBackup, restoreBackup,
    changePassword, deleteAccount,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
