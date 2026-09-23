import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavLink({ label, activeItem, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: activeItem ? 'var(--bg-card)' : 'none',
                border: 'none',
                color: activeItem ? 'var(--blue)' : 'var(--text-secondary)',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                fontWeight: activeItem ? 700 : 500,
                fontSize: '14px',
            }}
        >
            {label}
        </button>
    )
}

export default function AppHeader({ active }) {
    const [open, setOpen] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const { user, profile, logout } = useAuth()
    const navigate = useNavigate()

    const go = (path) => {
        setOpen(false)
        navigate(path)
    }

    const initials = (profile?.name || user?.email || 'U')[0].toUpperCase()

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 30px',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <button
                    onClick={() => setOpen(true)}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
                    ☰ Menu
                </button>
                <a href="/history" style={{ color: 'var(--blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                    History <span style={{ fontSize: '15px' }}>🌐</span>
                </a>
            </div>

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10 }}
                />
            )}

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: '280px',
                    background: 'var(--bg-card)',
                    borderRight: '1px solid var(--border-color)',
                    transform: open ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.25s ease',
                    zIndex: 20,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px' }}>HeartGuard</h2>
                    <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>
                        ×
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {initials}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600 }}>{profile?.name || 'User'}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.email}</p>
                    </div>
                </div>

                <NavLink label="Dashboard" activeItem={active === 'dashboard'} onClick={() => go('/dashboard')} />
                <NavLink label="History" activeItem={active === 'history'} onClick={() => go('/history')} />
                <NavLink label="Account Settings" activeItem={active === 'account'} onClick={() => go('/account-settings')} />
                <NavLink label="Help & Information" activeItem={showHelp} onClick={() => setShowHelp(h => !h)} />

                {showHelp && (
                    <div className="card" style={{ marginTop: '4px', border: '1px solid var(--blue)' }}>
                        <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>Heart Disease Prediction</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            Enter your medical data in the dashboard to receive an AI-powered heart disease risk assessment.
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            Fields like cholesterol, blood pressure, and lifestyle habits help the system assess your risk accurately.
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--blue)' }}>
                            Note: This is not a medical diagnosis. Consult a doctor for professional advice.
                        </p>
                    </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={logout}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 600, cursor: 'pointer', padding: '10px 0', display: 'block' }}
                    >
                        Sign Out
                    </button>
                    <a href="/admin" style={{ color: 'var(--gold)', fontSize: '13px' }}>Admin Console</a>
                </div>
            </div>
        </>
    )
}