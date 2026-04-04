import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, PUBLIC_SITE_URL, ASSETS_BASE_URL } from '../config/env';
import { Plus, Edit2, Shield, Eye, ShieldAlert, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function ResearchFacilities() {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [viewingFacility, setViewingFacility] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        imageUrl: '',
        routeUrl: '',
        isExternal: false,
        openInNewTab: false,
        displayOrder: 0,
        isActive: true
    });

    const fetchFacilities = useCallback(async () => {
        try {
            const res = await api.get('/research-facilities/admin');
            setFacilities(res.data);
        } catch (err) {
            console.error('Failed to fetch research facilities', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    const handleOpenModal = (facility = null) => {
        if (facility) {
            setEditingFacility(facility);
            setFormData({ ...facility, excerpt: facility.excerpt || '', imageUrl: facility.imageUrl || '', routeUrl: facility.routeUrl || '' });
        } else {
            setEditingFacility(null);
            setFormData({
                title: '', slug: '', excerpt: '', imageUrl: '', routeUrl: '', isExternal: false, openInNewTab: false,
                displayOrder: facilities.length > 0 ? Math.max(...facilities.map(f => f.displayOrder)) + 1 : 1,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFacility(null);
        setViewingFacility(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };

            // Auto-generate slug from title if creating new
            if (name === 'title' && !editingFacility) {
                updates.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return { ...prev, ...updates };
        });
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
        try {
            const payload = { ...formData, displayOrder: parseInt(formData.displayOrder, 10) };
            if (editingFacility) {
                await api.put(`/research-facilities/admin/${editingFacility.id}`, payload);
            } else {
                await api.post('/research-facilities/admin', payload);
            }
            handleCloseModal();
            fetchFacilities();
            toast.success('Saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save research facility');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.patch(`/research-facilities/admin/${id}/toggle`);
            fetchFacilities();
        } catch (err) {
            alert('Failed to toggle status');
        }
    };

    const handleMove = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === facilities.length - 1) return;

        const newFacilities = [...facilities];
        const item = newFacilities[index];
        const swapItem = newFacilities[index + (direction === 'up' ? -1 : 1)];

        const tempOrder = item.displayOrder;
        item.displayOrder = swapItem.displayOrder;
        swapItem.displayOrder = tempOrder;

        newFacilities.sort((a, b) => a.displayOrder - b.displayOrder);
        setFacilities(newFacilities);

        try {
            await api.put('/research-facilities/admin/reorder', {
                orders: newFacilities.map(f => ({ id: f.id, displayOrder: f.displayOrder }))
            });
        } catch (err) {
            alert('Failed to reorder. Refreshing data.');
            fetchFacilities();
        }
    };

    if (loading) return <div>Loading research facilities...</div>;

    return (
        <AdminPageLayout
            title="Research Facilities"
            subtitle="Manage dynamic research facility cards for the public homepage"
            actions={
                <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Facility
                </button>
            }
        >
            <div className="admin-card overflow-x-auto">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="w-16">Reorder</th>
                            <th className="w-16">S.No</th>
                            <th className="w-16">Image</th>
                            <th>Title</th>
                            <th>Excerpt</th>
                            <th className="text-center">Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facilities.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-8 text-text-muted">No research facilities found. Add one to get started.</td></tr>
                        ) : facilities.map((facility, index) => (
                            <tr key={facility.id} className="hover:bg-gray-50 border-b border-border-light last:border-0">
                                <td className="p-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className={`p-1 rounded bg-gray-100 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}>
                                            <ArrowUp size={14} />
                                        </button>
                                        <button onClick={() => handleMove(index, 'down')} disabled={index === facilities.length - 1} className={`p-1 rounded bg-gray-100 ${index === facilities.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}>
                                            <ArrowDown size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3 text-text-muted">{index + 1}</td>
                                <td className="p-3">
                                    {facility.imageUrl ? (
                                        <img src={facility.imageUrl.startsWith('http') ? facility.imageUrl : `${ASSETS_BASE_URL}/${facility.imageUrl.replace(/^\//, '')}`} alt={facility.title} className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200" onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Img' }} />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">N/A</div>
                                    )}
                                </td>
                                <td className="p-3 font-bold text-secondary">
                                    {facility.title}
                                    <span className="block text-xs font-normal text-text-muted mt-1 font-mono">{facility.slug}</span>
                                </td>
                                <td className="p-3 text-sm text-text-main max-w-xs truncate" title={facility.excerpt}>
                                    {facility.excerpt || <span className="text-gray-400 italic">No excerpt</span>}
                                </td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleToggleActive(facility.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 transition-colors ${facility.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        {facility.isActive ? <><Shield size={12} /> Active</> : <><ShieldAlert size={12} /> Draft</>}
                                    </button>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setViewingFacility(facility)} className="p-2 text-text-muted hover:text-primary transition-colors tooltip" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleOpenModal(facility)} className="p-2 text-text-muted hover:text-primary transition-colors tooltip" title="Edit Facility">
                                            <Edit2 size={18} />
                                        </button>
                                        {(facility.routeUrl || facility.slug) && (
                                            <a href={facility.isExternal ? facility.routeUrl : `${PUBLIC_SITE_URL}/research-facilities/${facility.slug}`} target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-accent transition-colors tooltip" title="Preview Public Link">
                                                <ExternalLink size={18} />
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            {viewingFacility && (
                <AdminModal isOpen={true} onClose={handleCloseModal} title={`Viewing: ${viewingFacility.title}`}>
                    <div className="space-y-4 text-sm text-text-main">
                        <div><strong className="block text-secondary">Title:</strong> {viewingFacility.title}</div>
                        <div><strong className="block text-secondary">Slug:</strong> <span className="font-mono bg-gray-100 px-1">{viewingFacility.slug}</span></div>
                        <div><strong className="block text-secondary">Excerpt:</strong> <div className="p-2 bg-gray-50 border rounded mt-1">{viewingFacility.excerpt}</div></div>
                        <div><strong className="block text-secondary">Image URL:</strong> {viewingFacility.imageUrl ? <span className="text-blue-600 underline">{viewingFacility.imageUrl}</span> : 'None'}</div>
                        <div><strong className="block text-secondary">Link Details:</strong>
                            {viewingFacility.isExternal ? ' External URL' : ' Internal Route'} | {viewingFacility.openInNewTab ? 'Opens in New Tab' : 'Same Tab'}
                            <br /><span className="font-mono text-xs">{viewingFacility.routeUrl}</span>
                        </div>
                        <div><strong className="block text-secondary">Display Order:</strong> {viewingFacility.displayOrder}</div>
                        <div><strong className="block text-secondary">Status:</strong> {viewingFacility.isActive ? 'Active' : 'Draft'}</div>
                    </div>
                </AdminModal>
            )}

            {/* Edit / Create Modal */}
            <AdminModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFacility ? 'Edit Research Facility' : 'Add New Research Facility'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-text-main font-bold mb-1">Facility Title *</label>
                            <input type="text" name="title" required className="admin-input" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-text-main font-bold mb-1">Slug (URL snippet) *</label>
                            <input type="text" name="slug" required className="admin-input font-mono text-sm" value={formData.slug} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Excerpt (Short Description over Image)</label>
                            <textarea name="excerpt" maxLength="400" className="admin-input h-24" value={formData.excerpt} onChange={handleChange} placeholder="Max 400 characters." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Image Source *</label>
                            
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
                                    <input type="text" name="imageUrl" className="admin-input py-1.5 text-xs" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
                                </div>
                            </div>
                            {formData.imageUrl && (
                                <div className="mt-1 text-xs px-1 text-gray-500">
                                    Source: <span className="text-blue-600 font-mono truncate inline-block max-w-sm align-bottom">{formData.imageUrl}</span>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-text-main font-bold mb-1">Route / Link URL</label>
                            <input type="text" name="routeUrl" className="admin-input text-sm" value={formData.routeUrl} onChange={handleChange} placeholder="Leave blank for auto-slug routing" />
                        </div>
                        <div className="md:col-span-1 flex flex-col justify-end space-y-2 pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="isExternal" className="admin-checkbox" checked={formData.isExternal} onChange={handleChange} />
                                <span className="text-sm font-bold text-text-dark">Is External Link?</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="openInNewTab" className="admin-checkbox" checked={formData.openInNewTab} onChange={handleChange} />
                                <span className="text-sm font-bold text-text-dark">Open link in new tab?</span>
                            </label>
                        </div>

                        <div className="md:col-span-1 border-t border-border-light pt-4 mt-2">
                            <label className="block text-text-main font-bold mb-1">Display Order</label>
                            <input type="number" name="displayOrder" required className="admin-input w-24" value={formData.displayOrder} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-1 border-t border-border-light pt-4 mt-2 flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer bg-bg-light p-2 px-4 rounded border border-border-light w-full">
                                <input type="checkbox" name="isActive" className="admin-checkbox w-5 h-5" checked={formData.isActive} onChange={handleChange} />
                                <span className="font-bold text-text-dark">Publish (Active)</span>
                            </label>
                        </div>

                    </div>

                    <div className="pt-4 border-t border-border-light flex justify-end gap-4 mt-6">
                        <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors uppercase tracking-wide">
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn-primary px-8">
                            Save Facility
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
