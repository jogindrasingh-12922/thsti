import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await api.post('/auth/reset-password', {
                token,
                newPassword,
                confirmPassword,
            });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light">
            <div className="admin-card p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-secondary font-sans uppercase">THSTI CMS</h2>
                    <p className="text-text-muted mt-2">Set New Password</p>
                </div>

                {message ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
                        {message}
                        <button
                            onClick={() => navigate('/')}
                            className="admin-btn-secondary w-full mt-4"
                        >
                            Go to Login
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
                                <label className="block text-text-main font-bold mb-1">New Password</label>
                                <input
                                    type="password"
                                    className="admin-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    Min 12 chars, must include upper, lower, numbers, and special chars.
                                </p>
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    className="admin-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                />
                            </div>
                            <button
                                type="submit"
                                className="admin-btn-primary w-full mt-4"
                                disabled={!token}
                            >
                                Reset Password
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
