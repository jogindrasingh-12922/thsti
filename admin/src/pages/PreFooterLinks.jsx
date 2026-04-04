import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2, GripVertical, Check, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PreFooterLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [mediaList, setMediaList] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        imageUrl: '',
        isActive: true,
        openInNewTab: false
    });

    useEffect(() => {
        fetchLinks();
        fetchMedia();
    }, []);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pre-footer-links/all');
            setLinks(res.data);
        } catch (error) {
            toast.error("Failed to fetch pre-footer links");
        } finally {
            setLoading(false);
        }
    };

    const fetchMedia = async () => {
        try {
            const res = await api.get('/media');
            setMediaList(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(links);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({ ...item, displayOrder: index }));
        setLinks(updatedItems);

        try {
            await api.patch('/pre-footer-links/reorder', {
                items: updatedItems.map(item => ({ id: item.id, order: item.displayOrder }))
            });
            toast.success("Order saved");
        } catch (error) {
            toast.error("Failed to save order");
            fetchLinks();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLink) {
                await api.put(`/pre-footer-links/${editingLink.id}`, formData);
                toast.success("Link updated");
            } else {
                await api.post('/pre-footer-links', { ...formData, displayOrder: links.length });
                toast.success("Link created");
            }
            setIsModalOpen(false);
            fetchLinks();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save link");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this link?")) return;
        try {
            await api.delete(`/pre-footer-links/${id}`);
            toast.success("Link deleted");
            fetchLinks();
        } catch (error) {
            toast.error("Failed to delete link");
        }
    };

    const toggleStatus = async (id) => {
        try {
            await api.patch(`/pre-footer-links/${id}/toggle-active`);
            toast.success("Status updated");
            fetchLinks();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const openModal = (link = null) => {
        if (link) {
            setEditingLink(link);
            setFormData({
                title: link.title || '',
                url: link.url || '',
                imageUrl: link.imageUrl || '',
                isActive: link.isActive ?? true,
                openInNewTab: link.openInNewTab || false
            });
        } else {
            setEditingLink(null);
            setFormData({
                title: '', url: '', imageUrl: '', isActive: true, openInNewTab: false
            });
        }
        setIsModalOpen(true);
    };

    return (
        <AdminPageLayout
            title="Pre-Footer Strip Links"
            subtitle="Manage important logos/links directly above the footer"
            actions={
                <button
                    onClick={() => openModal()}
                    className="bg-[var(--primary)] text-white px-4 py-2 rounded shadow hover:bg-red-800 transition-colors"
                >
                    + Add Link
                </button>
            }
        >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="linksList">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-10 px-4 py-3"></th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {links.map((link, index) => (
                                            <Draggable key={link.id.toString()} draggableId={link.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`${snapshot.isDragging ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
                                                    >
                                                        <td className="px-4 py-4 text-gray-400">
                                                            <div {...provided.dragHandleProps} className="cursor-grab hover:text-gray-600">
                                                                <GripVertical size={18} />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {link.imageUrl ? (
                                                                <img src={link.imageUrl} alt={link.title} className="h-10 w-auto object-contain bg-gray-100 rounded p-1" />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-gray-100 text-gray-400 flex items-center justify-center rounded"><ImageIcon size={20} /></div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                            {link.title}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-500 truncate max-w-[200px]">
                                                            {link.url || '-'}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <button
                                                                onClick={() => toggleStatus(link.id)}
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${link.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                            >
                                                                {link.isActive ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-sm">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openModal(link)} className="text-gray-400 hover:text-blue-600">
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button onClick={() => handleDelete(link.id)} className="text-gray-400 hover:text-red-600">
                                                                    <Trash2 size={16} />
                                                                </button>
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
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingLink ? 'Edit Link' : 'Add New Link'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (Alt Text)</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image (Optional)</label>
                        <select
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Select Logo from Media Library</option>
                            {mediaList.map(m => (
                                <option key={m.id} value={m.url}>{m.filename}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.openInNewTab}
                                onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-gray-700">Open link in new tab</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--primary)] text-white rounded shadow hover:bg-red-800"
                        >
                            {editingLink ? 'Update Link' : 'Create Link'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
