import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];

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

export default function UserModal({ isOpen, mode, user, currentUserRole, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({ username: '', name: '', email: '', mobile: '', role: 'EDITOR', isActive: true, password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (isEdit && user) {
                setForm({ username: user.username || '', name: user.name || '', email: user.email || '', mobile: user.mobile || '', role: user.role || 'EDITOR', isActive: user.isActive, password: '', confirmPassword: '' });
            } else {
                setForm({ username: '', name: '', email: '', mobile: '', role: 'EDITOR', isActive: true, password: '', confirmPassword: '' });
            }
            setErrors({});
        }
    }, [isOpen, isEdit, user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const availableRoles = ROLES.filter(r => {
        if (currentUserRole === 'SUPER_ADMIN') return true;
        return r !== 'SUPER_ADMIN' && r !== 'ADMIN';
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/admin/users/${user.id}`, { name: form.name, email: form.email, mobile: form.mobile, role: form.role, isActive: form.isActive });
                toast.success('User updated.');
            } else {
                await api.post('/admin/users', form);
                toast.success('User created.');
            }
            onSaved();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred.';
            setErrors({ general: msg });
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="admin-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-secondary">{isEdit ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-primary text-2xl leading-none">&times;</button>
                </div>

                {errors.general && <div className="bg-red-100 border border-primary text-primary px-3 py-2 rounded mb-4 text-sm">{errors.general}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-text-main font-bold mb-1 text-sm">Username*</label>
                            <input name="username" value={form.username} onChange={handleChange} className="admin-input text-sm" disabled={isEdit} required placeholder="e.g. john.doe" />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1 text-sm">Full Name*</label>
                            <input name="name" value={form.name} onChange={handleChange} className="admin-input text-sm" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-text-main font-bold mb-1 text-sm">Email*</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} className="admin-input text-sm" required />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1 text-sm">Mobile</label>
                            <input name="mobile" value={form.mobile} onChange={handleChange} className="admin-input text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-text-main font-bold mb-1 text-sm">Role*</label>
                            <select name="role" value={form.role} onChange={handleChange} className="admin-input text-sm">
                                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input name="isActive" type="checkbox" id="isActiveCheck" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-primary" />
                            <label htmlFor="isActiveCheck" className="text-sm font-medium text-text-main">Active</label>
                        </div>
                    </div>

                    {!isEdit && (
                        <>
                            <div>
                                <label className="block text-text-main font-bold mb-1 text-sm">Password*</label>
                                <input name="password" type="password" value={form.password} onChange={handleChange} className="admin-input text-sm" required />
                                {form.password && <PasswordStrength password={form.password} />}
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1 text-sm">Confirm Password*</label>
                                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="admin-input text-sm" required />
                                {form.confirmPassword && form.password !== form.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="admin-btn-secondary">Cancel</button>
                        <button type="submit" className="admin-btn-primary min-w-[80px]" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
