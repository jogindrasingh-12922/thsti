import { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../config/env';
import { Trash2, Copy, FileText, Download, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';

export default function MediaLibrary() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMedia = async () => {
        try {
            const res = await api.get('/media');
            setMedia(res.data);
        } catch (err) {
            console.error('Failed to fetch media', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Delete this file permanently? Any pages using this URL will break.')) {
            try {
                await api.delete(`/media/${id}`);
                fetchMedia();
            } catch (err) {
                alert('Failed to delete media');
            }
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('URL copied to clipboard!');
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = (mimeType) => mimeType.startsWith('image/');

    if (loading) return <div>Loading library...</div>;

    const actionButtons = (
        <div className="text-sm text-text-muted bg-white px-4 py-2 rounded border border-border-light shadow-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Total Files: {media.length}
        </div>
    );

    return (
        <AdminPageLayout title="Media Library" actionButtons={actionButtons}>
            <div className="admin-card min-h-0 bg-transparent shadow-none border-none p-0 flex-1 overflow-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-6">
                    {media.map(file => (
                        <div key={file.id} className="admin-card bg-white overflow-hidden flex flex-col hover:shadow-md transition-all group">
                            <div className="h-40 bg-gray-100 flex items-center justify-center relative border-b border-border-light">
                                {isImage(file.mimeType) ? (
                                    <img src={`${ASSETS_BASE_URL}${file.url}`} alt={file.filename} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center">
                                        <FileText size={48} />
                                        <span className="text-xs mt-2 uppercase font-bold">{file.mimeType.split('/')[1]}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button onClick={() => window.open(`${ASSETS_BASE_URL}${file.url}`, '_blank')} className="p-2 bg-white text-gray-800 hover:text-accent rounded-full transition-colors" title="View/Download">
                                        <Download size={18} />
                                    </button>
                                    <button onClick={() => copyToClipboard(file.url)} className="p-2 bg-white text-gray-800 hover:text-accent rounded-full transition-colors" title="Copy URL Path">
                                        <Copy size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(file.id)} className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete Permanently">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-secondary text-sm truncate" title={file.filename}>{file.filename}</h4>
                                <div className="flex justify-between items-center mt-1 text-xs text-text-muted">
                                    <span>{formatSize(file.size)}</span>
                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {media.length === 0 && (
                        <div className="col-span-full p-12 text-center text-text-muted admin-card bg-white border-dashed border-2 flex flex-col items-center justify-center">
                            <ImageIcon size={48} className="text-gray-300 mb-4" />
                            <p className="font-bold text-lg text-secondary">No files uploaded yet.</p>
                            <p className="text-sm mt-1">Files uploaded via Home Sections or News will appear here automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminPageLayout>
    );
}
