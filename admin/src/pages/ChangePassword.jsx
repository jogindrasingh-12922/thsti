import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

function PasswordStrength({ password }) {
    const checks = [
        { label: 'Min 12 chars', ok: password.length >= 12 },
        { label: 'Uppercase', ok: /[A-Z]/.test(password) },
        { label: 'Lowercase', ok: /[a-z]/.test(password) },
        { label: 'Number', ok: /[0-9]/.test(password) },
        { label: 'Special char', ok: /[^a-zA-Z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    return (
        <div className="mt-2 space-y-1">
            <div className="flex gap-1">
                {checks.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded ${i < score ? (score <= 2 ? 'bg-red-400' : score <= 3 ? 'bg-yellow-400' : 'bg-green-400') : 'bg-gray-200'}`} />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {checks.map(c => (
                    <span key={c.label} className={`text-[10px] ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
                        {c.ok ? '✓' : '○'} {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function ChangePassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/me/change-password', form);
            toast.success('Password changed successfully. Please log in again.');
            // Clear tokens and redirect to login
            setTimeout(() => {
                localStorage.removeItem('thsti_admin_token');
                localStorage.removeItem('thsti_admin_refresh');
                localStorage.removeItem('thsti_admin_user');
                navigate('/');
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/dashboard/profile')} className="text-text-muted hover:text-secondary transition-colors">
                    ← Back to Profile
                </button>
            </div>

            <h1 className="text-2xl font-bold text-secondary mb-6">Change Password</h1>

            <div className="admin-card p-6">
                {error && <div className="bg-red-100 border border-primary text-primary px-3 py-2 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">Current Password*</label>
                        <input
                            name="oldPassword"
                            type="password"
                            value={form.oldPassword}
                            onChange={handleChange}
                            className="admin-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">New Password*</label>
                        <input
                            name="newPassword"
                            type="password"
                            value={form.newPassword}
                            onChange={handleChange}
                            className="admin-input"
                            required
                        />
                        {form.newPassword && <PasswordStrength password={form.newPassword} />}
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">Confirm New Password*</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="admin-input"
                            required
                        />
                        {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/dashboard/profile')} className="admin-btn-secondary">Cancel</button>
                        <button type="submit" className="admin-btn-primary min-w-[140px]" disabled={loading}>
                            {loading ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
