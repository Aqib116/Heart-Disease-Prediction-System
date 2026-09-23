import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import heartLogo from '../assets/heartlogo.png'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { register } = useAuth()

  const handleRegister = async () => {
    setError('')
    if (!email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    const result = await register(email, password)
    if (result.success) {
      navigate('/profile-setup')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <img src={heartLogo} alt="Heart Logo" style={{ width: '280px', marginBottom: '-20px' }} />

      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '22px', whiteSpace: 'nowrap' }}>
          Create an Account
        </h1>

        <label className="field-label">Email</label>
        <input className="input-field" type="email" placeholder="Email Address" value={email}
          onChange={e => setEmail(e.target.value)} />

        <label className="field-label">Password</label>
        <input className="input-field" type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} />

        <label className="field-label">Confirm Password</label>
        <input className="input-field" type="password" placeholder="Confirm Password" value={confirm}
          onChange={e => setConfirm(e.target.value)} />

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={handleRegister}>
          Register
        </button>

        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--blue)' }}>Login</a>
        </p>
      </div>
    </div>
  )
}