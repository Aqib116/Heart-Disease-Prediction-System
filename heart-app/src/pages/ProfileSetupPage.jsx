import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import heartLogo from '../assets/heartlogo.png'

export default function ProfileSetupPage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { saveProfile } = useAuth()

  const handleContinue = () => {
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!age || isNaN(age) || age < 1 || age > 120) { setError('Please enter a valid age.'); return }
    if (!gender) { setError('Please select your gender.'); return }

    setError('')
    saveProfile({ name: name.trim(), age: parseInt(age), gender })
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <img src={heartLogo} alt="Heart Logo" style={{width: '280px', marginBottom: '-20px' }} />

      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '22px' }}>Complete Your Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          We need a few details before you can start.
        </p>

        <label className="field-label">Full Name</label>
        <input className="input-field" type="text" placeholder="Full Name" value={name}
          onChange={e => setName(e.target.value)} />

        <label className="field-label">Age</label>
        <input className="input-field" type="number" placeholder="Age" value={age}
          onChange={e => setAge(e.target.value)} />

        <label className="field-label">Gender</label>
        <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="" disabled>Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}