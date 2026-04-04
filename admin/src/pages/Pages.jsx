import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, FileText, Search, Filter } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function Pages() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        ogImage: '',
        isActive: true
    });

    const fetchPages = async () => {
        try {
            const res = await api.get('/pages');
            setPages(res.data);
        } catch (err) {
            console.error('Failed to fetch pages', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGenerateSlug = () => {
        if (!formData.title) return;
        const generated = formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, slug: generated }));
    };

    const startEdit = (page) => {
        setEditingPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            metaTitle: page.metaTitle || '',
            metaDescription: page.metaDescription || '',
            ogImage: page.ogImage || '',
            isActive: page.isActive
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingPage(null);
        setFormData({ title: '', slug: '', content: '', metaTitle: '', metaDescription: '', ogImage: '', isActive: true });
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPage) {
                await api.put(`/pages/${editingPage.id}`, formData);
            } else {
                await api.post('/pages', formData);
            }
            resetForm();
            fetchPages();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save page');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this page?')) {
            try {
                await api.delete(`/pages/${id}`);
                fetchPages();
            } catch (err) {
                alert('Failed to delete page');
            }
        }
    };

    if (loading) return <div>Loading pages...</div>;

    const filteredPages = pages.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              page.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' 
                              ? true 
                              : statusFilter === 'published' ? page.isActive === true : page.isActive === false;
        return matchesSearch && matchesStatus;
    });

    const actionButtons = (
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="admin-btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Page
        </button>
    );

    return (
        <AdminPageLayout title="Pages Builder" actionButtons={actionButtons}>
            {/* Content Area (Full Width) */}
            <div className="admin-card overflow-hidden flex flex-col flex-1 min-h-0 bg-white">
                <div className="p-4 border-b border-border-light bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by page title or slug..." 
                            className="w-full pl-10 pr-4 py-2 border border-border-light rounded focus:outline-none focus:border-red-800"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="text-gray-500" size={18} />
                        <select 
                            className="bg-white border border-border-light rounded py-2 px-3 focus:outline-none focus:border-red-800 min-w-[150px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="unpublished">Unpublished</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-auto flex-1 p-6">
                    {filteredPages.length === 0 ? (
                        <div className="text-center py-12 text-text-muted">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-bold">No pages found.</p>
                            <p className="text-sm">Click "New Page" or adjust your search filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredPages.map(page => (
                                <div key={page.id} className="border border-border-light rounded-lg p-5 hover:shadow-md transition-shadow bg-bg-light relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-secondary flex items-center gap-2 text-lg">
                                                <FileText size={18} className="text-primary" />
                                                {page.title}
                                            </h4>
                                            <p className="text-sm text-text-muted font-mono mt-1">/{page.slug}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${page.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {page.isActive ? 'PUBLISHED' : 'DRAFT'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-border-light pt-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => window.open(`/Info/${page.slug}`, '_blank')} className="p-2 text-text-muted hover:text-accent bg-white border border-border-light rounded shadow-sm transition-colors" title="View Published Page">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </button>
                                        <button onClick={() => startEdit(page)} className="p-2 text-text-muted hover:text-accent bg-white border border-border-light rounded shadow-sm transition-colors" title="Edit Page">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(page.id)} className="p-2 text-text-muted hover:text-primary bg-white border border-border-light rounded shadow-sm transition-colors" title="Delete Page">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingPage ? 'Edit Page' : 'Create New Page'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Page Title <span className="text-primary">*</span></label>
                            <input type="text" name="title" className="admin-input text-lg" value={formData.title} onChange={handleChange} required placeholder="e.g. Terms of Service" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">URL Slug <span className="text-primary">*</span></label>
                            <div className="flex gap-2">
                                <span className="admin-input flex-initial w-auto bg-gray-100 text-gray-500 rounded-r-none border-r-0 px-4 flex items-center">/Info/</span>
                                <input type="text" name="slug" className="admin-input font-mono flex-1 rounded-l-none" value={formData.slug} onChange={handleChange} required placeholder="terms-of-service" />
                                <button type="button" onClick={handleGenerateSlug} className="px-4 border border-border-light font-bold text-secondary hover:bg-gray-100 rounded transition-colors text-sm">Generate</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-text-main font-bold mb-1">Page Content (HTML support) <span className="text-primary">*</span></label>
                        <textarea name="content" className="admin-input h-[300px] font-mono text-sm leading-relaxed" value={formData.content} onChange={handleChange} required placeholder="<div><h1>Heading</h1><p>Content...</p></div>" />
                    </div>

                    <div className="border-t border-border-light pt-4 mt-6">
                        <h4 className="font-bold text-secondary mb-3">SEO & Metadata</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-text-main font-bold mb-1 text-sm">Meta Title</label>
                                <input type="text" name="metaTitle" className="admin-input" value={formData.metaTitle} onChange={handleChange} placeholder="Overrides default page title" />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1 text-sm">OG Image URL</label>
                                <input type="text" name="ogImage" className="admin-input" value={formData.ogImage} onChange={handleChange} placeholder="Image for social sharing (https://...)" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-text-main font-bold mb-1 text-sm">Meta Description</label>
                                <textarea name="metaDescription" className="admin-input h-20" value={formData.metaDescription} onChange={handleChange} placeholder="Search engine description" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border-light pt-4 mt-4">
                        <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 rounded border border-border-light hover:bg-gray-100 pr-4">
                            <input type="checkbox" name="isActive" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.isActive} onChange={handleChange} />
                            <span className="font-bold text-text-dark text-sm">Publish Page (Active)</span>
                        </label>
                        <div className="flex gap-4">
                            <button type="submit" className="admin-btn-primary flex items-center justify-center gap-2 min-w-[150px] py-2">
                                <Save size={18} /> {editingPage ? 'Save Changes' : 'Create Page'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors uppercase tracking-wide">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
