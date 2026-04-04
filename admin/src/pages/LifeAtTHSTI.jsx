import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import { Pencil, Trash2, Plus, GripVertical, Check, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function LifeAtTHSTI() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        isExternal: false,
        openInNewTab: false,
        isActive: true,
        metadata: {
            titleColor: '#000000',
            titleFontSize: '24px',
            categoryColor: '#000000',
            descColor: '#000000',
            bgColor: '#ffffff'
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        try {
            const response = await api.get('/life-at-thsti/admin');
            setItems(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching life at thsti items:', err);
            setError('Failed to fetch items. Please try again later.');
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            
            // Parse metadata safely
            let parsedMetadata = {
                titleColor: '#000000', titleFontSize: '24px', categoryColor: '#000000', descColor: '#000000', bgColor: '#ffffff'
            };
            try {
                if (item.metadata) {
                    const parsed = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
                    parsedMetadata = { ...parsedMetadata, ...parsed };
                }
            } catch (e) {
                console.error("Failed to parse metadata", e);
            }

            setFormData({
                title: item.title || '',
                category: item.category || '',
                description: item.description || '',
                imageUrl: item.imageUrl || '',
                buttonText: item.buttonText || '',
                buttonLink: item.buttonLink || '',
                isExternal: item.isExternal || false,
                openInNewTab: item.openInNewTab || false,
                isActive: item.isActive !== false,
                metadata: parsedMetadata
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '', category: '', description: '', imageUrl: '', buttonText: '', buttonLink: '', isExternal: false, openInNewTab: false, isActive: true,
                metadata: { titleColor: '#000000', titleFontSize: '24px', categoryColor: '#000000', descColor: '#000000', bgColor: '#ffffff'}
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('meta_')) {
            const metaKey = name.replace('meta_', '');
            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    [metaKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validExt = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validExt.includes(file.type)) {
            toast.error('Only JPG, JPEG, and PNG files are allowed.');
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
            const submitData = {
                ...formData,
                displayOrder: editingItem ? editingItem.displayOrder : items.length
            };

            if (editingItem) {
                await api.put(`/life-at-thsti/admin/${editingItem.id}`, submitData);
            } else {
                await api.post('/life-at-thsti/admin', submitData);
            }

            await fetchItems();
            handleCloseModal();
            toast.success('Saved successfully!');
        } catch (err) {
            console.error('Error saving item', err);
            setError(err.response?.data?.error || 'Failed to save item. Please try again.');
            toast.error('Failed to save item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/life-at-thsti/admin/${id}`);
                await fetchItems();
                toast.success('Item deleted successfully');
            } catch (err) {
                console.error('Error deleting item', err);
                toast.error('Failed to delete item.');
            }
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.patch(`/life-at-thsti/admin/${id}/toggle`);
            setItems(items.map(item =>
                item.id === id ? { ...item, isActive: !item.isActive } : item
            ));
            toast.success('Status updated');
        } catch (err) {
            console.error('Error toggling status', err);
            toast.error('Failed to toggle status.');
            fetchItems();
        }
    };

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = reorderedItems.map((item, index) => ({
            ...item,
            displayOrder: index
        }));

        setItems(updatedItems);

        try {
            await api.put('/life-at-thsti/admin/reorder', {
                items: updatedItems.map(({ id, displayOrder }) => ({ id, displayOrder }))
            });
            toast.success('Order saved');
        } catch (error) {
            console.error('Error saving order', error);
            toast.error('Failed to save new order');
            fetchItems();
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL || 'http://localhost:5000';
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        return `${baseUrl}/${cleanUrl}`;
    };

    const actionButtons = (
        <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center">
            <Plus size={18} className="mr-2" /> Add Item
        </button>
    );

    return (
        <AdminPageLayout
            title="Life on The THSTI"
            subtitle="Manage dynamic cards for the 'Life on The THSTI' section"
            actionButtons={actionButtons}
        >
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="life-items">
                        {(provided) => (
                            <table className="admin-table w-full" {...provided.droppableProps} ref={provided.innerRef}>
                                <thead className="admin-table-header">
                                    <tr>
                                        <th className="w-12 text-center text-xs font-bold tracking-wider text-gray-500 uppercase"></th>
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">Image</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">Title & Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-gray-500 uppercase w-32">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="admin-table-body">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading items...</td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No items found. Click 'Add Item' to create one.</td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`${snapshot.isDragging ? 'bg-blue-50 shadow-md ring-1 ring-blue-200' : 'hover:bg-gray-50'} transition-all`}
                                                        style={provided.draggableProps.style}
                                                    >
                                                        <td className="px-2 py-4 align-middle">
                                                            <div {...provided.dragHandleProps} className="flex justify-center text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-2">
                                                                <GripVertical size={18} />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                                                            {item.imageUrl ? (
                                                                <div className="h-12 w-20 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                                                                    <img
                                                                        src={getImageUrl(item.imageUrl)}
                                                                        alt={item.title}
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="h-12 w-20 rounded bg-gray-100 flex items-center justify-center border border-gray-200 border-dashed text-gray-400 text-xs">
                                                                    No Img
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            <div className="font-semibold text-gray-900">{item.title}</div>
                                                            {item.category && <div className="text-sm text-gray-500 mt-0.5">{item.category}</div>}
                                                        </td>
                                                        <td className="px-6 py-4 align-middle">
                                                            <div className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={item.description}>
                                                                {item.description || <span className="text-gray-400 italic">No description</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                                                            <button
                                                                onClick={() => handleToggleActive(item.id)}
                                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${item.isActive
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
                                                                    }`}
                                                            >
                                                                {item.isActive ? 'Active' : 'Hidden'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-middle">
                                                            <div className="flex items-center justify-end space-x-3">
                                                                <button
                                                                    onClick={() => handleOpenModal(item)}
                                                                    className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))
                                    )}
                                    {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Edit Item' : 'Add New Item'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="admin-form-label mb-2">Image Source (for images)</label>
                            
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
                                    <img src={getImageUrl(formData.imageUrl)} alt="Preview" className="h-12 object-contain border border-gray-200 bg-white" />
                                </div>
                            )}
                        </div>

                        <div className="col-span-1">
                            <label className="admin-form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder=" e.g. Varsity Athletics"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="admin-form-label">Category / Super Title</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder=" e.g. Feature, Performing Arts"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="admin-form-label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="admin-form-input min-h-[80px]"
                                placeholder="Short description..."
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="admin-form-label">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="e.g. View Teams"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="admin-form-label">Button Link URL</label>
                            <input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="e.g. /athletics"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span>Active (Visible)</span>
                            </label>
                        </div>

                        {/* Styling Options */}
                        <div className="col-span-1 md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Styling & Colors (Optional)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Title Color</label>
                                    <input type="color" name="meta_titleColor" value={formData.metadata?.titleColor || '#ffffff'} onChange={handleChange} className="w-full h-8 cursor-pointer rounded" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Category Color</label>
                                    <input type="color" name="meta_categoryColor" value={formData.metadata?.categoryColor || '#ffb000'} onChange={handleChange} className="w-full h-8 cursor-pointer rounded" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Description Color</label>
                                    <input type="color" name="meta_descColor" value={formData.metadata?.descColor || '#ffffff'} onChange={handleChange} className="w-full h-8 cursor-pointer rounded" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Box / Bg Color (Item 3)</label>
                                    <input type="color" name="meta_bgColor" value={formData.metadata?.bgColor || '#77181e'} onChange={handleChange} className="w-full h-8 cursor-pointer rounded" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Title Font Size</label>
                                    <select name="meta_titleFontSize" value={formData.metadata?.titleFontSize || '24px'} onChange={handleChange} className="admin-form-input py-1 text-sm h-8">
                                        <option value="16px">Small (16px)</option>
                                        <option value="20px">Medium (20px)</option>
                                        <option value="24px">Large (24px)</option>
                                        <option value="30px">X-Large (30px)</option>
                                        <option value="36px">XX-Large (36px)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="admin-btn-secondary"
                            disabled={isSubmitting || uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="admin-btn-primary"
                            disabled={isSubmitting || uploading}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
