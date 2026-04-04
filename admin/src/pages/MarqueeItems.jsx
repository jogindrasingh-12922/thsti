import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarqueeItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ title: '', url: '', openInNewTab: false, isActive: true });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/marquee/all');
            setItems(res.data);
        } catch { toast.error('Failed to fetch marquee items'); }
        finally { setLoading(false); }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const reordered = Array.from(items);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        const updated = reordered.map((item, idx) => ({ ...item, displayOrder: idx }));
        setItems(updated);
        try {
            await api.patch('/marquee/reorder', { items: updated.map(i => ({ id: i.id, order: i.displayOrder })) });
            toast.success('Order saved');
        } catch { toast.error('Failed to save order'); fetchItems(); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/marquee/${editingItem.id}`, formData);
                toast.success('Item updated');
            } else {
                await api.post('/marquee', { ...formData, displayOrder: items.length });
                toast.success('Item created');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this marquee item?')) return;
        try { await api.delete(`/marquee/${id}`); toast.success('Deleted'); fetchItems(); }
        catch { toast.error('Failed to delete'); }
    };

    const toggleStatus = async (id) => {
        try { await api.patch(`/marquee/${id}/toggle-active`); toast.success('Status updated'); fetchItems(); }
        catch { toast.error('Failed to update status'); }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setFormData(item
            ? { title: item.title, url: item.url || '', openInNewTab: item.openInNewTab || false, isActive: item.isActive ?? true }
            : { title: '', url: '', openInNewTab: false, isActive: true }
        );
        setIsModalOpen(true);
    };

    return (
        <AdminPageLayout
            title="What's New — Marquee Ticker"
            subtitle="Manage scrolling announcement items shown in the ticker bar"
            actions={
                <button onClick={() => openModal()} className="bg-[var(--primary)] text-white px-4 py-2 rounded shadow hover:bg-red-800 transition-colors">
                    + Add Item
                </button>
            }
        >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No marquee items yet. Add one above.</div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="marqueeList">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="w-10 px-4 py-3"></th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {items.map((item, index) => (
                                                <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <tr ref={provided.innerRef} {...provided.draggableProps} className={`${snapshot.isDragging ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                                                            <td className="px-4 py-4 text-gray-400">
                                                                <div {...provided.dragHandleProps} className="cursor-grab hover:text-gray-600">
                                                                    <GripVertical size={18} />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-sm truncate">{item.title}</td>
                                                            <td className="px-4 py-4 text-sm text-gray-500 truncate max-w-xs">
                                                                {item.url ? (
                                                                    <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                                        <ExternalLink size={12} /> {item.url}
                                                                    </a>
                                                                ) : '—'}
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
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>

            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Marquee Item' : 'Add Marquee Item'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title / Announcement Text *</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                        <input type="text" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border border-gray-300 rounded-md p-2" placeholder="https://..." />
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={formData.openInNewTab} onChange={e => setFormData({ ...formData, openInNewTab: e.target.checked })} className="rounded border-gray-300" />
                            <span className="text-sm text-gray-700">Open in new tab</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded border-gray-300" />
                            <span className="text-sm text-gray-700">Active</span>
                        </label>
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
