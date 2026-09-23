import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import heartLogo from '../assets/heartlogo.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <img src={heartLogo} alt="Heart Logo" style={{ width: '280px', marginBottom: '-20px' }} />

      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '22px', whiteSpace: 'nowrap' }}>
          Login to Your Account
        </h1>

        <label className="field-label">Email</label>
        <input className="input-field" type="email" placeholder="Email Address" value={email}
          onChange={e => setEmail(e.target.value)} />

        <label className="field-label">Password</label>
        <input className="input-field" type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={handleLogin}>
          Login Now
        </button>

        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--blue)' }}>Register Now</a>
        </p>

        <p style={{ marginTop: '10px', textAlign: 'center' }}>
          <a href="/admin" style={{ color: 'var(--gold)', fontSize: '13px' }}>Admin Console</a>
        </p>
      </div>
    </div>
  )
}