import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2, GripVertical, Check, X, FileVideo, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HeroSlides() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [mediaList, setMediaList] = useState([]);

    // Advanced Media States
    const [mediaOpt, setMediaOpt] = useState('LIBRARY'); // LIBRARY, UPLOAD, URL
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaCustomUrl, setMediaCustomUrl] = useState('');

    const [posterOpt, setPosterOpt] = useState('LIBRARY');
    const [posterFile, setPosterFile] = useState(null);
    const [posterCustomUrl, setPosterCustomUrl] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        type: 'IMAGE',
        mediaUrl: '',
        posterUrl: '',
        isActiveVideo: false,
        isActive: true,
        openInNewTab: false,
        routeUrl: '',
        showText: true
    });

    useEffect(() => {
        fetchSlides();
        fetchMedia();
    }, []);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const res = await api.get('/hero-slides/all');
            setSlides(res.data);
        } catch (error) {
            toast.error("Failed to fetch slides");
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
        const items = Array.from(slides);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({ ...item, displayOrder: index }));
        setSlides(updatedItems);

        try {
            await api.patch('/hero-slides/reorder', {
                items: updatedItems.map(item => ({ id: item.id, order: item.displayOrder }))
            });
            toast.success("Order saved");
        } catch (error) {
            toast.error("Failed to save order");
            fetchSlides();
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleFileUpload = async (file) => {
        const payload = new FormData();
        payload.append('file', file);
        const res = await api.post('/media/upload', payload, { headers: { 'Content-Type': 'multipart/form-data' }});
        return res.data.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            let finalMedia = formData.mediaUrl;
            let finalPoster = formData.posterUrl;

            if (mediaOpt === 'UPLOAD' && mediaFile) {
                finalMedia = await handleFileUpload(mediaFile);
            } else if (mediaOpt === 'URL') {
                finalMedia = mediaCustomUrl;
            }

            if (formData.type === 'VIDEO') {
                if (posterOpt === 'UPLOAD' && posterFile) {
                    finalPoster = await handleFileUpload(posterFile);
                } else if (posterOpt === 'URL') {
                    finalPoster = posterCustomUrl;
                }
            } else {
                finalPoster = ''; 
            }

            if (!finalMedia) {
                toast.error("Media source is required");
                return;
            }

            const payload = { ...formData, mediaUrl: finalMedia, posterUrl: finalPoster };

            if (editingSlide) {
                await api.put(`/hero-slides/${editingSlide.id}`, payload);
                toast.success("Slide updated");
            } else {
                await api.post('/hero-slides', { ...payload, displayOrder: slides.length });
                toast.success("Slide created");
            }
            setIsModalOpen(false);
            fetchSlides();
            fetchMedia();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save slide");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slide?")) return;
        try {
            await api.delete(`/hero-slides/${id}`);
            toast.success("Slide deleted");
            fetchSlides();
        } catch (error) {
            toast.error("Failed to delete slide");
        }
    };

    const toggleStatus = async (id) => {
        try {
            await api.patch(`/hero-slides/${id}/toggle-active`);
            toast.success("Status updated");
            fetchSlides();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const openModal = (slide = null) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData({
                title: slide.title || '',
                subtitle: slide.subtitle || '',
                type: slide.type || 'IMAGE',
                mediaUrl: slide.mediaUrl || '',
                posterUrl: slide.posterUrl || '',
                isActiveVideo: slide.isActiveVideo || false,
                isActive: slide.isActive ?? true,
                openInNewTab: slide.openInNewTab || false,
                routeUrl: slide.routeUrl || '',
                showText: slide.showText ?? true
            });
            const isMediaLibrary = mediaList.some(m => m.url === slide.mediaUrl);
            setMediaOpt(slide.mediaUrl && !isMediaLibrary ? 'URL' : 'LIBRARY');
            setMediaCustomUrl(slide.mediaUrl || '');
            setMediaFile(null);

            const isPosterLibrary = mediaList.some(m => m.url === slide.posterUrl);
            setPosterOpt(slide.posterUrl && !isPosterLibrary ? 'URL' : 'LIBRARY');
            setPosterCustomUrl(slide.posterUrl || '');
            setPosterFile(null);
        } else {
            setEditingSlide(null);
            setFormData({
                title: '', subtitle: '', type: 'IMAGE', mediaUrl: '', posterUrl: '',
                isActiveVideo: false, isActive: true, openInNewTab: false, routeUrl: '', showText: true
            });
            setMediaOpt('LIBRARY');
            setMediaCustomUrl('');
            setMediaFile(null);

            setPosterOpt('LIBRARY');
            setPosterCustomUrl('');
            setPosterFile(null);
        }
        setIsModalOpen(true);
    };

    return (
        <AdminPageLayout
            title="Hero Slider"
            subtitle="Manage image and video slides for the homepage"
            actionButtons={
                <button
                    onClick={() => openModal()}
                    className="bg-[var(--primary)] text-white px-4 py-2 rounded shadow hover:bg-red-800 transition-colors"
                >
                    + Add New Slide (Video / Image)
                </button>
            }
        >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="slidesList">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-10 px-4 py-3"></th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Video</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {slides.map((slide, index) => (
                                            <Draggable key={slide.id.toString()} draggableId={slide.id.toString()} index={index}>
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
                                                            {slide.type === 'VIDEO' ? <FileVideo className="text-blue-500" size={24} /> : <ImageIcon className="text-green-500" size={24} />}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                            {slide.mediaUrl}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {slide.isActiveVideo ?
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Active Video</span>
                                                                : <span className="text-gray-400 text-xs">-</span>
                                                            }
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <button
                                                                onClick={() => toggleStatus(slide.id)}
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slide.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                            >
                                                                {slide.isActive ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-sm">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openModal(slide)} className="text-gray-400 hover:text-blue-600">
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button onClick={() => handleDelete(slide.id)} className="text-gray-400 hover:text-red-600">
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
                title={editingSlide ? 'Edit Slide' : 'Add New Slide'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex items-end pb-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActiveVideo}
                                    onChange={(e) => setFormData({ ...formData, isActiveVideo: e.target.checked })}
                                    className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                                    disabled={formData.type !== 'VIDEO'}
                                />
                                <span className="text-sm text-gray-700">Set as Active Autoplay Video</span>
                            </label>
                        </div>
                    </div>

                    <div className="border rounded p-3 mb-4 space-y-3 bg-white">
                        <label className="block text-sm font-medium text-gray-700">Media Source (Required)</label>
                        <div className="flex space-x-4 mb-2">
                            <label className="flex items-center space-x-1 cursor-pointer">
                                <input type="radio" value="LIBRARY" checked={mediaOpt === 'LIBRARY'} onChange={() => setMediaOpt('LIBRARY')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                                <span className="text-sm">Media Library</span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                                <input type="radio" value="UPLOAD" checked={mediaOpt === 'UPLOAD'} onChange={() => setMediaOpt('UPLOAD')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                                <span className="text-sm">Upload from Device</span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                                <input type="radio" value="URL" checked={mediaOpt === 'URL'} onChange={() => setMediaOpt('URL')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                                <span className="text-sm">Drive Link / URL</span>
                            </label>
                        </div>

                        {mediaOpt === 'LIBRARY' && (
                            <select value={formData.mediaUrl} onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })} className="w-full border border-gray-300 rounded-md p-2">
                                <option value="">Select Media from Library</option>
                                {Array.from(new Map(mediaList.map(m => [m.filename, m])).values()).map(m => <option key={m.id} value={m.url}>{m.filename}</option>)}
                            </select>
                        )}
                        {mediaOpt === 'UPLOAD' && (
                            <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} className="w-full border border-gray-300 rounded-md p-2 text-sm" accept={formData.type === 'VIDEO' ? "video/*" : "image/*"} />
                        )}
                        {mediaOpt === 'URL' && (
                            <input type="text" value={mediaCustomUrl} onChange={(e) => setMediaCustomUrl(e.target.value)} placeholder="Enter Google Drive link or direct URL" className="w-full border border-gray-300 rounded-md p-2" />
                        )}
                    </div>

                    {formData.type === 'VIDEO' && (
                        <div className="border rounded p-3 mb-4 space-y-3 bg-gray-50">
                            <label className="block text-sm font-medium text-gray-700">Fallback Poster Image (Required for Video)</label>
                            <div className="flex space-x-4 mb-2">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input type="radio" value="LIBRARY" checked={posterOpt === 'LIBRARY'} onChange={() => setPosterOpt('LIBRARY')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                                    <span className="text-sm">Media Library</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input type="radio" value="UPLOAD" checked={posterOpt === 'UPLOAD'} onChange={() => setPosterOpt('UPLOAD')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                                    <span className="text-sm">Upload from Device</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input type="radio" value="URL" checked={posterOpt === 'URL'} onChange={() => setPosterOpt('URL')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                                    <span className="text-sm">Drive Link / URL</span>
                                </label>
                            </div>

                            {posterOpt === 'LIBRARY' && (
                                <select value={formData.posterUrl} onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })} className="w-full border border-gray-300 rounded-md p-2">
                                    <option value="">Select Poster from Library</option>
                                    {Array.from(new Map(mediaList.map(m => [m.filename, m])).values()).map(m => <option key={m.id} value={m.url}>{m.filename}</option>)}
                                </select>
                            )}
                            {posterOpt === 'UPLOAD' && (
                                <input type="file" onChange={(e) => setPosterFile(e.target.files[0])} className="w-full border border-gray-300 rounded-md p-2 text-sm" accept="image/*" />
                            )}
                            {posterOpt === 'URL' && (
                                <input type="text" value={posterCustomUrl} onChange={(e) => setPosterCustomUrl(e.target.value)} placeholder="Enter direct Image URL" className="w-full border border-gray-300 rounded-md p-2" />
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Route / Link URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.routeUrl}
                            onChange={(e) => setFormData({ ...formData, routeUrl: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="e.g. /about or https://google.com"
                        />
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
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.showText}
                                onChange={(e) => setFormData({ ...formData, showText: e.target.checked })}
                                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-gray-700">Show Text on Slide</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSaving}
                            className={`mr-2 px-4 py-2 text-gray-600 hover:text-gray-800 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-4 py-2 bg-[var(--primary)] text-white rounded shadow hover:bg-red-800 flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isSaving ? 'Uploading & Saving...' : (editingSlide ? 'Update Slide' : 'Create Slide')}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminPageLayout>
    );
}
