import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Shield, Eye, ShieldAlert, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ASSETS_BASE_URL } from '../config/env';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function ResearchCenters() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState(null);
    const [viewingCenter, setViewingCenter] = useState(null);
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

    const fetchCenters = useCallback(async () => {
        try {
            const res = await api.get('/research-centers/all');
            setCenters(res.data);
        } catch (err) {
            console.error('Failed to fetch research centers', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    const handleOpenModal = (center = null) => {
        if (center) {
            setEditingCenter(center);
            setFormData({ ...center, excerpt: center.excerpt || '', imageUrl: center.imageUrl || '', routeUrl: center.routeUrl || '' });
        } else {
            setEditingCenter(null);
            setFormData({
                title: '', slug: '', excerpt: '', imageUrl: '', routeUrl: '', isExternal: false, openInNewTab: false,
                displayOrder: centers.length > 0 ? Math.max(...centers.map(c => c.displayOrder)) + 1 : 1,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCenter(null);
        setViewingCenter(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };

            // Auto-generate slug from title if creating new
            if (name === 'title' && !editingCenter) {
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
            if (editingCenter) {
                await api.put(`/research-centers/${editingCenter.id}`, payload);
            } else {
                await api.post('/research-centers', payload);
            }
            handleCloseModal();
            fetchCenters();
            toast.success('Saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save research center');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.patch(`/research-centers/${id}/toggle-active`);
            fetchCenters();
        } catch (err) {
            alert('Failed to toggle status');
        }
    };

    const handleMove = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === centers.length - 1) return;

        const newCenters = [...centers];
        const item = newCenters[index];
        const swapItem = newCenters[index + (direction === 'up' ? -1 : 1)];

        const tempOrder = item.displayOrder;
        item.displayOrder = swapItem.displayOrder;
        swapItem.displayOrder = tempOrder;

        newCenters.sort((a, b) => a.displayOrder - b.displayOrder);
        setCenters(newCenters);

        try {
            await api.put('/research-centers/reorder', {
                orders: newCenters.map(c => ({ id: c.id, displayOrder: c.displayOrder }))
            });
        } catch (err) {
            alert('Failed to reorder. Refreshing data.');
            fetchCenters();
        }
    };

    if (loading) return <div>Loading research centers...</div>;

    return (
        <AdminPageLayout
            title="Research Centers"
            subtitle="Manage dynamic research center cards for the public homepage"
            actions={
                <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Center
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
                        {centers.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-8 text-text-muted">No research centers found. Add one to get started.</td></tr>
                        ) : centers.map((center, index) => (
                            <tr key={center.id} className="hover:bg-gray-50 border-b border-border-light last:border-0">
                                <td className="p-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className={`p-1 rounded bg-gray-100 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}>
                                            <ArrowUp size={14} />
                                        </button>
                                        <button onClick={() => handleMove(index, 'down')} disabled={index === centers.length - 1} className={`p-1 rounded bg-gray-100 ${index === centers.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}>
                                            <ArrowDown size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3 text-text-muted">{index + 1}</td>
                                <td className="p-3">
                                    {center.imageUrl ? (
                                        <img src={center.imageUrl.startsWith('http') ? center.imageUrl : `${ASSETS_BASE_URL}/${center.imageUrl.replace(/^\//, '')}`} alt={center.title} className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200" onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Img' }} />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">N/A</div>
                                    )}
                                </td>
                                <td className="p-3 font-bold text-secondary">
                                    {center.title}
                                    <span className="block text-xs font-normal text-text-muted mt-1 font-mono">{center.slug}</span>
                                </td>
                                <td className="p-3 text-sm text-text-main max-w-xs truncate" title={center.excerpt}>
                                    {center.excerpt || <span className="text-gray-400 italic">No excerpt</span>}
                                </td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleToggleActive(center.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 transition-colors ${center.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        {center.isActive ? <><Shield size={12} /> Active</> : <><ShieldAlert size={12} /> Draft</>}
                                    </button>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setViewingCenter(center)} className="p-2 text-text-muted hover:text-primary transition-colors tooltip" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleOpenModal(center)} className="p-2 text-text-muted hover:text-primary transition-colors tooltip" title="Edit Center">
                                            <Edit2 size={18} />
                                        </button>
                                        {(center.routeUrl || center.slug) && (
                                            <a href={center.isExternal ? center.routeUrl : `/#`} target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-accent transition-colors tooltip" title="Preview Public Link">
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
            {viewingCenter && (
                <AdminModal isOpen={true} onClose={handleCloseModal} title={`Viewing: ${viewingCenter.title}`}>
                    <div className="space-y-4 text-sm text-text-main">
                        <div><strong className="block text-secondary">Title:</strong> {viewingCenter.title}</div>
                        <div><strong className="block text-secondary">Slug:</strong> <span className="font-mono bg-gray-100 px-1">{viewingCenter.slug}</span></div>
                        <div><strong className="block text-secondary">Excerpt:</strong> <div className="p-2 bg-gray-50 border rounded mt-1">{viewingCenter.excerpt}</div></div>
                        <div><strong className="block text-secondary">Image URL:</strong> {viewingCenter.imageUrl ? <span className="text-blue-600 underline">{viewingCenter.imageUrl}</span> : 'None'}</div>
                        <div><strong className="block text-secondary">Link Details:</strong>
                            {viewingCenter.isExternal ? ' External URL' : ' Internal Route'} | {viewingCenter.openInNewTab ? 'Opens in New Tab' : 'Same Tab'}
                            <br /><span className="font-mono text-xs">{viewingCenter.routeUrl}</span>
                        </div>
                        <div><strong className="block text-secondary">Display Order:</strong> {viewingCenter.displayOrder}</div>
                        <div><strong className="block text-secondary">Status:</strong> {viewingCenter.isActive ? 'Active' : 'Draft'}</div>
                    </div>
                </AdminModal>
            )}

            {/* Edit / Create Modal */}
            <AdminModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCenter ? 'Edit Research Center' : 'Add New Research Center'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-text-main font-bold mb-1">Center Title *</label>
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
                            Save Center
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
