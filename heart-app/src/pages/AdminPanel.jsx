import { useState, useEffect } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useAuth } from '../context/AuthContext'

// Sidebar 

function SidebarItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: active ? 'rgba(234, 179, 8, 0.12)' : 'none',
        border: 'none',
        color: active ? 'var(--gold)' : 'var(--text-primary)',
        padding: '10px 12px',
        borderRadius: '6px',
        marginBottom: '3px',
        cursor: 'pointer',
        fontWeight: active ? 700 : 500,
        fontSize: '14px',
      }}
    >
      {active && '• '}{label}
    </button>
  )
}

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <p style={{
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        paddingLeft: '12px',
        opacity: 0.6,
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function AdminSidebar({ active, setActive, adminUser, isSuperAdmin, adminLogout }) {
  const initials = (adminUser?.name || 'A')[0].toUpperCase()

  return (
    <div
      style={{
        width: '240px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <h2 style={{ fontSize: '18px' }}>HeartGuard</h2>
      <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1px', marginBottom: '20px' }}>
        {isSuperAdmin ? 'SUPER ADMIN CONSOLE' : 'ADMIN CONSOLE'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--gold)', color: '#1a1200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {initials}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{adminUser?.name}</p>
          <p style={{ fontSize: '11px', color: 'var(--gold)' }}>{adminUser?.role?.toUpperCase()}</p>
        </div>
      </div>

      <SidebarSection title="OVERVIEW">
        <SidebarItem label="Dashboard" active={active === 'dashboard'} onClick={() => setActive('dashboard')} />
      </SidebarSection>

      <SidebarSection title="ACCOUNT">
        <SidebarItem label="My Profile" active={active === 'profile'} onClick={() => setActive('profile')} />
      </SidebarSection>

      <SidebarSection title="MANAGEMENT">
        <SidebarItem label="Manage Users" active={active === 'users'} onClick={() => setActive('users')} />
        <SidebarItem label="Dataset" active={active === 'dataset'} onClick={() => setActive('dataset')} />
        {isSuperAdmin && (
          <>
            <SidebarItem label="ML Model Training" active={active === 'model'} onClick={() => setActive('model')} />
            <SidebarItem label="Admin Accounts" active={active === 'admins'} onClick={() => setActive('admins')} />
          </>
        )}
      </SidebarSection>

      <SidebarSection title="SYSTEM">
        <SidebarItem label="Maintenance" active={active === 'maintenance'} onClick={() => setActive('maintenance')} />
      </SidebarSection>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
        <button onClick={adminLogout} style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

// Dashboard View 

function DashboardView({ users, predictionsInfo, activeAlgorithms }) {
  const userList = Object.entries(users || {})
  const totalUsers = userList.length
  const recentUsers = userList.slice(-5).reverse()

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <p className="stat-label">Registered Users</p>
          <p className="stat-value" style={{ color: 'var(--gold)' }}>{totalUsers}</p>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <p className="stat-label">Predictions Made</p>
          <p className="stat-value">{predictionsInfo.total}</p>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <p className="stat-label">High Risk Cases</p>
          <p className="stat-value" style={{ color: 'var(--red)' }}>{predictionsInfo.highRisk}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Recent Users</h3>
        {recentUsers.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No registered users yet.</p>}
        {recentUsers.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Email</th><th>Predictions</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentUsers.map(([email, u]) => (
                <tr key={email}>
                  <td>{email}</td>
                  <td>{predictionsInfo.perUser[email] || 0}</td>
                  <td>
                    <span className={`badge ${u.banned ? 'badge-red' : 'badge-green'}`}>
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// Profile View 

function ProfileView({ adminUser, updateAdminProfile, changeAdminPassword }) {
  const [name, setName] = useState(adminUser?.name || '')
  const [profMsg, setProfMsg] = useState('')
  const [profErr, setProfErr] = useState('')

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passErr, setPassErr] = useState('')

  const initials = (adminUser?.name || 'A')[0].toUpperCase()

  const saveProfile = () => {
    setProfMsg(''); setProfErr('')
    if (!name.trim()) { setProfErr('Name cannot be empty.'); return }
    updateAdminProfile({ name: name.trim() })
    setProfMsg('Profile updated successfully.')
    setTimeout(() => setProfMsg(''), 3000)
  }

  const doChangePass = async () => {
    setPassMsg(''); setPassErr('')
    if (!currentPass || !newPass || !confirm) { setPassErr('Please fill in all password fields.'); return }
    if (newPass.length < 8) { setPassErr('New password must be at least 8 characters.'); return }
    if (newPass !== confirm) { setPassErr('New passwords do not match.'); return }
    const result = await changeAdminPassword(currentPass, newPass)
    if (result.success) {
      setPassMsg('Password changed successfully.')
      setCurrentPass(''); setNewPass(''); setConfirm('')
      setTimeout(() => setPassMsg(''), 3000)
    } else {
      setPassErr(result.error)
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Admin Profile</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--gold)', color: '#1a1200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px' }}>
            {initials}
          </div>
          <div>
            <p style={{ fontWeight: 700 }}>{adminUser?.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--gold)' }}>{adminUser?.role?.toUpperCase()}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{adminUser?.email}</p>
          </div>
        </div>

        <label className="field-label">Display Name</label>
        <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
        {profMsg && <p className="success-text">{profMsg}</p>}
        {profErr && <p className="error-text">{profErr}</p>}
        <button className="btn-gold" onClick={saveProfile}>Save Changes</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Change Password</h3>
        <label className="field-label">Current Password</label>
        <input className="input-field" type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} />
        <label className="field-label">New Password</label>
        <input className="input-field" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
        <label className="field-label">Confirm Password</label>
        <input className="input-field" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        {passMsg && <p className="success-text">{passMsg}</p>}
        {passErr && <p className="error-text">{passErr}</p>}
        <button className="btn-primary" onClick={doChangePass}>Update Password</button>
      </div>
    </div>
  )
}

// Users View

function UsersView({ users, banUser, unbanUser, deleteUser }) {
  const userList = Object.entries(users || {})
  const [search, setSearch] = useState('')

  const filtered = userList.filter(([email]) =>
    email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>All Users ({filtered.length})</h3>

      <input
        className="input-field"
        placeholder="Search by email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>}

      {filtered.length > 0 && (
        <table className="data-table">
          <thead>
            <tr><th>Email</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(([email, u]) => (
              <tr key={email}>
                <td>{email}</td>
                <td>
                  <span className={`badge ${u.banned ? 'badge-red' : 'badge-green'}`}>
                    {u.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td>
                  {u.banned ? (
                    <button className="btn-outline-green" onClick={() => unbanUser(email)} style={{ marginRight: '8px' }}>Unban</button>
                  ) : (
                    <button className="btn-outline-red" onClick={() => banUser(email)} style={{ marginRight: '8px' }}>Ban</button>
                  )}
                  <button className="btn-secondary" onClick={() => deleteUser(email)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// Dataset View

function DatasetView({ users, predictionsInfo, exportDataset, clearAllData }) {
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClear = () => {
    clearAllData()
    setConfirmClear(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <p className="stat-label">Total Records</p>
          <p className="stat-value">{predictionsInfo.total}</p>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <p className="stat-label">High Risk Records</p>
          <p className="stat-value" style={{ color: 'var(--red)' }}>{predictionsInfo.highRisk}</p>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <p className="stat-label">Contributing Users</p>
          <p className="stat-value">{Object.keys(users || {}).length}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Dataset Actions</h3>
        <button className="btn-outline-green" onClick={exportDataset} style={{ marginRight: '10px' }}>Export as CSV</button>
        <button className="btn-outline-red" onClick={() => setConfirmClear(true)}>Clear All Data</button>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '14px' }}>
          CSV export includes all prediction records across all users.
          Clearing removes predictions but preserves user accounts.
        </p>
      </div>

      {confirmClear && (
        <div className="card" style={{ maxWidth: '380px', border: '1px solid var(--red)' }}>
          <p style={{ marginBottom: '16px' }}>This will permanently remove ALL prediction records from every user. This cannot be undone.</p>
          <button className="btn-secondary" onClick={() => setConfirmClear(false)} style={{ marginRight: '10px' }}>Cancel</button>
          <button className="btn-outline-red" onClick={handleClear}>Delete All</button>
        </div>
      )}
    </div>
  )
}

// Model Selection View (Super Admin only)

function ModelView({ activeAlgorithms, setActiveAlgorithms }) {
  const [metrics, setMetrics] = useState({})

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/model-metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error('Could not load model metrics:', err))
  }, [])

  const algorithms = [
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'logistic', label: 'Logistic Regression' },
    { value: 'decision_tree', label: 'Decision Tree' },
    { value: 'svm', label: 'Support Vector Machine (SVM)' },
  ]

  const isChecked = (value) => activeAlgorithms.includes(value)

  const toggleAlgorithm = (value) => {
    if (isChecked(value)) {
      // Never allow removing the last remaining selection.
      if (activeAlgorithms.length === 1) return
      setActiveAlgorithms(activeAlgorithms.filter(a => a !== value))
    } else {
      setActiveAlgorithms([...activeAlgorithms, value])
    }
  }

  

  const bestSelected = activeAlgorithms.reduce((best, a) => {
    const acc = metrics[a] ?? 0
    return acc > (metrics[best] ?? 0) ? a : best
  }, activeAlgorithms[0])

  return (
    <div className="card">
      <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>ML Model Selection</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
        Select one model, or several — if several are selected, the most accurate one among them answers each prediction.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Currently answering with: <span className="badge badge-gold">{bestSelected}</span>
      </p>

      {algorithms.map(algo => (
        <label
          key={algo.value}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            marginBottom: '8px',
            borderRadius: '8px',
            border: `1px solid ${isChecked(algo.value) ? 'var(--gold)' : 'var(--border-color)'}`,
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              name="algorithm"
              value={algo.value}
              checked={isChecked(algo.value)}
              onChange={() => toggleAlgorithm(algo.value)}
            />
            {algo.label}
          </span>
          {metrics[algo.value] !== undefined && (
            <span className="badge badge-green">{metrics[algo.value]}% accuracy</span>
          )}
        </label>
      ))}
    </div>
  )
}

// Admin Accounts View (Super Admin only)

function AdminAccountsView({ accounts, approveAdmin, rejectAdmin }) {
  const allAdmins = Object.entries(accounts || {})
  const pendingAdmins = allAdmins.filter(([email, acc]) => acc.status === 'pending')
  const activeAdmins = allAdmins.filter(([email, acc]) => acc.status === 'active')

  return (
    <div>
      {pendingAdmins.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Pending Approvals ({pendingAdmins.length})</h3>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pendingAdmins.map(([email, acc]) => (
                <tr key={email}>
                  <td>{acc.name}</td>
                  <td>{email}</td>
                  <td>
                    <button className="btn-outline-green" onClick={() => approveAdmin(email)} style={{ marginRight: '8px' }}>Approve</button>
                    <button className="btn-outline-red" onClick={() => rejectAdmin(email)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      

      <div className="card">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>All Admin Accounts ({allAdmins.length})</h3>
        <table className="data-table">
          <thead>
            <tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th></tr>
          </thead>
          <tbody>
            {allAdmins.map(([email, acc]) => (
              <tr key={email}>
                <td>{email}</td>
                <td>{acc.name}</td>
                <td>
                  <span className="badge badge-gold">{acc.role.toUpperCase()}</span>
                </td>
                <td>
                  <span className={`badge ${acc.status === 'active' ? 'badge-green' : 'badge-gold'}`}>
                    {acc.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Maintenance View

function MaintenanceView({ createBackup, restoreBackup }) {
  const [restoreMsg, setRestoreMsg] = useState('')
  const [restoreErr, setRestoreErr] = useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setRestoreMsg('')
    setRestoreErr('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result)
        restoreBackup(backupData)
        setRestoreMsg('Backup restored successfully. Please refresh the page.')
      } catch (err) {
        setRestoreErr('Invalid backup file. Could not restore.')
      }
    }
    reader.readAsText(file)
  }

  const systemInfo = [
    { label: 'Frontend', value: 'React + Vite' },
    { label: 'Backend', value: 'FastAPI + scikit-learn' },
    { label: 'Storage Used', value: `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB` },
    { label: 'Platform', value: navigator.platform },
  ]

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>Data Backup</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Download a full backup of all users, admin accounts, and predictions.
        </p>
        <button className="btn-outline-green" onClick={createBackup}>Download Backup</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>Restore From Backup</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Upload a previously downloaded backup file. This will overwrite current data.
        </p>
        <input type="file" accept=".json" onChange={handleFileUpload} />
        {restoreMsg && <p className="success-text">{restoreMsg}</p>}
        {restoreErr && <p className="error-text">{restoreErr}</p>}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>System Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {systemInfo.map(item => (
            <div key={item.label} className="stat-card">
              <p className="stat-label">{item.label}</p>
              <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// Main AdminPanel
export default function AdminPanel() {
  const {
    adminUser, adminLogout, activeAlgorithms, setActiveAlgorithms,
    accounts, approveAdmin, rejectAdmin, updateAdminProfile, changeAdminPassword,
  } = useAdmin()

  const {
    users, banUser, unbanUser, deleteUser,
    getPredictionsInfo, exportDataset, clearAllData,
    createBackup, restoreBackup,
  } = useAuth()

  const [active, setActive] = useState('dashboard')
  const isSuperAdmin = adminUser?.role === 'superadmin'

  const pageTitles = {
    dashboard: 'Overview Dashboard',
    profile: 'My Profile',
    users: 'Manage Users',
    dataset: 'Dataset Management',
    maintenance: 'System Maintenance',
    model: 'ML Model Training',
    admins: 'Admin Accounts',
  }

  return (
    <div>
      <AdminSidebar
        active={active}
        setActive={setActive}
        adminUser={adminUser}
        isSuperAdmin={isSuperAdmin}
        adminLogout={adminLogout}
      />

      <div style={{ marginLeft: '240px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 30px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <h1 style={{ fontSize: '22px' }}>{pageTitles[active]}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="badge badge-gold">{adminUser?.role?.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          {active === 'dashboard' && (
            <DashboardView
              users={users}
              predictionsInfo={getPredictionsInfo(users)}
              activeAlgorithms={activeAlgorithms}
              adminLogout={adminLogout}
            />
          )}

          {active === 'profile' && (
            <ProfileView
              adminUser={adminUser}
              updateAdminProfile={updateAdminProfile}
              changeAdminPassword={changeAdminPassword}
            />
          )}

          {active === 'users' && (
            <UsersView users={users} banUser={banUser} unbanUser={unbanUser} deleteUser={deleteUser} />
          )}

          {active === 'dataset' && (
            <DatasetView
              users={users}
              predictionsInfo={getPredictionsInfo(users)}
              exportDataset={exportDataset}
              clearAllData={clearAllData}
            />
          )}

          {active === 'maintenance' && (
            <MaintenanceView createBackup={createBackup} restoreBackup={restoreBackup} />
          )}

          {active === 'model' && isSuperAdmin && (
            <ModelView activeAlgorithms={activeAlgorithms} setActiveAlgorithms={setActiveAlgorithms} />
          )}

          {active === 'admins' && isSuperAdmin && (
            <AdminAccountsView accounts={accounts} approveAdmin={approveAdmin} rejectAdmin={rejectAdmin} />
          )}
        </div>
      </div>
    </div>
  )
}