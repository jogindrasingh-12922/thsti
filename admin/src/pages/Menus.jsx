import React, { useState, useEffect, useRef } from 'react';
import { PUBLIC_SITE_URL } from '../config/env';
import { Plus, Edit2, Trash2, Save, Download, Upload, Printer, Eye, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import AdminModal from '../components/AdminModal';
import AdminPageLayout from '../components/AdminPageLayout';

export default function Menus() {
    const [menus, setMenus] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortField, setSortField] = useState('order');
    const [sortDirection, setSortDirection] = useState('asc');
    const [search, setSearch] = useState('');
    const [allMenusForDropdown, setAllMenusForDropdown] = useState([]);
    const [viewingMenu, setViewingMenu] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingMenu, setEditingMenu] = useState(null);
    const userStr = localStorage.getItem('thsti_admin_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const fileInputRef = useRef(null);

    // Form states
    const [label, setLabel] = useState('');
    const [route, setRoute] = useState('');
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [isExternal, setIsExternal] = useState(false);
    const [targetBlank, setTargetBlank] = useState(false);
    const [isMegaMenu, setIsMegaMenu] = useState(false);
    const [parentId, setParentId] = useState('');
    const [location, setLocation] = useState('HEADER');

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/menus/all?page=${page}&limit=${limit}&sort=${sortField}&direction=${sortDirection}&search=${search}`);
            setMenus(res.data.data);
            setTotalRecords(res.data.meta.total);
        } catch (err) {
            console.error("Failed to fetch menus", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, [page, limit, sortField, sortDirection, search]);

    useEffect(() => {
        // Fetch all menus flat for the dropdown list
        api.get('/menus/all?limit=1000').then(res => setAllMenusForDropdown(res.data.data)).catch(console.error);
    }, []);

    const getDescendants = (menuId) => {
        let descendants = [];
        const children = allMenusForDropdown.filter(m => m.parentId === menuId);
        descendants.push(...children.map(c => c.id));
        children.forEach(c => {
            descendants.push(...getDescendants(c.id));
        });
        return descendants;
    };

    const invalidParents = editingMenu ? [editingMenu.id, ...getDescendants(editingMenu.id)] : [];

    const buildTreeOptions = (parentId = null, level = 0) => {
        return allMenusForDropdown
            .filter(m => m.parentId === parentId)
            .flatMap(m => [
                { ...m, level },
                ...buildTreeOptions(m.id, level + 1)
            ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                label,
                route,
                order: parseInt(order),
                isActive,
                isVisible,
                isExternal,
                targetBlank,
                isMegaMenu,
                parentId: parentId ? parseInt(parentId) : null,
                location
            };
            if (editingMenu) {
                await api.put(`/menus/${editingMenu.id}`, payload);
            } else {
                await api.post('/menus', payload);
            }
            setIsModalOpen(false);
            resetForm();
            fetchMenus();
        } catch (err) {
            alert('Failed to save menu item');
        }
    };

    const handleDelete = async (id) => {
        if (!isSuperAdmin) {
            alert('Only Super Admin can delete menus.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this menu?')) {
            try {
                await api.delete(`/menus/${id}`);
                fetchMenus();
            } catch (err) {
                alert('Failed to delete menu');
            }
        }
    };

    const handleToggleActive = async (menu) => {
        try {
            await api.put(`/menus/${menu.id}`, { ...menu, isActive: !menu.isActive });
            fetchMenus();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/menus/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'menus_export.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            alert('Export failed');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.confirm('Upload ' + file.name + ' to import menus? Existing IDs will be updated.')) {
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/menus/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert(`Import successful! ${res.data.count} rows processed.`);
            fetchMenus();
        } catch (err) {
            alert(err.response?.data?.error || 'Import failed');
        } finally {
            e.target.value = null;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const startEdit = (menu) => {
        setEditingMenu(menu);
        setLabel(menu.label);
        setRoute(menu.route || '');
        setOrder(menu.order);
        setIsActive(menu.isActive);
        setIsVisible(menu.isVisible);
        setIsExternal(menu.isExternal);
        setTargetBlank(menu.targetBlank);
        setIsMegaMenu(menu.isMegaMenu || false);
        setParentId(menu.parentId || '');
        setLocation(menu.location || 'HEADER');
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingMenu(null);
        setLabel('');
        setRoute('');
        setOrder(0);
        setIsActive(true);
        setIsVisible(true);
        setIsExternal(false);
        setTargetBlank(false);
        setIsMegaMenu(false);
        setParentId('');
        setLocation('HEADER');
        setIsModalOpen(false);
    };

    const columns = [
        {
            header: 'S.No',
            field: 'id',
            width: 'w-16',
            align: 'center',
            render: (row, i) => <span className="text-text-muted font-bold">{(page - 1) * limit + i + 1}</span>
        },
        {
            header: 'Label',
            field: 'label',
            sortable: true,
            render: (row) => (
                <div className={`flex items-center gap-2 whitespace-nowrap ${row.parentId ? 'pl-6' : 'font-bold'}`}>
                    {row.parentId && <span className="text-gray-400">↳</span>}
                    <span className="text-secondary">{row.label}</span>
                </div>
            )
        },
        {
            header: 'Parent Menu',
            field: 'parent',
            render: (row) => <span className="text-text-muted text-sm font-bold whitespace-nowrap">{row.parent?.label || '—'}</span>
        },
        {
            header: 'Order',
            field: 'order',
            sortable: true,
            align: 'center',
            render: (row) => <span className="font-bold">{row.order}</span>
        },
        {
            header: 'Location',
            field: 'location',
            sortable: true,
            render: (row) => <span className="font-bold text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">{row.location || 'HEADER'}</span>
        },
        {
            header: 'Active',
            field: 'isActive',
            sortable: true,
            align: 'center',
            render: (row) => (
                <span className={`px-2 py-1 text-xs font-bold rounded ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        },
        {
            header: 'Visible',
            field: 'isVisible',
            align: 'center',
            render: (row) => (
                <span className={`px-2 py-1 text-xs font-bold rounded ${row.isVisible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.isVisible ? 'VISIBLE' : 'HIDDEN'}
                </span>
            )
        },
        {
            header: 'Actions',
            field: 'actions',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-2 print:hidden">
                    <button onClick={() => setViewingMenu(row)} title="View Details" className="p-2 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                        <Eye size={16} />
                    </button>
                    <button onClick={() => startEdit(row)} title="Edit Menu" className="p-2 text-text-muted hover:text-accent bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleToggleActive(row)} title={row.isActive ? 'Disable' : 'Enable'} className={`p-2 border rounded shadow-sm transition-colors ${row.isActive ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' : 'text-gray-400 border-border-light bg-gray-50 hover:bg-gray-100'}`}>
                        {row.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    {isSuperAdmin && (
                        <button onClick={() => handleDelete(row.id)} title="Delete Menu" className="p-2 text-text-muted hover:text-primary bg-gray-50 border border-border-light rounded shadow-sm transition-colors">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const actionButtons = (
        <>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search labels..."
                    className="admin-input !pl-10 py-2 text-sm w-48 focus:w-64 transition-all"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>
            <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="admin-btn-accent text-sm flex items-center gap-2 py-2 px-4">
                <Plus size={16} /> Add Menu
            </button>
            <div className="flex items-center gap-2 bg-white rounded border border-border-light p-1 shadow-sm">
                <input type="file" ref={fileInputRef} accept=".xlsx, .csv" onChange={handleImport} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} title="Import Excel" className="p-2 text-text-muted hover:text-secondary hover:bg-bg-light rounded transition-colors">
                    <Upload size={18} />
                </button>
                <div className="w-px h-6 bg-border-light"></div>
                <button onClick={handleExport} title="Export Excel" className="p-2 text-text-muted hover:text-secondary hover:bg-bg-light rounded transition-colors">
                    <Download size={18} />
                </button>
                <div className="w-px h-6 bg-border-light"></div>
                <button onClick={handlePrint} title="Print Table" className="p-2 text-text-muted hover:text-secondary hover:bg-bg-light rounded transition-colors">
                    <Printer size={18} />
                </button>
            </div>
        </>
    );

    return (
        <AdminPageLayout
            title="Menu Management"
            subtitle="Manage global site navigation links and hierarchy"
            actionButtons={actionButtons}
        >

            <DataTable
                columns={columns}
                data={menus}
                totalRecords={totalRecords}
                page={page}
                limit={limit}
                isLoading={loading}
                sortField={sortField}
                sortDirection={sortDirection}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
                onSort={(field, dir) => { setSortField(field); setSortDirection(dir); setPage(1); }}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => { resetForm(); setIsModalOpen(false); }}
                title={editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-text-main font-bold mb-2">Menu Label <span className="text-primary">*</span></label>
                            <input type="text" className="admin-input" value={label} onChange={e => setLabel(e.target.value)} required placeholder="e.g., About Us" />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-2">Route / Link URL</label>
                            <input type="text" className="admin-input font-mono text-sm placeholder:font-sans" placeholder="/about or https://..." value={route} onChange={e => setRoute(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-text-main font-bold mb-2">Display Order <span className="text-primary">*</span></label>
                            <input type="number" className="admin-input" value={order} onChange={e => setOrder(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-2">Menu Location <span className="text-primary">*</span></label>
                            <select className="admin-input" value={location} onChange={e => setLocation(e.target.value)} required>
                                <option value="HEADER">Header (Main Menu)</option>
                                <option value="FOOTER_1">Footer Menu 1</option>
                                <option value="FOOTER_2">Footer Menu 2</option>
                                <option value="FOOTER_3">Footer Menu 3</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-text-main font-bold mb-2">Parent Menu (Optional)</label>
                            <select className="admin-input" value={parentId} onChange={e => setParentId(e.target.value)}>
                                <option value="">-- None (Top Level) --</option>
                                {buildTreeOptions().filter(m => !invalidParents.includes(m.id)).map(m => (
                                    <option key={m.id} value={m.id}>
                                        {'\u00A0\u00A0\u00A0\u00A0'.repeat(m.level)}{m.label} ({m.location})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end pb-2">
                             <span className="text-xs text-text-muted">Parent menus should typically share the same location.</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-bg-light border border-border-light rounded">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                            <span className="font-bold text-text-dark text-sm">Active (Enabled)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
                            <span className="font-bold text-text-dark text-sm">Visible in Navbar</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={isExternal} onChange={e => setIsExternal(e.target.checked)} />
                            <span className="font-bold text-text-dark text-sm">External Link</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={targetBlank} onChange={e => setTargetBlank(e.target.checked)} />
                            <span className="font-bold text-text-dark text-sm">Open in New Tab</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" checked={isMegaMenu} onChange={e => setIsMegaMenu(e.target.checked)} />
                            <span className="font-bold text-text-dark text-sm">Is Mega Menu</span>
                        </label>
                    </div>

                    <div className="pt-4 flex gap-4 border-t border-border-light mt-4">
                        <button type="submit" className="admin-btn-primary flex items-center justify-center gap-2 min-w-[150px] text-base py-2">
                            {editingMenu ? <Save size={18} /> : <Plus size={18} />}
                            {editingMenu ? 'Save Changes' : 'Create Menu'}
                        </button>
                        <button type="button" onClick={() => { resetForm(); setIsModalOpen(false); }} className="px-6 py-2 border border-border-light text-text-dark font-bold hover:bg-gray-100 rounded transition-colors uppercase tracking-wide">
                            Cancel
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* View Modal */}
            {viewingMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-border-light">
                        <div className="bg-bg-light border-b border-border-light p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-secondary uppercase">View Menu Details</h3>
                            <button onClick={() => setViewingMenu(null)} className="text-text-muted hover:text-primary transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Label</span>
                                <span className="col-span-2 text-text-dark font-medium">{viewingMenu.label}</span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Route URL</span>
                                <span className="col-span-2 text-accent font-mono text-sm break-all">{viewingMenu.route || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Parent Menu</span>
                                <span className="col-span-2 text-text-dark">
                                    {viewingMenu.parent?.label || 'None (Top Level)'}
                                    {viewingMenu.parentId && <span className="text-text-muted ml-2 text-sm">(ID: {viewingMenu.parentId})</span>}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Order</span>
                                <span className="col-span-2 text-text-dark">{viewingMenu.order}</span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Status</span>
                                <span className="col-span-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${viewingMenu.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {viewingMenu.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Visibility</span>
                                <span className="col-span-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${viewingMenu.isVisible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {viewingMenu.isVisible ? 'VISIBLE' : 'HIDDEN'}
                                    </span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">External</span>
                                <span className="col-span-2 text-text-dark">{viewingMenu.isExternal ? 'Yes (External Link)' : 'No (Internal Route)'}</span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-border-light pb-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">New Tab Target</span>
                                <span className="col-span-2 text-text-dark">{viewingMenu.targetBlank ? 'Yes (_blank)' : 'No'}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="font-bold text-text-muted uppercase text-xs tracking-wider pt-0.5">Mega Menu</span>
                                <span className="col-span-2 text-text-dark">{viewingMenu.isMegaMenu ? 'Yes (Expanded)' : 'No (Standard Dropdown)'}</span>
                            </div>
                        </div>
                        <div className="bg-bg-light border-t border-border-light p-4 flex justify-end">
                            <button onClick={() => setViewingMenu(null)} className="admin-btn-primary text-sm px-6 py-2">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminPageLayout>
    );
}
