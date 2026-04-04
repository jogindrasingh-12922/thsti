import { useState, useEffect, useRef } from 'react';
import { PUBLIC_SITE_URL } from '../config/env';
import { Edit2, Save, X, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';

const SECTION_TYPES = ['HERO', 'ABOUT', 'SERVICES', 'NEWS', 'GALLERY', 'CONTACT', 'LIFE_AT_THSTI'];

export default function HomeSections() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: '',
        isActive: true,
        metadata: ''
    });

    const defaultCounters = [
        { key: 'students', label: '', value: 0, suffix: '+' },
        { key: 'faculty', label: '', value: 0, suffix: '+' },
        { key: 'eep_participants', label: '', value: 0, suffix: '+' },
        { key: 'eep_days', label: '', value: 0, suffix: '+' }
    ];
    const [counters, setCounters] = useState(defaultCounters);
    const [allowSlider, setAllowSlider] = useState(true);

    const fetchSections = async () => {
        try {
            const res = await api.get('/home-sections');
            setSections(res.data);
        } catch (err) {
            console.error('Failed to fetch home sections', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const startEdit = (type) => {
        const existing = sections.find(s => s.sectionType === type);
        setEditingSection(type);
        if (existing) {
            setFormData({
                title: existing.title || '',
                subtitle: existing.subtitle || '',
                description: existing.description || '',
                imageUrl: existing.imageUrl || '',
                ctaText: existing.ctaText || '',
                ctaLink: existing.ctaLink || '',
                isActive: existing.isActive,
                metadata: existing.metadata ? (type !== 'ABOUT' ? JSON.stringify(existing.metadata, null, 2) : '') : ''
            });

            if (type === 'ABOUT' && existing.metadata) {
                if (Array.isArray(existing.metadata)) {
                    setCounters(existing.metadata);
                    setAllowSlider(false);
                } else if (existing.metadata.counters) {
                    setCounters(existing.metadata.counters);
                    setAllowSlider(existing.metadata.allowSlider ?? false);
                } else {
                    setCounters(defaultCounters);
                    setAllowSlider(false);
                }
            } else {
                setCounters(defaultCounters);
                setAllowSlider(false);
            }
        } else {
            setFormData({
                title: '', subtitle: '', description: '', imageUrl: '', ctaText: '', ctaLink: '', isActive: true, metadata: ''
            });
            setCounters(defaultCounters);
            setAllowSlider(true);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSection(null);
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCounterChange = (index, field, value) => {
        setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = {
                ...newCounters[index],
                [field]: field === 'value' ? (parseFloat(value) || 0) : value
            };
            return newCounters;
        });
    };

    const addCounter = () => {
        setCounters(prev => [...prev, { key: `COUNTER_${Date.now()}`, label: '', value: 0, suffix: '+' }]);
    };

    const removeCounter = (index) => {
        setCounters(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/media/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let parsedMetadata = null;
            if (editingSection === 'ABOUT') {
                parsedMetadata = { allowSlider, counters };
            } else if (formData.metadata.trim()) {
                try {
                    parsedMetadata = JSON.parse(formData.metadata);
                } catch (e) {
                    alert('Invalid JSON in Metadata field');
                    return;
                }
            }

            const payload = {
                ...formData,
                metadata: parsedMetadata
            };

            await api.put(`/home-sections/${editingSection}`, payload);
            handleCloseModal();
            fetchSections();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save section');
        }
    };

    if (loading) return <div>Loading home sections...</div>;

    return (
        <AdminPageLayout title="Home Sections Management">
            <div className="admin-card min-h-0 bg-transparent shadow-none border-none p-0 flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                    {SECTION_TYPES.map(type => {
                        const existing = sections.find(s => s.sectionType === type);
                        return (
                            <div key={type} className="admin-card p-6 bg-white border border-border-light flex flex-col items-center justify-center h-48 text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-border-light group-hover:bg-primary transition-colors"></div>
                                <h3 className="text-xl font-bold text-secondary mb-2 uppercase tracking-widest">{type}</h3>
                                {existing ? (
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full mb-4 ${existing.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {existing.isActive ? 'ACTIVE' : 'DRAFT'}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 text-xs font-bold rounded-full mb-4 bg-gray-100 text-gray-500 border border-gray-200">NOT CONFIGURED</span>
                                )}
                                <button onClick={() => startEdit(type)} className="admin-btn-secondary flex items-center gap-2 mt-auto text-sm px-6">
                                    <Edit2 size={16} /> Configure
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={`Editing ${editingSection} Section`}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Title</label>
                            <input type="text" name="title" className="admin-input" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Subtitle</label>
                            <input type="text" name="subtitle" className="admin-input" value={formData.subtitle} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Description (Markdown / HTML)</label>
                            <textarea name="description" className="admin-input h-32" value={formData.description} onChange={handleChange} />
                        </div>

                        {/* Image Upload Row */}
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Background / Main Image</label>
                            <div className="flex gap-4 items-center">
                                <input type="text" name="imageUrl" className="admin-input flex-1 bg-gray-50" value={formData.imageUrl} readOnly placeholder="Upload an image to generate URL..." />
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="admin-btn-secondary flex items-center gap-2 whitespace-nowrap">
                                    <ImageIcon size={16} />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                            </div>
                            {formData.imageUrl && (
                                <div className="mt-2 text-sm text-green-600 font-bold flex items-center gap-1">
                                    ✓ Image attached ({formData.imageUrl.split('/').pop()})
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-text-main font-bold mb-1">CTA Button Text</label>
                            <input type="text" name="ctaText" className="admin-input" value={formData.ctaText} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">CTA Link URL</label>
                            <input type="text" name="ctaLink" className="admin-input" value={formData.ctaLink} onChange={handleChange} />
                        </div>

                        {editingSection !== 'ABOUT' && (
                            <div className="md:col-span-2">
                                <label className="block text-text-main font-bold mb-1">
                                    Metadata (JSON) <span className="text-xs text-text-muted font-normal block">Use this for nested items like service cards or metrics. Must be valid JSON array/object.</span>
                                </label>
                                <textarea name="metadata" className="admin-input font-mono text-sm h-32" value={formData.metadata} onChange={handleChange} placeholder='[{"title": "Card 1", "icon": "fa-user"}]' />
                            </div>
                        )}

                        {editingSection === 'ABOUT' && (
                            <div className="md:col-span-2 border-t border-border-light pt-4 mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-text-main font-bold">Counters Configuration</label>
                                    <button type="button" onClick={addCounter} className="text-primary hover:text-green-700 flex items-center gap-1 text-sm font-bold bg-green-50 px-2 py-1 rounded">
                                        <Plus size={16} /> Add Counter
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {counters.map((counter, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 border border-border-light rounded relative group">
                                            <div className="col-span-12 md:col-span-3 flex items-center">
                                                <button type="button" onClick={() => removeCounter(idx)} className="text-red-400 hover:text-red-600 mr-2" title="Remove Counter">
                                                    <Trash2 size={16} />
                                                </button>
                                                <input type="text" className="admin-input text-xs font-mono font-bold uppercase text-gray-500 py-1.5" value={counter.key} onChange={(e) => handleCounterChange(idx, 'key', e.target.value.toUpperCase().replace(/\s/g, '_'))} placeholder="KEY" />
                                            </div>
                                            <div className="col-span-12 md:col-span-5">
                                                <input type="text" className="admin-input text-sm py-1.5" value={counter.label} onChange={(e) => handleCounterChange(idx, 'label', e.target.value)} placeholder="Label (e.g. STUDENTS)" />
                                            </div>
                                            <div className="col-span-6 md:col-span-2">
                                                <input type="number" min="0" className="admin-input text-sm py-1.5" value={counter.value} onChange={(e) => handleCounterChange(idx, 'value', e.target.value)} placeholder="0" />
                                            </div>
                                            <div className="col-span-6 md:col-span-2">
                                                <input type="text" className="admin-input text-sm py-1.5" value={counter.suffix} onChange={(e) => handleCounterChange(idx, 'suffix', e.target.value)} placeholder="Suffix (e.g. +)" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2 flex items-center mt-2">
                            <label className="flex items-center gap-3 cursor-pointer bg-bg-light p-3 rounded border border-border-light hover:bg-gray-100 pr-4 w-full">
                                <input type="checkbox" name="isActive" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={formData.isActive} onChange={handleChange} />
                                <span className="font-bold text-text-dark text-sm">Publish Section (Active)</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border-light flex justify-between items-center mt-6">
                        <span className="text-sm text-text-muted italic">Warning: Zod Metadata validation is strictly enforced on save.</span>
                        <div className="flex gap-4">
                            {editingSection === 'ABOUT' && (
                                <a href={`${PUBLIC_SITE_URL}/#about-intro`} target="_blank" rel="noopener noreferrer" className="admin-btn-secondary flex items-center justify-center gap-2 py-2">
                                    Preview
                                </a>
                            )}
                            <button type="submit" className="admin-btn-primary flex items-center justify-center gap-2 min-w-[150px] py-2">
                                <Save size={18} /> Save Section
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
