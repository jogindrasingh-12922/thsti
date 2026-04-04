import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import { Edit2, Trash2, ExternalLink, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifications() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterType, setFilterType] = useState('');
    const [formData, setFormData] = useState({
        title: '', summary: '', imageUrl: '', url: '', buttonText: '',
        openInNewTab: false, type: 'Announcements',
        publishDate: '', isActive: true, isNew: false
    });

    useEffect(() => { 
        fetchCategories();
        fetchItems(); 
    }, [filterType]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/notifications/categories');
            setCategories(res.data);
            if (res.data.length > 0 && formData.type === 'Announcements') {
                // Keep 'Announcements' as default if it exists, otherwise pick first
                const hasAnn = res.data.find(c => c.name === 'Announcements');
                if (!hasAnn) {
                    setFormData(prev => ({ ...prev, type: res.data[0].name }));
                }
            }
        } catch { toast.error('Failed to fetch categories'); }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            const url = filterType ? `/notifications/all?type=${filterType}` : '/notifications/all';
            const res = await api.get(url);
            setItems(res.data);
        } catch { toast.error('Failed to fetch notifications'); }
        finally { setLoading(false); }
    };

    const handleAddCategory = async () => {
        const catName = window.prompt("Enter new Notification Type (e.g. Circulars):");
        if (!catName || !catName.trim()) return;
        try {
            await api.post('/notifications/categories', { name: catName.trim() });
            toast.success('Category added!');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete this category? Notifications using it will still keep the type name as string, but the tab might disappear if empty.")) return;
        try {
            await api.delete(`/notifications/categories/${id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete category');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/notifications/${editingItem.id}`, formData);
                toast.success('Notification updated');
            } else {
                await api.post('/notifications', formData);
                toast.success('Notification created');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try { await api.delete(`/notifications/${id}`); toast.success('Deleted'); fetchItems(); }
        catch { toast.error('Failed to delete'); }
    };

    const toggleStatus = async (id) => {
        try { await api.patch(`/notifications/${id}/toggle-active`); toast.success('Status updated'); fetchItems(); }
        catch { toast.error('Failed to update status'); }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        const today = new Date().toISOString().slice(0, 10);
        setFormData(item ? {
            title: item.title, summary: item.summary || '', imageUrl: item.imageUrl || '',
            url: item.url || '', buttonText: item.buttonText || '', openInNewTab: item.openInNewTab || false,
            type: item.type, publishDate: item.publishDate ? new Date(item.publishDate).toISOString().slice(0, 10) : today,
            isActive: item.isActive ?? true, isNew: item.isNew || false
        } : {
            title: '', summary: '', imageUrl: '', url: '', buttonText: '', openInNewTab: false,
            type: categories[0]?.name || 'Announcements', publishDate: today, isActive: true, isNew: false
        });
        setIsModalOpen(true);
    };

    return (
        <AdminPageLayout
            title="Notifications"
            subtitle="Manage announcements, jobs, results, and tenders shown in the homepage tabs"
            actions={
                <div className="flex gap-2">
                    <button onClick={handleAddCategory} className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-200 transition-colors flex items-center gap-1">
                        <Plus size={16} /> Add Type
                    </button>
                    <button onClick={() => openModal()} className="bg-[var(--primary)] text-white px-4 py-2 rounded shadow hover:bg-red-800 transition-colors">
                        + Add Notification
                    </button>
                </div>
            }
        >
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${!filterType ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>All</button>
                {categories.map(c => (
                    <div key={c.id} className="inline-flex">
                        <button onClick={() => setFilterType(c.name)} className={`px-3 py-1.5 rounded-l text-sm font-medium transition-colors ${filterType === c.name ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                            {c.name}
                        </button>
                        <button onClick={() => handleDeleteCategory(c.id)} title="Delete Type" className="px-2 py-1.5 rounded-r text-sm font-medium transition-colors bg-white border border-l-0 border-gray-300 text-red-500 hover:bg-red-50 hover:text-red-700">
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No notifications found. Add one above.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New?</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                                        {item.title}
                                        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="ml-1 text-blue-500 hover:text-blue-700 inline-block"><ExternalLink size={11} /></a>}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {new Date(item.publishDate).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                        {item.isNew && <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">New</span>}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button onClick={() => toggleStatus(item.id)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openModal(item)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Notification' : 'Add Notification'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border border-gray-300 rounded-md p-2">
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                            <input type="date" value={formData.publishDate} onChange={e => setFormData({ ...formData, publishDate: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Summary (Optional)</label>
                        <textarea value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" rows={2} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                            <input type="text" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (Optional)</label>
                            <input type="text" value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. READ MORE" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                            <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" placeholder="https://... or /uploads/..." />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {[['openInNewTab', 'Open in new tab'], ['isNew', 'Mark as New'], ['isActive', 'Active']].map(([key, label]) => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.checked })} className="rounded border-gray-300" />
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end pt-4 border-t gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded shadow hover:bg-red-800">
                            {editingItem ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
