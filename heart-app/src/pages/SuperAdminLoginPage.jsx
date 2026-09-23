import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import heartLogo from '../assets/heartlogo.png'

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { adminLogin } = useAdmin()

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    const result = await adminLogin(email, password, 'superadmin')
    if (result.success) {
      navigate('/superadmin/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <img src={heartLogo} alt="Heart Logo" style={{ width: '120px', marginBottom: '-8px' }} />
      <h1 style={{ fontSize: '24px', marginBottom: '2px' }}>HeartGuard</h1>
      <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1.5px', marginBottom: '20px' }}>
        SUPER ADMIN CONSOLE
      </p>

      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', borderLeft: '3px solid var(--gold)', paddingLeft: '10px', marginBottom: '16px' }}>
          Highest level access — Super Admin only
        </p>

        <label className="field-label">Email Address</label>
        <input className="input-field" type="email" placeholder="superadmin@example.com" value={email}
          onChange={e => setEmail(e.target.value)} />

        <label className="field-label">Password</label>
        <input className="input-field" type="password" placeholder="Enter your password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        {error && <p className="error-text">{error}</p>}

        <button className="btn-gold" style={{ width: '100%', marginTop: '8px' }} onClick={handleLogin}>
          Sign In To Super Admin Panel
        </button>
      </div>

      <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <a href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to User Login</a>
        {' | '}
        <a href="/admin" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Admin Console</a>
      </p>
    </div>
  )
}