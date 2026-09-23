import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function DeleteModal({ onConfirm, onCancel }) {
  const [text, setText] = useState('')
  const ready = text.trim().toLowerCase() === 'delete'

  return (
    <div className="card" style={{ maxWidth: '400px', border: '1px solid var(--red)' }}>
      <h3 style={{ marginBottom: '10px', color: 'var(--red)' }}>Delete Account</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '14px' }}>
        This will permanently remove your account, profile, and all prediction history. This cannot be undone.
      </p>
      <label className="field-label">Type <strong>delete</strong> to confirm</label>
      <input className="input-field" value={text} onChange={e => setText(e.target.value)} />
      <button className="btn-secondary" onClick={onCancel} style={{ marginRight: '10px' }}>Cancel</button>
      <button className="btn-outline-red" onClick={onConfirm} disabled={!ready}>Delete My Account</button>
    </div>
  )
}


export default function AccountSettingsPage() {
  const { user, profile, saveProfile, changePassword, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.name || '')
  const [age, setAge] = useState(profile?.age?.toString() || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [profMsg, setProfMsg] = useState('')
  const [profErr, setProfErr] = useState('')

  const [currPass, setCurrPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passErr, setPassErr] = useState('')

  const [showDelete, setShowDelete] = useState(false)

  // Profile now loads asynchronously from the database, so fill the form
  // fields in once it arrives (covers the case of landing here directly).
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setAge(profile.age?.toString() || '')
      setGender(profile.gender || '')
    }
  }, [profile])

  const saveProfileHandler = () => {
    setProfMsg(''); setProfErr('')
    if (!name.trim()) { setProfErr('Full name is required.'); return }
    if (!age || isNaN(age) || +age < 1 || +age > 120) { setProfErr('Enter a valid age (1–120).'); return }
    if (!gender) { setProfErr('Please select a gender.'); return }
    saveProfile({ name: name.trim(), age: parseInt(age), gender })
    setProfMsg('Profile updated successfully.')
    setTimeout(() => setProfMsg(''), 3000)
  }

  const changePassHandler = async () => {
    setPassMsg(''); setPassErr('')
    if (!currPass || !newPass || !confirmPass) { setPassErr('Please fill in all password fields.'); return }
    if (newPass.length < 6) { setPassErr('New password must be at least 6 characters.'); return }
    if (newPass !== confirmPass) { setPassErr('New passwords do not match.'); return }
    if (currPass === newPass) { setPassErr('New password must be different from current password.'); return }

    const res = await changePassword(currPass, newPass)
    if (res.success) {
      setPassMsg('Password changed successfully.')
      setCurrPass(''); setNewPass(''); setConfirmPass('')
      setTimeout(() => setPassMsg(''), 3000)
    } else {
      setPassErr(res.error)
    }
  }

  const handleDelete = () => {
    deleteAccount()
    navigate('/login')
  }

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <a href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>← Back to Dashboard</a>
      <h1 style={{ marginTop: '10px' }}>Account Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Manage your profile, password, and account preferences
      </p>

      <div className="card">
        <p style={{ fontWeight: 600 }}>{user?.email}</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '4px', fontSize: '18px' }}>Profile Information</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Update your personal details used in predictions.
        </p>

        <label className="field-label">Full Name</label>
        <input className="input-field" type="text" value={name} onChange={e => setName(e.target.value)} />

        <label className="field-label">Age</label>
        <input className="input-field" type="number" value={age} onChange={e => setAge(e.target.value)} />

        <label className="field-label">Gender</label>
        <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="" disabled>Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        {profMsg && <p className="success-text">{profMsg}</p>}
        {profErr && <p className="error-text">{profErr}</p>}
        <button className="btn-primary" onClick={saveProfileHandler}>Save Profile</button>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '4px', fontSize: '18px' }}>Change Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Choose a strong password that is at least 6 characters long.
        </p>

        <label className="field-label">Current Password</label>
        <input className="input-field" type="password" value={currPass} onChange={e => setCurrPass(e.target.value)} />

        <label className="field-label">New Password</label>
        <input className="input-field" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />



        <label className="field-label">Confirm New Password</label>
        <input className="input-field" type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />

        {passMsg && <p className="success-text">{passMsg}</p>}
        {passErr && <p className="error-text">{passErr}</p>}
        <button className="btn-primary" onClick={changePassHandler}>Update Password</button>
      </div>

      

      <div className="card" style={{ border: '1px solid var(--red)' }}>
        <h2 style={{ marginBottom: '4px', fontSize: '18px', color: 'var(--red)' }}>Danger Zone</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Deleting your account is permanent. All your data, predictions, and profile will be removed immediately with no way to recover.
        </p>
        <button className="btn-outline-red" onClick={() => setShowDelete(true)}>Delete My Account</button>
      </div>

      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
    </div>
  )
}