import { useNavigate } from 'react-router-dom'
import heartLogo from '../assets/heartlogo.png'

export default function SplashPage() {
    const navigate = useNavigate()

    return (
        <div className="auth-page">

            <h1 style={{ marginBottom: '10px', fontSize: '45px', textAlign: 'center' }}>
                Heart Disease<br />Prediction
            </h1>
            <img src={heartLogo} alt="Heart Logo" style={{ width: '320px', marginBottom: '10px' }} />

            <button className="btn-primary"
                style={{ fontSize: '18px', padding: '16px 40px' }}
                onClick={() => navigate('/login')}>
                Predict Now
            </button>
        </div>
    )
}