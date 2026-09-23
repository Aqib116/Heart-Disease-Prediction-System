import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AppHeader from '../components/AppHeader'

const genderLabel = (g) => g === 'M' ? 'Male' : 'Female'
const cholLabel = (c) => ({ '1': 'Normal', '2': 'Above Normal', '3': 'Well Above Normal' }[String(c)] ?? c)

export default function HistoryPage() {
  const { predictions, deletePrediction, deleteAllPredictions } = useAuth()

  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [confirmTarget, setConfirmTarget] = useState(null)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = [...predictions].sort((a, b) => {
    let av = a[sortField] ?? ''
    let bv = b[sortField] ?? ''
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleConfirm = () => {
    if (confirmTarget === 'all') {
      deleteAllPredictions()
    } else {
      deletePrediction(confirmTarget)
    }
    setConfirmTarget(null)
  }

  return (
    <div>
      <AppHeader active="history" />

      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Prediction History</h1>
          {predictions.length > 0 && (
            <button className="btn-outline-red" onClick={() => setConfirmTarget('all')}>Delete All</button>
          )}
        </div>

        <div className="card">
          {predictions.length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>
              No predictions yet. Go to Dashboard to make your first prediction.
            </p>
          )}

          {predictions.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')}>Date</th>
                  <th onClick={() => handleSort('age_years')}>Age</th>
                  <th>Gender</th>
                  <th>BMI</th>
                  <th>Cholesterol</th>
                  <th onClick={() => handleSort('risk_percent')}>Risk %</th>
                  <th>Risk Level</th>
                  <th>Result</th>
                  <th>Algorithm</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>{p.age_years}</td>
                    <td>{genderLabel(p.gender)}</td>
                    <td>{p.bmi}</td>
                    <td>{cholLabel(p.cholesterol)}</td>
                    <td>{p.risk_percent}%</td>
                    <td>
                      <span className={`badge ${p.risk_level === 'High' ? 'badge-red' : p.risk_level === 'Moderate' ? 'badge-gold' : 'badge-green'}`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td>{p.prediction === 1 ? 'Disease' : 'No Disease'}</td>
                    <td>{p.algorithm_used}</td>
                    <td>
                      <button className="btn-outline-red" onClick={() => setConfirmTarget(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {confirmTarget !== null && (
          <div className="card" style={{ maxWidth: '360px' }}>
            <p style={{ marginBottom: '16px' }}>
              {confirmTarget === 'all'
                ? 'Delete ALL prediction records? This cannot be undone.'
                : 'Delete this record? This cannot be undone.'}
            </p>
            <button className="btn-secondary" onClick={() => setConfirmTarget(null)} style={{ marginRight: '10px' }}>Cancel</button>
            <button className="btn-outline-red" onClick={handleConfirm}>Yes, Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}