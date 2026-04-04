import { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../config/env';
import { Plus, Edit2, Trash2, Save, ExternalLink, Image, GraduationCap } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

export default function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const initialFormData = {
        name: '', slug: '', designation: '', department: '', location: '',
        office: '', email: '', phone: '', cvUrl: '', labWebsiteUrl: '', orcid: '',
        googleScholarUrl: '', researchGateUrl: '', linkedinUrl: '', researchFocus: '', educationSnippet: '',
        publicationsCount: 0, citationsCount: 0, hIndex: 0, patentsCount: 0, projectsCount: 0,
        overviewContent: '', educationContent: '', researchContent: '', publicationsContent: '',
        booksContent: '', patentsContent: '', awardsContent: '',
        imageUrl: '', displayOrder: 0, isActive: true
    };

    const [formData, setFormData] = useState(initialFormData);

    const fetchFaculty = async () => {
        try {
            const res = await api.get('/faculty');
            setFaculty(res.data);
        } catch (err) {
            console.error('Failed to fetch faculty', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            };
            if (name === 'name' && !editingFaculty) {
                updated.slug = value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
            }
            return updated;
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const startEdit = (item) => {
        setEditingFaculty(item);
        setImageFile(null);
        setFormData({
            ...initialFormData,
            ...item
        });
        setIsModalOpen(true);
    };

    const handleOpenNew = () => {
        setEditingFaculty(null);
        setImageFile(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFaculty(null);
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let uploadedImageUrl = formData.imageUrl;
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);
                uploadData.append('altText', formData.name);
                uploadData.append('categoryId', '1');
                const uploadRes = await api.post('/media/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.url;
            }

            const payload = { ...formData, imageUrl: uploadedImageUrl };

            if (editingFaculty) {
                await api.put(`/faculty/${editingFaculty.id}`, payload);
            } else {
                await api.post('/faculty', payload);
            }
            handleCloseModal();
            fetchFaculty();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save faculty member');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                await api.delete(`/faculty/${id}`);
                fetchFaculty();
            } catch (err) {
                alert('Failed to delete faculty member');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    const actionButtons = (
        <button onClick={handleOpenNew} className="admin-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> Add Faculty
        </button>
    );

    return (
        <AdminPageLayout title="Faculty Members" actionButtons={actionButtons}>
            <div className="admin-card overflow-hidden flex flex-col flex-1 min-h-0 bg-white shadow-sm border border-border-light">
                <div className="overflow-auto flex-1 p-6">
                    {faculty.length === 0 ? (
                        <div className="text-center text-text-muted italic py-12 border-2 border-dashed border-border-light rounded-lg">
                            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>No faculty members found.</p>
                            <button onClick={handleOpenNew} className="mt-4 text-primary font-bold hover:underline">Add first faculty member</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {faculty.map(item => (
                                <div key={item.id} className="admin-card p-5 border border-border-light shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col relative">
                                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                            {item.imageUrl ? (
                                                <img src={`${ASSETS_BASE_URL}${item.imageUrl}`} className="h-full w-full object-cover" alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = '' }} />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xl">{item.name.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-secondary text-base leading-tight truncate">{item.name}</h4>
                                            <p className="text-xs text-primary font-medium truncate mt-1">{item.designation || 'No Designation'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-text-muted mb-4 flex-1">
                                        <div className="truncate"><span className="font-semibold text-gray-700">Dept:</span> {item.department || '-'}</div>
                                        <div className="truncate"><span className="font-semibold text-gray-700">Email:</span> {item.email || '-'}</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs pt-4 border-t border-border-light mt-auto">
                                        <span className={`px-2 py-1 font-bold rounded-full ${item.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEdit(item)} title="Edit" className="p-1.5 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} title="Delete" className="p-1.5 text-text-muted hover:text-primary bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
                title={editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
                size="xl" // using a very large modal to fit all fields comfortably
            >
                <form onSubmit={handleSubmit} className="space-y-6 h-[80vh] overflow-y-auto px-2 custom-scrollbar">
                    
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-text-main font-bold mb-1">Full Name *</label>
                                <input type="text" name="name" className="admin-input" value={formData.name || ''} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">URL Slug</label>
                                <input type="text" name="slug" className="admin-input" value={formData.slug || ''} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Designation</label>
                                <input type="text" name="designation" className="admin-input" value={formData.designation || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Department</label>
                                <input type="text" name="department" className="admin-input" value={formData.department || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Email</label>
                                <input type="email" name="email" className="admin-input" value={formData.email || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Phone</label>
                                <input type="text" name="phone" className="admin-input" value={formData.phone || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Office Location</label>
                                <input type="text" name="office" className="admin-input" value={formData.office || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Display Order</label>
                                <input type="number" name="displayOrder" className="admin-input" value={formData.displayOrder} onChange={handleChange} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-text-main font-bold mb-1">Profile Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="admin-input p-1" />
                                    </div>
                                    {(imageFile || formData.imageUrl) && (
                                        <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                                            {imageFile ? (
                                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={`${ASSETS_BASE_URL}${formData.imageUrl}`} alt="Existing" className="h-full w-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Academic & Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-text-main font-bold mb-1">ORCID</label>
                                <input type="text" name="orcid" className="admin-input" value={formData.orcid || ''} onChange={handleChange} placeholder="e.g. 0000-0002-XXXX-XXXX" />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Google Scholar URL</label>
                                <input type="text" name="googleScholarUrl" className="admin-input" value={formData.googleScholarUrl || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">ResearchGate URL</label>
                                <input type="text" name="researchGateUrl" className="admin-input" value={formData.researchGateUrl || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">LinkedIn URL</label>
                                <input type="text" name="linkedinUrl" className="admin-input" value={formData.linkedinUrl || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Lab Website URL</label>
                                <input type="text" name="labWebsiteUrl" className="admin-input" value={formData.labWebsiteUrl || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">CV PDF URL</label>
                                <input type="text" name="cvUrl" className="admin-input" value={formData.cvUrl || ''} onChange={handleChange} placeholder="Direct link to PDF or upload in Media Library" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Badge Info & Stats</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-text-main font-bold mb-1">Short Education Snippet & Location</label>
                                <input type="text" name="educationSnippet" className="admin-input mb-2" placeholder="e.g. Ph.D. (1999)" value={formData.educationSnippet || ''} onChange={handleChange} />
                                <input type="text" name="location" className="admin-input" placeholder="e.g. THSTI, Faridabad" value={formData.location || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Research Focus snippet</label>
                                <input type="text" name="researchFocus" className="admin-input" placeholder="e.g. Translational Immunology" value={formData.researchFocus || ''} onChange={handleChange} />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-5 gap-2 mt-2">
                                <div><label className="text-xs font-bold">Publications</label><input type="number" name="publicationsCount" className="admin-input p-1" value={formData.publicationsCount} onChange={handleChange} /></div>
                                <div><label className="text-xs font-bold">Citations</label><input type="number" name="citationsCount" className="admin-input p-1" value={formData.citationsCount} onChange={handleChange} /></div>
                                <div><label className="text-xs font-bold">H-Index</label><input type="number" name="hIndex" className="admin-input p-1" value={formData.hIndex} onChange={handleChange} /></div>
                                <div><label className="text-xs font-bold">Patents</label><input type="number" name="patentsCount" className="admin-input p-1" value={formData.patentsCount} onChange={handleChange} /></div>
                                <div><label className="text-xs font-bold">Projects</label><input type="number" name="projectsCount" className="admin-input p-1" value={formData.projectsCount} onChange={handleChange} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Profile Contents (HTML/Raw Text)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-text-main font-bold mb-1">Overview / Bio</label>
                                <textarea name="overviewContent" className="admin-input h-32 font-mono text-sm" value={formData.overviewContent || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Education details</label>
                                <textarea name="educationContent" className="admin-input h-24 font-mono text-sm" value={formData.educationContent || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Research Overview</label>
                                <textarea name="researchContent" className="admin-input h-24 font-mono text-sm" value={formData.researchContent || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Publications</label>
                                <textarea name="publicationsContent" className="admin-input h-24 font-mono text-sm" value={formData.publicationsContent || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Books & Book Chapters</label>
                                <textarea name="booksContent" className="admin-input h-24 font-mono text-sm" value={formData.booksContent || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Patents</label>
                                <textarea name="patentsContent" className="admin-input h-24 font-mono text-sm" value={formData.patentsContent || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-text-main font-bold mb-1">Awards & Honors</label>
                                <textarea name="awardsContent" className="admin-input h-24 font-mono text-sm" value={formData.awardsContent || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 mt-6 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5" />
                            <span className="font-bold">Active / Visible</span>
                        </label>
                        <div className="flex gap-4">
                            <button type="submit" className="admin-btn-primary flex items-center justify-center gap-2 px-6 py-2">
                                <Save size={18} /> {editingFaculty ? 'Save Changes' : 'Create Faculty'}
                            </button>
                            <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
