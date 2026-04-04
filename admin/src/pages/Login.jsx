import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('thsti_admin_token', res.data.accessToken);
            localStorage.setItem('thsti_admin_refresh', res.data.refreshToken);
            localStorage.setItem('thsti_admin_user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light">
            <div className="admin-card p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-secondary font-sans uppercase">THSTI CMS</h2>
                    <p className="text-text-muted mt-2">Sign in to Admin Panel</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-primary text-primary px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-text-main font-bold mb-1">Email</label>
                        <input
                            type="email"
                            className="admin-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1">Password</label>
                        <input
                            type="password"
                            className="admin-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="admin-btn-primary w-full mt-4">
                        Login
                    </button>

                    <div className="flex justify-between mt-4 text-sm">
                        <a href="/forgot-username" className="text-secondary hover:text-primary transition-colors">
                            Forgot Username?
                        </a>
                        <a href="/forgot-password" className="text-secondary hover:text-primary transition-colors">
                            Forgot Password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
