import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { loginUser } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import CSS

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            login(data.user, data.token);

            // Redirect based on role
            if (data.user.role_name === 'Admin') navigate('/admin/dashboard');
            else if (data.user.role_name === 'Field Agent') navigate('/agent/verify');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>🌍 Geo-Vend Pay 💰🛒</h1>
                <p className="welcome-msg">Welcome back! Ready to track vendors, verify locations, and manage payments? 🚀📦💳</p>
                
                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleSubmit} className="login-form">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="Email" 
                        required 
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="Password" 
                        required 
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}
