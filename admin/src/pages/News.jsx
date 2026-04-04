import { useState, useEffect } from 'react';
import { PUBLIC_SITE_URL } from '../config/env';
import { Plus, Edit2, Trash2, Save, Newspaper, ExternalLink, Eye, Star } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNews, setEditingNews] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        imageUrl: '',
        publishDate: new Date().toISOString().split('T')[0],
        isActive: true,
        isFeatured: false
    });

    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            setNews(res.data);
        } catch (err) {
            console.error('Failed to fetch news', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            if (name === 'title' && !editingNews) {
                updated.slug = value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
            }
            return updated;
        });
    };

    const handleGenerateSlug = () => {
        if (!formData.title) return;
        const generated = formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, slug: generated }));
    };
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const startEdit = (item) => {
        setEditingNews(item);
        setImageFile(null);
        setFormData({
            title: item.title,
            slug: item.slug,
            summary: item.summary || '',
            content: item.content,
            imageUrl: item.imageUrl || '',
            publishDate: new Date(item.publishDate).toISOString().split('T')[0],
            isActive: item.isActive,
            isFeatured: !!item.isFeatured
        });
        setIsModalOpen(true);
    };

    const handleOpenNew = () => {
        setEditingNews(null);
        setImageFile(null);
        setFormData({
            title: '', slug: '', summary: '', content: '', imageUrl: '',
            publishDate: new Date().toISOString().split('T')[0], isActive: true, isFeatured: false
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNews(null);
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
                imageUrl: uploadedImageUrl,
                publishDate: new Date(formData.publishDate).toISOString()
            };

            if (editingNews) {
                await api.put(`/news/${editingNews.id}`, payload);
            } else {
                await api.post('/news', payload);
            }
            handleCloseModal();
            fetchNews();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save news');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this news item?')) {
            try {
                await api.delete(`/news/${id}`);
                fetchNews();
            } catch (err) {
                alert('Failed to delete news');
            }
        }
    };

    if (loading) return <div>Loading news...</div>;

    const actionButtons = (
        <button onClick={handleOpenNew} className="admin-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> New Event
        </button>
    );

    return (
        <AdminPageLayout title="News Manager" actionButtons={actionButtons}>
            <div className="admin-card overflow-hidden flex flex-col flex-1 min-h-0 bg-white shadow-sm border border-border-light">
                <div className="overflow-auto flex-1 p-6">
                    {news.length === 0 ? (
                        <div className="text-center text-text-muted italic py-12 border-2 border-dashed border-border-light rounded-lg">
                            <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>No news items found.</p>
                            <button onClick={handleOpenNew} className="mt-4 text-primary font-bold hover:underline">Create your first news item</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map(item => (
                                <div key={item.id} className="admin-card p-5 border border-border-light shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col relative">
                                    {item.isFeatured && (
                                        <div className="absolute top-2 right-2 bg-[var(--primary)] text-white p-1 rounded-full shadow-sm" title="Featured Event (Shows as main item)">
                                            <Star size={14} />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-secondary text-lg leading-snug line-clamp-2">
                                            {item.title}
                                        </h4>
                                    </div>
                                    <div className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">
                                        {item.summary || 'No summary provided.'}
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-auto pt-4 border-t border-border-light">
                                        <span className="text-text-muted font-medium flex items-center gap-1">
                                            <Newspaper size={14} />
                                            {new Date(item.publishDate).toLocaleDateString()}
                                        </span>
                                        <span className={`px-2 py-1 font-bold rounded-full ${item.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                            {item.isActive ? 'PUBLISHED' : 'DRAFT'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border-light">
                                        <a href={`${PUBLIC_SITE_URL}/news/${item.slug}`} target="_blank" rel="noreferrer" title="Preview Public Page" className="p-2 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                                            <ExternalLink size={16} />
                                        </a>
                                        <button onClick={() => startEdit(item)} title="Edit News" className="p-2 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} title="Delete News" className="p-2 text-text-muted hover:text-primary bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingNews ? 'Edit News Item' : 'Create News Item'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Article Title *</label>
                            <input type="text" name="title" className="admin-input" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">URL Slug *</label>
                            <div className="flex gap-2">
                                <input type="text" name="slug" className="admin-input font-mono flex-1 text-sm" value={formData.slug} onChange={handleChange} required />
                                <button type="button" onClick={handleGenerateSlug} className="admin-btn-secondary text-sm px-3">Sync</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Publish Date *</label>
                            <input type="date" name="publishDate" className="admin-input" value={formData.publishDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-text-main font-bold mb-1">Featured Image</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <input type="file" accept="image/*" onChange={handleImageChange} className="admin-input p-1" />
                            </div>
                            {(imageFile || formData.imageUrl) && (
                                <div className="h-16 w-24 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                                    {imageFile ? (
                                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <img src={`${PUBLIC_SITE_URL}${formData.imageUrl}`} alt="Existing" className="h-full w-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1">Select a new image to upload. If editing, leave empty to keep the existing image.</p>
                    </div>

                    <div>
                        <label className="block text-text-main font-bold mb-1">Summary (Short Excerpt)</label>
                        <textarea name="summary" className="admin-input h-20" value={formData.summary} onChange={handleChange} placeholder="Appears on homepage news cards" />
                    </div>

                    <div>
                        <label className="block text-text-main font-bold mb-1">Full Content (HTML) *</label>
                        <textarea name="content" className="admin-input h-48 font-mono text-sm" value={formData.content} onChange={handleChange} required />
                    </div>

                    <div className="flex items-center justify-between border-t border-border-light pt-4 mt-6">
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-3 cursor-pointer bg-bg-light p-3 rounded border border-border-light hover:bg-gray-100 pr-4">
                                <input type="checkbox" name="isActive" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.isActive} onChange={handleChange} />
                                <span className="font-bold text-text-dark text-sm">Publish Immediately</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-yellow-50 pr-4">
                                <input type="checkbox" name="isFeatured" className="w-5 h-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500" checked={formData.isFeatured} onChange={handleChange} />
                                <span className="font-bold text-yellow-800 text-sm flex items-center gap-1"><Star size={14} /> Mark as Main Featured News</span>
                            </label>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="admin-btn-primary flex items-center justify-center gap-2 min-w-[150px] py-2">
                                <Save size={18} /> {editingNews ? 'Save Changes' : 'Create Event'}
                            </button>
                            <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors uppercase tracking-wide">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
