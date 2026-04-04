import { useState, useEffect } from 'react';
import { Plus, Edit2, Download, Upload, Check, X, Printer, GripVertical } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';
import AdminModal from '../components/AdminModal';
import * as xlsx from 'xlsx';

export default function TranslationLanguages() {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLang, setEditingLang] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        label: '',
        order: 0,
        isActive: true
    });
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState(null);
    const [importError, setImportError] = useState('');

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = () => {
        setLoading(true);
        setPageError('');
        api.get('/translation-languages/all')
            .then(res => setLanguages(res.data))
            .catch(err => {
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setPageError('You are not authorized to view languages. Please login again.');
                } else {
                    setPageError('Failed to load languages. Ensure backend is running.');
                }
                console.error('Failed to load languages:', err);
            })
            .finally(() => setLoading(false));
    };

    const handleOpenNew = () => {
        setEditingLang(null);
        setFormData({ code: '', label: '', order: languages.length + 1, isActive: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (lang) => {
        setEditingLang(lang);
        setFormData({ code: lang.code, label: lang.label, order: lang.order, isActive: lang.isActive });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'order') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLang) {
                await api.put(`/translation-languages/${editingLang.id}`, formData);
            } else {
                await api.post('/translation-languages', formData);
            }
            setIsModalOpen(false);
            fetchLanguages();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to save language');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.patch(`/translation-languages/${id}/toggle-active`);
            fetchLanguages();
        } catch (error) {
            console.error('Failed to toggle language', error);
        }
    };

    const moveUp = async (index) => {
        if (index === 0) return;
        const newLangs = [...languages];
        const tempOrder = newLangs[index].order;
        newLangs[index].order = newLangs[index - 1].order;
        newLangs[index - 1].order = tempOrder;

        // Swap array positions for visual update instantly
        const temp = newLangs[index];
        newLangs[index] = newLangs[index - 1];
        newLangs[index - 1] = temp;
        setLanguages(newLangs);

        await saveReorder(newLangs);
    };

    const moveDown = async (index) => {
        if (index === languages.length - 1) return;
        const newLangs = [...languages];
        const tempOrder = newLangs[index].order;
        newLangs[index].order = newLangs[index + 1].order;
        newLangs[index + 1].order = tempOrder;

        const temp = newLangs[index];
        newLangs[index] = newLangs[index + 1];
        newLangs[index + 1] = temp;
        setLanguages(newLangs);

        await saveReorder(newLangs);
    };

    const saveReorder = async (orderedLangs) => {
        try {
            const items = orderedLangs.map(l => ({ id: l.id, order: l.order }));
            await api.put('/translation-languages/reorder', items);
        } catch (error) {
            console.error('Failed to reorder', error);
            fetchLanguages(); // revert on fail
        }
    };

    // Export functionality
    const handleExportExcel = () => {
        const ws = xlsx.utils.json_to_sheet(languages.map(l => ({
            Code: l.code,
            Label: l.label,
            Order: l.order,
            IsActive: l.isActive ? 'Yes' : 'No'
        })));
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Languages");
        xlsx.writeFile(wb, "THSTI_Languages.xlsx");
    };

    const handleExportCSV = () => {
        const ws = xlsx.utils.json_to_sheet(languages.map(l => ({
            Code: l.code,
            Label: l.label,
            Order: l.order,
            IsActive: l.isActive ? 'true' : 'false'
        })));
        const csv = xlsx.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "THSTI_Languages.csv";
        link.click();
    };

    const handlePrint = () => {
        window.print();
    };

    // Import functionality
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = xlsx.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = xlsx.utils.sheet_to_json(ws);

                if (!data || data.length === 0) {
                    setImportError("File is empty or invalid format.");
                    return;
                }

                const validatedData = data.map(row => ({
                    code: row.Code || row.code,
                    label: row.Label || row.label,
                    order: parseInt(row.Order || row.order) || 0,
                    isActive: String(row.IsActive || row.isActive).toLowerCase() === 'true' || String(row.IsActive || row.isActive).toLowerCase() === 'yes',
                })).filter(r => r.code && r.label);

                if (validatedData.length === 0) {
                    setImportError("No valid rows found. Ensure columns: Code, Label, Order, IsActive exist.");
                    return;
                }

                setImportData(validatedData);
                setImportError('');
            } catch (err) {
                console.error(err);
                setImportError("Failed to parse file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImportSubmit = async () => {
        if (!importData) return;
        setImportError("Saving data...");
        try {
            // we will create sequentially to keep it simple and skip failures if possible. Or we can hit POST for each.
            for (const item of importData) {
                try {
                    await api.post('/translation-languages', item);
                } catch (e) {
                    if (e.response?.status === 400) {
                        try {
                            const existing = languages.find(l => l.code === item.code);
                            if (existing) await api.put(`/translation-languages/${existing.id}`, item);
                        } catch (err) { console.error('Failed to update existing', item.code); }
                    }
                }
            }
            setImportModalOpen(false);
            setImportData(null);
            fetchLanguages();
        } catch (error) {
            console.error(error);
            setImportError("Error occurred during import.");
        }
    };

    const actionButtons = (
        <div className="flex flex-wrap gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 border border-border-light text-text-dark hover:bg-gray-50 rounded text-sm transition-colors bg-white shadow-sm font-medium">
                <Printer size={15} /> Print
            </button>
            <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 border border-border-light text-text-dark hover:bg-gray-50 rounded text-sm transition-colors bg-white shadow-sm font-medium">
                <Upload size={15} /> Import
            </button>
            <div className="relative group inline-block">
                <button className="flex items-center gap-1 px-3 py-1.5 border border-border-light text-text-dark hover:bg-gray-50 rounded text-sm transition-colors bg-white shadow-sm font-medium">
                    <Download size={15} /> Export
                </button>
                <div className="absolute right-0 mt-1 w-32 bg-white border border-border-light rounded shadow-lg hidden group-hover:block z-10">
                    <button onClick={handleExportCSV} className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-gray-50">Export CSV</button>
                    <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-gray-50">Export Excel</button>
                </div>
            </div>
            <button onClick={handleOpenNew} className="admin-btn-primary flex items-center gap-1 px-3 py-1.5 text-sm">
                <Plus size={15} /> Add Language
            </button>
        </div>
    );

    return (
        <AdminPageLayout title="Translation Languages" subtitle="Manage dynamic dropdown language list" actionButtons={actionButtons}>
            <div className="admin-card overflow-hidden flex flex-col flex-1 min-h-0 bg-white shadow-sm border border-border-light printable-area">
                <div className="overflow-auto flex-1">
                    <table className="admin-table w-full">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="w-16">Reorder</th>
                                <th className="w-16">S.No</th>
                                <th>Label</th>
                                <th>Code</th>
                                <th className="w-24">Order</th>
                                <th className="w-24 text-center">Status</th>
                                <th className="w-32 text-right no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageError ? (
                                <tr><td colSpan="7" className="text-center py-8 text-red-600 font-bold bg-red-50">{pageError}</td></tr>
                            ) : loading ? (
                                <tr><td colSpan="7" className="text-center py-8 text-text-muted">Loading languages...</td></tr>
                            ) : languages.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-8 text-text-muted">No languages found.</td></tr>
                            ) : (
                                languages.map((lang, index) => (
                                    <tr key={lang.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="text-center text-gray-400 no-print">
                                            <div className="flex flex-col items-center gap-1">
                                                <button onClick={() => moveUp(index)} disabled={index === 0} className="hover:text-primary disabled:opacity-30"><GripVertical size={14} className="rotate-90" /></button>
                                                <button onClick={() => moveDown(index)} disabled={index === languages.length - 1} className="hover:text-primary disabled:opacity-30"><GripVertical size={14} className="rotate-90" /></button>
                                            </div>
                                        </td>
                                        <td className="text-center font-medium text-text-muted">{index + 1}</td>
                                        <td className="font-bold text-secondary">{lang.label}</td>
                                        <td><span className="bg-gray-100 text-gray-800 font-mono px-2 py-1 rounded text-xs">{lang.code}</span></td>
                                        <td className="text-center">{lang.order}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleToggleActive(lang.id)}
                                                className={`px-2 py-1 text-xs font-bold rounded-full w-20 transition-colors ${lang.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                            >
                                                {lang.isActive ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="text-right no-print space-x-2">
                                            <button onClick={() => handleOpenEdit(lang)} className="p-1.5 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded transition-colors" title="Edit Language">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLang ? 'Edit Language' : 'Add Language'} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-main font-bold mb-1">Language Label *</label>
                        <input type="text" name="label" className="admin-input" value={formData.label} onChange={handleChange} required placeholder="e.g. Hindi (हिन्दी)" />
                    </div>
                    <div>
                        <label className="block text-text-main font-bold mb-1">Code (data-value) *</label>
                        <input type="text" name="code" className="admin-input" value={formData.code} onChange={handleChange} required placeholder="e.g. hi" disabled={!!editingLang} />
                        {editingLang && <p className="text-xs text-text-muted mt-1">Language code cannot be changed after creation.</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Display Order</label>
                            <input type="number" name="order" className="admin-input" value={formData.order} onChange={handleChange} />
                        </div>
                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-main">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                                Active
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-light">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors">Cancel</button>
                        <button type="submit" className="admin-btn-primary px-6 py-2">Save Language</button>
                    </div>
                </form>
            </AdminModal>

            {/* Import Modal */}
            <AdminModal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportData(null); setImportError(''); }} title="Import Languages" size="lg">
                <div className="space-y-4">
                    <p className="text-sm text-text-muted">Upload an Excel (.xlsx) or CSV file with the following columns: <span className="font-mono bg-gray-100 px-1 rounded">Code</span>, <span className="font-mono bg-gray-100 px-1 rounded">Label</span>, <span className="font-mono bg-gray-100 px-1 rounded">Order</span>, <span className="font-mono bg-gray-100 px-1 rounded">IsActive</span>.</p>

                    <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer border border-border-light rounded" />

                    {importError && <div className={`text-sm p-3 rounded ${importError.includes('Saving') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{importError}</div>}

                    {importData && (
                        <div>
                            <h4 className="font-bold text-secondary mb-2">Preview ({importData.length} records):</h4>
                            <div className="max-h-60 overflow-y-auto border border-border-light rounded">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 border-b">Code</th>
                                            <th className="p-2 border-b">Label</th>
                                            <th className="p-2 border-b">Order</th>
                                            <th className="p-2 border-b">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importData.slice(0, 10).map((r, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2">{r.code}</td>
                                                <td className="p-2">{r.label}</td>
                                                <td className="p-2">{r.order}</td>
                                                <td className="p-2">{r.isActive ? 'Active' : 'Disabled'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {importData.length > 10 && <p className="text-xs text-text-muted mt-1">Showing first 10 rows...</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-light">
                        <button type="button" onClick={() => { setImportModalOpen(false); setImportData(null); setImportError(''); }} className="px-4 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors">Cancel</button>
                        <button onClick={handleImportSubmit} disabled={!importData} className="admin-btn-primary px-6 py-2">Import Data</button>
                    </div>
                </div>
            </AdminModal>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .admin-sidebar { display: none !important; }
                    .admin-header { display: none !important; }
                    .printable-area { border: none !important; box-shadow: none !important; }
                }
            `}</style>
        </AdminPageLayout>
    );
}
