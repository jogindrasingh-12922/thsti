import { useState } from 'react';
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

export default function ResetPasswordModal({ isOpen, user, onClose, onSaved }) {
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '', forceChange: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/admin/users/${user.id}/reset-password`, {
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
                forceChange: form.forceChange,
            });
            toast.success(`Password reset for ${user.username}.`);
            setForm({ newPassword: '', confirmPassword: '', forceChange: false });
            onClose();
            if (onSaved) onSaved();
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="admin-card p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-secondary">Reset Password</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-primary text-2xl leading-none">&times;</button>
                </div>

                {user && <p className="text-sm text-text-muted mb-4">Resetting password for: <strong>{user.username}</strong></p>}
                {error && <div className="bg-red-100 border border-primary text-primary px-3 py-2 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">New Password*</label>
                        <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="admin-input text-sm" required />
                        {form.newPassword && <PasswordStrength password={form.newPassword} />}
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">Confirm Password*</label>
                        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="admin-input text-sm" required />
                        {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="forceChange" name="forceChange" type="checkbox" checked={form.forceChange} onChange={handleChange} className="w-4 h-4 accent-primary" />
                        <label htmlFor="forceChange" className="text-sm text-text-main">Force user to change password on next login</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="admin-btn-secondary">Cancel</button>
                        <button type="submit" className="admin-btn-primary min-w-[80px]" disabled={loading}>
                            {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
