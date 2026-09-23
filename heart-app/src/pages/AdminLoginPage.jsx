import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import heartLogo from '../assets/heartlogo.png'

export default function AdminLoginPage() {
  const [tab, setTab] = useState('login')
  const navigate = useNavigate()
  const { adminLogin, adminRegister } = useAdmin()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleLogin = async () => {
    setLoginError('')
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.')
      return
    }
    const result = await adminLogin(loginEmail, loginPassword, 'admin')
    if (result.success) {
      navigate('/admin/dashboard')
    } else {
      setLoginError(result.error)
    }
  }

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')

  const handleRegister = async () => {
    setRegError(''); setRegSuccess('')
    if (!regName || !regEmail || !regPassword) {
      setRegError('Please fill in all fields.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(regEmail)) {
      setRegError('Enter a valid email address.')
      return
    }
    const result = await adminRegister(regName, regEmail, regPassword)
    if (result.success) {
      setRegSuccess(result.isFirst
        ? 'You are the first admin — your account is active as Super Admin. Please log in.'
        : 'Registered! Your account is pending approval from a Super Admin.')
      setRegName(''); setRegEmail(''); setRegPassword('')
    } else {
      setRegError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <img src={heartLogo} alt="Heart Logo" style={{ width: '120px', marginBottom: '-8px' }} />
      <h1 style={{ fontSize: '24px', marginBottom: '2px' }}>HeartGuard</h1>
      <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1.5px', marginBottom: '20px' }}>
        ADMIN CONSOLE
      </p>

      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setTab('login')}
            style={{
              flex: 1, padding: '14px', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === 'login' ? 'var(--gold)' : 'var(--text-secondary)',
              borderBottom: tab === 'login' ? '2px solid var(--gold)' : 'none',
              fontWeight: 700,
            }}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setTab('register')}
            style={{
              flex: 1, padding: '14px', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === 'register' ? 'var(--gold)' : 'var(--text-secondary)',
              borderBottom: tab === 'register' ? '2px solid var(--gold)' : 'none',
              fontWeight: 700,
            }}
          >
            REGISTER
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', borderLeft: '3px solid var(--gold)', paddingLeft: '10px', marginBottom: '16px' }}>
            Restricted access — authorized personnel only
          </p>

          {tab === 'login' && (
            <div>
              <label className="field-label">Email Address</label>
              <input className="input-field" type="email" placeholder="admin@example.com" value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)} />

              <label className="field-label">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />

              {loginError && <p className="error-text">{loginError}</p>}

              <button className="btn-gold" style={{ width: '100%', marginTop: '8px' }} onClick={handleLogin}>
                Sign In To Admin Panel
              </button>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="field-label">Full Name</label>
              <input className="input-field" type="text" value={regName} onChange={e => setRegName(e.target.value)} />

              <label className="field-label">Email Address</label>
              <input className="input-field" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />

              <label className="field-label">Password</label>
              <input className="input-field" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />

              {regError && <p className="error-text">{regError}</p>}
              {regSuccess && <p className="success-text">{regSuccess}</p>}

              <button className="btn-gold" style={{ width: '100%', marginTop: '8px' }} onClick={handleRegister}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <a href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to User Login</a>
        {' | '}
        <a href="/superadmin" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Super Admin Console</a>
      </p>
    </div>
  )
}