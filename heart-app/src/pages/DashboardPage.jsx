import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAdmin } from '../context/AdminContext'
import AppHeader from '../components/AppHeader'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function DashboardPage() {
  const { user, profile, profileLoaded, addPrediction } = useAuth()
  const { activeAlgorithms } = useAdmin()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    height: '', weight: '', ap_hi: '', ap_lo: '',
    cholesterol: '', gluc: '', smoke: '', alco: '', active: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    // Wait until the profile has actually finished loading from the
    // database before deciding the user needs to set one up — otherwise
    // we'd redirect every time during the brief async fetch.
    if (profileLoaded && !profile) {
      navigate('/profile-setup')
    }
  }, [profile, profileLoaded])

  if (!profile) {
    return (
      <div>
        <AppHeader active="dashboard" />
        <div className="page-container"><p>Loading...</p></div>
      </div>
    )
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
  }

  const handleSubmit = async () => {
    setApiError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age_years: profile.age,
          gender: profile.gender === 'M' ? 1 : 0,
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
          ap_hi: parseFloat(form.ap_hi),
          ap_lo: parseFloat(form.ap_lo),
          cholesterol: parseInt(form.cholesterol),
          gluc: parseInt(form.gluc),
          smoke: parseInt(form.smoke),
          alco: parseInt(form.alco),
          active: parseInt(form.active),
          algorithms: activeAlgorithms,
        }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed. Check backend terminal for details.')
      }

      const data = await response.json()

      const savedEntry = await addPrediction({
        ...form,
        age_years: profile.age,
        gender: profile.gender,
        prediction: data.prediction,
        risk_percent: data.risk_percent,
        risk_level: data.risk_level,
        bmi: data.bmi,
        algorithm_used: data.algorithm_used,
      })

      setResult(savedEntry)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const isHigh = result.prediction === 1
    return (
      <div>
        <AppHeader active="dashboard" />
        <div className="page-container">
          <div className="card" style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '10px' }}>Prediction Result</h1>
            <p className={isHigh ? 'error-text' : 'success-text'} style={{ fontSize: '18px', fontWeight: 700 }}>
              {isHigh ? 'Disease Detected' : 'No Disease Detected'}
            </p>
            <p style={{ margin: '16px 0' }}>Risk Level: <strong>{result.risk_level}</strong></p>
            <p style={{ marginBottom: '20px' }}>Risk Percentage: <strong>{result.risk_percent}%</strong></p>
            <button className="btn-primary" onClick={() => setResult(null)}>Predict Again</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHeader active="dashboard" />
      <div className="page-container">
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '40px', margin: '20px 0' }}>Dashboard</h1>
          <p style={{ fontWeight: 600 }}>Enter Your Medical Data</p>
        </div>

        <div className="card">
          <label className="field-label">Height (cm)</label>
          <input className="input-field" type="number" placeholder="e.g. 170" value={form.height} onChange={set('height')} />

          <label className="field-label">Weight (kg)</label>
          <input className="input-field" type="number" placeholder="e.g. 70" value={form.weight} onChange={set('weight')} />

          <label className="field-label">Systolic Blood Pressure — ap_hi (mmHg)</label>
          <input className="input-field" type="number" placeholder="e.g. 120" value={form.ap_hi} onChange={set('ap_hi')} />

          <label className="field-label">Diastolic Blood Pressure — ap_lo (mmHg)</label>
          <input className="input-field" type="number" placeholder="e.g. 80" value={form.ap_lo} onChange={set('ap_lo')} />

          <label className="field-label">Cholesterol</label>
          <select className="input-field" value={form.cholesterol} onChange={set('cholesterol')}>
            <option value="" disabled>Select Cholesterol Level</option>
            <option value="1">Normal</option>
            <option value="2">Above Normal</option>
            <option value="3">Well Above Normal</option>
          </select>

          <label className="field-label">Glucose</label>
          <select className="input-field" value={form.gluc} onChange={set('gluc')}>
            <option value="" disabled>Select Glucose Level</option>
            <option value="1">Normal</option>
            <option value="2">Above Normal</option>
            <option value="3">Well Above Normal</option>
          </select>

          <label className="field-label">Smoker?</label>
          <select className="input-field" value={form.smoke} onChange={set('smoke')}>
            <option value="" disabled>Select</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>

          <label className="field-label">Drinks Alcohol?</label>
          <select className="input-field" value={form.alco} onChange={set('alco')}>
            <option value="" disabled>Select</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>

          <label className="field-label">Physically Active?</label>
          <select className="input-field" value={form.active} onChange={set('active')}>
            <option value="" disabled>Select</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>

          {apiError && <p className="error-text">{apiError}</p>}

          <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Predicting...' : 'Predict Now'}
          </button>
        </div>
      </div>
    </div>
  )
}