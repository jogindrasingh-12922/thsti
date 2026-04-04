import { useState, useEffect } from 'react';
import { Plus, Edit2, GripVertical } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function FooterLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [formData, setFormData] = useState({
        column: 'IMPORTANT',
        label: '',
        url: '',
        displayOrder: 0,
        isActive: true
    });

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = () => {
        setLoading(true);
        api.get('/footer-links/all')
            .then(res => setLinks(res.data))
            .catch(err => console.error('Failed to load footer links', err))
            .finally(() => setLoading(false));
    };

    const handleOpenNew = () => {
        setEditingLink(null);
        setFormData({ column: 'IMPORTANT', label: '', url: '', displayOrder: links.length + 1, isActive: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (link) => {
        setEditingLink(link);
        setFormData({ column: link.column, label: link.label, url: link.url, displayOrder: link.displayOrder, isActive: link.isActive });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'displayOrder') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLink) {
                await api.put(`/footer-links/${editingLink.id}`, formData);
            } else {
                await api.post('/footer-links', formData);
            }
            setIsModalOpen(false);
            fetchLinks();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to save link');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.patch(`/footer-links/${id}/toggle-active`);
            fetchLinks();
        } catch (error) {
            console.error('Failed to toggle footer link', error);
        }
    };

    // Grouping links by column visually
    const importantLinks = links.filter(l => l.column === 'IMPORTANT').sort((a, b) => a.displayOrder - b.displayOrder);
    const usefulLinks = links.filter(l => l.column === 'USEFUL').sort((a, b) => a.displayOrder - b.displayOrder);

    const actionButtons = (
        <button onClick={handleOpenNew} className="admin-btn-primary flex items-center gap-1 px-3 py-1.5 text-sm">
            <Plus size={15} /> Add Link
        </button>
    );

    const renderTable = (data, title) => (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-secondary mb-3">{title}</h3>
            <div className="admin-card overflow-hidden bg-white shadow-sm border border-border-light">
                <table className="admin-table w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-16">S.No</th>
                            <th>Label</th>
                            <th>URL</th>
                            <th className="w-24 text-center">Order</th>
                            <th className="w-24 text-center">Status</th>
                            <th className="w-24 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-6 text-text-muted">No links found for this column.</td></tr>
                        ) : data.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="text-center font-medium text-text-muted">{index + 1}</td>
                                <td className="font-bold text-secondary">{item.label}</td>
                                <td className="text-text-muted font-mono text-sm max-w-[200px] truncate" title={item.url}>{item.url}</td>
                                <td className="text-center">{item.displayOrder}</td>
                                <td className="text-center">
                                    <button
                                        onClick={() => handleToggleActive(item.id)}
                                        className={`px-2 py-1 text-xs font-bold rounded-full w-20 transition-colors ${item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        {item.isActive ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="text-right">
                                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded transition-colors" title="Edit Link">
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AdminPageLayout title="Footer Links" subtitle="Manage external and internal hyperlinks located in the footer" actionButtons={actionButtons}>
            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : (
                <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                    {renderTable(importantLinks, "Important Links")}
                    {renderTable(usefulLinks, "Useful Links")}
                </div>
            )}

            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLink ? 'Edit Footer Link' : 'Add Footer Link'} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-main font-bold mb-1">Column placement *</label>
                        <select name="column" className="admin-input" value={formData.column} onChange={handleChange} required>
                            <option value="IMPORTANT">Important Links</option>
                            <option value="USEFUL">Useful Links</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1">Link Label *</label>
                        <input type="text" name="label" className="admin-input" value={formData.label} onChange={handleChange} required placeholder="e.g. Policies" />
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1">URL / Route *</label>
                        <input type="text" name="url" className="admin-input" value={formData.url} onChange={handleChange} required placeholder="e.g. /policies or https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Display Order</label>
                            <input type="number" name="displayOrder" className="admin-input" value={formData.displayOrder} onChange={handleChange} />
                        </div>
                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-main">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                Active
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-light">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors">Cancel</button>
                        <button type="submit" className="admin-btn-primary px-6 py-2">Save Link</button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
