import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: '', mobile: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/me')
            .then(res => {
                setProfile(res.data.data);
                setForm({ name: res.data.data.name || '', mobile: res.data.data.mobile || '' });
            })
            .catch(() => toast.error('Failed to load profile.'));
    }, []);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/me/profile', form);
            setProfile(p => ({ ...p, ...res.data.data }));
            toast.success('Profile updated.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return <div className="p-6 text-text-muted">Loading profile...</div>;

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-secondary mb-6">My Profile</h1>

            {/* Read-only info */}
            <div className="admin-card p-6 mb-6">
                <h2 className="font-semibold text-text-main mb-4 border-b pb-2">Account Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-text-muted uppercase font-semibold">Username</p>
                        <p className="font-mono font-semibold text-secondary mt-1">{profile.username}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-semibold">Email</p>
                        <p className="mt-1">{profile.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-semibold">Role</p>
                        <p className="mt-1 font-semibold">{profile.role}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-semibold">Member Since</p>
                        <p className="mt-1 text-sm">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Editable fields */}
            <div className="admin-card p-6 mb-6">
                <h2 className="font-semibold text-text-main mb-4 border-b pb-2">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">Full Name</label>
                        <input name="name" value={form.name} onChange={handleChange} className="admin-input" required />
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1 text-sm">Mobile</label>
                        <input name="mobile" value={form.mobile} onChange={handleChange} className="admin-input" placeholder="Optional" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="admin-btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change password link */}
            <div className="admin-card p-6">
                <h2 className="font-semibold text-text-main mb-2">Security</h2>
                <p className="text-sm text-text-muted mb-3">Want to change your password?</p>
                <button onClick={() => navigate('/dashboard/change-password')} className="admin-btn-secondary">
                    Change Password
                </button>
            </div>
        </div>
    );
}
