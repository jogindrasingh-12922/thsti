import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotUsername() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-username', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light">
            <div className="admin-card p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-secondary font-sans uppercase">THSTI CMS</h2>
                    <p className="text-text-muted mt-2">Retrieve Username</p>
                </div>

                {message ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
                        {message}
                        <button
                            onClick={() => navigate('/')}
                            className="admin-btn-secondary w-full mt-4"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-100 border border-primary text-primary px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <button type="submit" className="admin-btn-primary w-full mt-4">
                                Retrieve Username
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <button
                                onClick={() => navigate('/')}
                                className="text-text-muted hover:text-secondary text-sm transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
