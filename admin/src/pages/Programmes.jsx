import React, { useState, useEffect, useCallback } from 'react';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import { Pencil, Trash2, Plus, GripVertical, ExternalLink } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function Programmes() {
    const [programmes, setProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        imageUrl: '',
        routeUrl: '',
        isExternal: false,
        openInNewTab: false,
        displayOrder: 0,
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProgrammes = useCallback(async () => {
        try {
            const res = await api.get('/programmes/admin');
            setProgrammes(res.data);
        } catch (err) {
            console.error('Failed to fetch programmes', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProgrammes();
    }, [fetchProgrammes]);

    const handleOpenModal = (item = null) => {
        setError(null);
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                shortDescription: item.shortDescription || '',
                imageUrl: item.imageUrl || '',
                routeUrl: item.routeUrl || '',
                isExternal: item.isExternal || false,
                openInNewTab: item.openInNewTab || false,
                displayOrder: item.displayOrder,
                isActive: item.isActive
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                shortDescription: '',
                imageUrl: '',
                routeUrl: '',
                isExternal: false,
                openInNewTab: false,
                displayOrder: programmes.length > 0 ? Math.max(...programmes.map(p => p.displayOrder)) + 1 : 1,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validExt = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validExt.includes(file.type)) {
            alert('Only JPG, JPEG, and PNG files are allowed.');
            e.target.value = '';
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/media/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
            toast.success('Image uploaded successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload image');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const dataToSubmit = {
                ...formData,
                displayOrder: Number(formData.displayOrder)
            };

            if (editingItem) {
                await api.put(`/programmes/admin/${editingItem.id}`, dataToSubmit);
            } else {
                await api.post('/programmes/admin', dataToSubmit);
            }

            await fetchProgrammes();
            handleCloseModal();
            toast.success('Saved successfully!');
        } catch (err) {
            console.error('Error saving programme', err);
            setError(err.response?.data?.error || 'Failed to save programme. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this programme?')) return;

        try {
            await api.delete(`/programmes/admin/${id}`);
            setProgrammes(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete programme', err);
            alert('Failed to delete programme');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/programmes/admin/${id}/toggle`, { isActive: !currentStatus });
            setProgrammes(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
        } catch (err) {
            console.error('Failed to toggle active status', err);
        }
    };

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(programmes);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            displayOrder: index + 1
        }));

        setProgrammes(updatedItems);

        try {
            await api.put('/programmes/admin/reorder', {
                items: updatedItems.map(item => ({ id: item.id, displayOrder: item.displayOrder }))
            });
        } catch (error) {
            console.error('Failed to save updated order', error);
            fetchProgrammes();
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        // Import ASSETS_BASE_URL dynamically to avoid missing imports up top if forgotten
        const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL || 'http://localhost:5000';
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        return `${baseUrl}/${cleanUrl}`;
    };

    if (loading) return <div>Loading programmes...</div>;

    return (
        <AdminPageLayout
            title="Programmes"
            subtitle="Manage dynamic programme cards for the 'Explore our Programmes' section"
            actions={
                <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Programme
                </button>
            }
        >
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="programmes">
                        {(provided) => (
                            <table className="min-w-full divide-y divide-gray-200" {...provided.droppableProps} ref={provided.innerRef}>
                                <thead className="bg-[var(--bg-light)]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Route</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {programmes.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`${snapshot.isDragging ? 'bg-blue-50 shadow-md ring-1 ring-blue-200' : 'hover:bg-gray-50'} transition-colors`}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                        <div {...provided.dragHandleProps} className="cursor-grab hover:text-gray-600 active:cursor-grabbing p-1">
                                                            <GripVertical size={20} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={getImageUrl(item.imageUrl) || 'https://placehold.co/400x300?text=No+Image'}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                                                alt={item.title}
                                                                className="h-12 w-16 object-cover rounded shadow-sm border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-16 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-400 border border-gray-200">No Image</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                                                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                            {item.routeUrl || '/'}
                                                            {(item.isExternal || item.openInNewTab) && <ExternalLink size={12} />}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">Slug: {item.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600 max-w-xs truncate" title={item.shortDescription}>
                                                            {item.shortDescription || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleToggleActive(item.id, item.isActive)}
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {item.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => handleOpenModal(item)}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors tooltip-trigger"
                                                                title="Edit Programme"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors tooltip-trigger"
                                                                title="Delete Programme"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {programmes.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-8 text-gray-500">No programmes found. Add one to get started.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Edit Programme' : 'Add New Programme'}
            >
                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="admin-form-label">Programme Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="admin-form-input"
                                required
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="admin-form-label">Short Description</label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                className="admin-form-input h-20"
                                placeholder="Short paragraph displayed on the card..."
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="admin-form-label mb-2">Image Source</label>
                            
                            <div className="flex flex-col md:flex-row gap-4 p-3 bg-gray-50 border border-gray-200 rounded items-start md:items-center">
                                <div className="flex-1 w-full">
                                    <span className="font-semibold text-xs text-gray-700 block mb-1">Upload File (JPG/PNG)</span>
                                    <input 
                                        type="file" 
                                        accept=".jpg,.jpeg,.png" 
                                        onChange={handleImageUpload} 
                                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border bg-white rounded-md p-1" 
                                    />
                                    {uploading && <span className="text-[10px] text-blue-600 font-bold animate-pulse mt-1 block">Uploading...</span>}
                                </div>
                                
                                <div className="hidden md:block text-xs font-bold text-gray-400 uppercase">OR</div>
                                
                                <div className="flex-1 w-full">
                                    <span className="font-semibold text-xs text-gray-700 block mb-1">Paste URL/Link</span>
                                    <input type="text" name="imageUrl" className="admin-form-input py-1.5 text-xs h-9" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
                                </div>
                            </div>

                            {formData.imageUrl && (
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="text-xs px-1 text-gray-500 flex-1 truncate pr-4">
                                        Source: <span className="text-blue-600 font-mono inline-block align-bottom truncate w-full">{formData.imageUrl}</span>
                                    </div>
                                    <img
                                        src={getImageUrl(formData.imageUrl)}
                                        alt="Preview"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                        className="h-12 w-auto object-contain rounded border border-gray-200 bg-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t pt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Link Configuration</h4>
                        </div>

                        <div>
                            <label className="admin-form-label">Route / URL</label>
                            <input
                                type="text"
                                name="routeUrl"
                                value={formData.routeUrl}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="/academics/phd or https://..."
                            />
                        </div>

                        <div className="flex flex-col justify-end gap-2 pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isExternal"
                                    checked={formData.isExternal}
                                    onChange={handleChange}
                                    className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <span className="text-sm text-gray-700">Is External URL?</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="openInNewTab"
                                    checked={formData.openInNewTab}
                                    onChange={handleChange}
                                    className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <span className="text-sm text-gray-700">Open in New Tab?</span>
                            </label>
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t pt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Visibility settings</h4>
                        </div>

                        <div>
                            <label className="admin-form-label">Display Order</label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                className="admin-form-input"
                                min="0"
                            />
                        </div>

                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="rounded text-[var(--primary)] focus:ring-[var(--primary)] w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button type="button" onClick={handleCloseModal} className="admin-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
                            {isSubmitting ? 'Saving...' : (editingItem ? 'Update Programme' : 'Add Programme')}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
