import { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../config/env';
import { Plus, Edit2, Trash2, Save, MoveUp, MoveDown, Check, X, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function InternationalCollaboration() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        link: '',
        isActive: true,
        displayOrder: 0
    });

    const fetchItems = async () => {
        try {
            const res = await api.get('/international-collaboration');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch items', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setImageFile(null);
        setFormData({
            title: item.title,
            imageUrl: item.imageUrl || '',
            link: item.link || '',
            isActive: item.isActive,
            displayOrder: item.displayOrder
        });
        setIsModalOpen(true);
    };

    const handleOpenNew = () => {
        setEditingItem(null);
        setImageFile(null);
        setFormData({
            title: '', imageUrl: '', link: '', isActive: true, displayOrder: items.length
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let uploadedImageUrl = formData.imageUrl;
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);
                uploadData.append('altText', formData.title);
                uploadData.append('categoryId', '1');
                const uploadRes = await api.post('/media/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.url;
            }

            const payload = {
                ...formData,
                imageUrl: uploadedImageUrl
            };

            if (editingItem) {
                await api.put(`/international-collaboration/${editingItem.id}`, payload);
            } else {
                await api.post('/international-collaboration', payload);
            }
            handleCloseModal();
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save item');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/international-collaboration/${id}`);
                fetchItems();
            } catch (err) {
                alert('Failed to delete item');
            }
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.put(`/international-collaboration/${id}`, { isActive: !currentStatus });
            fetchItems();
        } catch (err) {
            alert('Failed to toggle status');
        }
    };

    const moveItem = async (index, direction) => {
        const newItems = [...items];
        if (direction === 'up' && index > 0) {
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
        } else {
            return;
        }

        const updatedOrder = newItems.map((item, i) => ({ id: item.id, displayOrder: i }));
        setItems(newItems); // Optimistic UI update
        try {
            await api.put('/international-collaboration/order', { items: updatedOrder });
        } catch (err) {
            alert('Failed to update order');
            fetchItems(); // Revert
        }
    };

    if (loading) return <div>Loading...</div>;

    const actionButtons = (
        <button onClick={handleOpenNew} className="admin-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> New Item
        </button>
    );

    return (
        <AdminPageLayout title="Int'l Collaboration" actionButtons={actionButtons}>
            <div className="admin-card overflow-hidden flex flex-col flex-1 min-h-0 bg-white shadow-sm border border-border-light">
                <div className="overflow-auto flex-1 p-6">
                    {items.length === 0 ? (
                        <div className="text-center text-text-muted italic py-12 border-2 border-dashed border-border-light rounded-lg">
                            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>No collaborations added yet.</p>
                            <button onClick={handleOpenNew} className="mt-4 text-primary font-bold hover:underline">Add First Collaboration</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="admin-card p-4 border border-border-light shadow-sm bg-white flex items-center gap-4 transition-shadow hover:shadow-md">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent text-gray-500 hover:text-primary transition-colors">
                                            <MoveUp size={16} />
                                        </button>
                                        <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent text-gray-500 hover:text-primary transition-colors">
                                            <MoveDown size={16} />
                                        </button>
                                    </div>
                                    <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img src={`${ASSETS_BASE_URL}${item.imageUrl}`} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-secondary text-lg leading-snug">{item.title}</h4>
                                        <p className="text-sm text-blue-600 mt-1 hover:underline truncate w-72"><a href={item.link || '#'} target="_blank" rel="noreferrer">{item.link || '#'}</a></p>
                                        <div className="mt-2 text-xs flex items-center gap-2">
                                            Status: 
                                            <button 
                                                onClick={() => handleToggleActive(item.id, item.isActive)}
                                                className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${item.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}
                                            >
                                                {item.isActive ? <Check size={12}/> : <X size={12}/>}
                                                {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEdit(item)} className="p-2 text-text-muted hover:text-primary hover:bg-blue-50 bg-gray-50 border border-border-light rounded shadow-sm transition-colors" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-text-muted hover:text-danger hover:bg-red-50 bg-gray-50 border border-border-light rounded shadow-sm transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <AdminModal isOpen={isModalOpen} title={editingItem ? "Edit Collaboration" : "New Collaboration"} onClose={handleCloseModal}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Title *</label>
                            <input type="text" name="title" className="admin-input" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Link / URL</label>
                            <input type="text" name="link" className="admin-input" placeholder="https://..." value={formData.link} onChange={handleChange} />
                            <p className="text-xs text-text-muted mt-1">E.g., where the arrow button redirects to.</p>
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Image</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="admin-input p-1" />
                                </div>
                                {(imageFile || formData.imageUrl) && (
                                    <div className="h-16 w-24 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                                        {imageFile ? (
                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <img src={`${ASSETS_BASE_URL}${formData.imageUrl}`} alt="Existing" className="h-full w-full object-cover" onError={(e) => e.target.style.display='none'} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                            <label htmlFor="isActive" className="text-text-main font-medium">Active (Visible on public site)</label>
                        </div>
                        <div className="pt-4 border-t border-border-light flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="admin-btn-outline">Cancel</button>
                            <button type="submit" className="admin-btn-primary flex items-center gap-2">
                                <Save size={16} /> Save
                            </button>
                        </div>
                    </form>
                </AdminModal>
            )}
        </AdminPageLayout>
    );
}
