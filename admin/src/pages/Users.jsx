import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import UserModal from '../components/UserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';

export default function Users() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('thsti_admin_user') || '{}');
    const currentUserRole = currentUser?.role;

    // RBAC: redirect non-privileged users
    useEffect(() => {
        if (currentUserRole !== 'SUPER_ADMIN' && currentUserRole !== 'ADMIN') {
            navigate('/dashboard');
        }
    }, [currentUserRole, navigate]);

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const limit = 15;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { page, limit, search } });
            setUsers(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleToggleStatus = async (user) => {
        if (user.id === currentUser?.id) { toast.error('You cannot deactivate your own account.'); return; }
        try {
            await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status.');
        }
    };

    const openCreate = () => { setModalMode('create'); setSelectedUser(null); setIsUserModalOpen(true); };
    const openEdit = (user) => { setModalMode('edit'); setSelectedUser(user); setIsUserModalOpen(true); };
    const openReset = (user) => { setSelectedUser(user); setIsResetModalOpen(true); };

    const totalPages = Math.ceil(total / limit);

    const roleBadge = (role) => {
        const colors = { SUPER_ADMIN: 'bg-purple-100 text-purple-800', ADMIN: 'bg-blue-100 text-blue-800', EDITOR: 'bg-green-100 text-green-800', VIEWER: 'bg-gray-100 text-gray-600' };
        return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors[role] || 'bg-gray-100'}`}>{role}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-secondary">User Management</h1>
                    <p className="text-text-muted text-sm mt-1">Manage admin panel users and their permissions.</p>
                </div>
                <button onClick={openCreate} className="admin-btn-primary flex items-center gap-2">
                    <span className="text-lg">+</span> Add User
                </button>
            </div>

            {/* Search */}
            <div className="admin-card p-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by username, name, or email..."
                    className="admin-input w-full max-w-md"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Table */}
            <div className="admin-card overflow-x-auto">
                {loading ? (
                    <div className="text-center py-10 text-text-muted">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-10 text-text-muted">No users found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-bg-light text-text-muted border-b">
                            <tr>
                                <th className="py-3 px-4 text-left">#</th>
                                <th className="py-3 px-4 text-left">Username</th>
                                <th className="py-3 px-4 text-left">Full Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Mobile</th>
                                <th className="py-3 px-4 text-left">Role</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Last Login</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-text-muted">{(page - 1) * limit + idx + 1}</td>
                                    <td className="py-3 px-4 font-mono font-semibold text-secondary">{user.username}</td>
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4 text-text-muted">{user.email}</td>
                                    <td className="py-3 px-4 text-text-muted">{user.mobile || '—'}</td>
                                    <td className="py-3 px-4">{roleBadge(user.role)}</td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${user.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-text-muted">
                                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(user)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                                            <button onClick={() => openReset(user)} className="text-xs text-orange-600 hover:underline font-medium">Reset Pwd</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 mt-4">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="admin-btn-secondary text-xs px-3 py-1 disabled:opacity-40">Prev</button>
                    <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="admin-btn-secondary text-xs px-3 py-1 disabled:opacity-40">Next</button>
                </div>
            )}

            <UserModal
                isOpen={isUserModalOpen}
                mode={modalMode}
                user={selectedUser}
                currentUserRole={currentUserRole}
                onClose={() => setIsUserModalOpen(false)}
                onSaved={fetchUsers}
            />
            <ResetPasswordModal
                isOpen={isResetModalOpen}
                user={selectedUser}
                onClose={() => setIsResetModalOpen(false)}
                onSaved={fetchUsers}
            />
        </div>
    );
}
