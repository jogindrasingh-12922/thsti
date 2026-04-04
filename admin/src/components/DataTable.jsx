import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function DataTable({
    columns,
    data,
    totalRecords,
    page,
    limit,
    onPageChange,
    onLimitChange,
    sortField,
    sortDirection,
    onSort,
    isLoading
}) {
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const handleSort = (field) => {
        if (!field) return;
        if (sortField === field) {
            onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(field, 'asc');
        }
    };

    return (
        <div className="bg-white admin-card shadow-sm flex flex-col flex-1 min-h-0">
            <div className="overflow-auto flex-1 min-h-0 relative">
                <table className="w-full text-left min-w-[1000px] border-collapse relative">
                    <thead className="sticky top-0 z-30 shadow-sm">
                        <tr className="bg-bg-light text-text-dark text-sm uppercase tracking-wider">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    style={{ backgroundColor: 'var(--bg-light)', zIndex: 30 }}
                                    className={`sticky top-0 border-b border-border-light p-4 font-bold whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.width || ''}`}
                                    onClick={() => col.sortable && handleSort(col.field)}
                                >
                                    <div className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                                        {col.header}
                                        {col.sortable && (
                                            <span className="text-gray-400">
                                                {sortField === col.field ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />
                                                ) : (
                                                    <ArrowUpDown size={14} />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-text-muted font-bold">
                                    Loading data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-gray-300 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                        </div>
                                        <p className="text-text-muted text-lg font-bold">No records found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className={`border-b border-border-light hover:bg-gray-50 transition-colors ${row._rowClass || ''}`}>
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`p-4 text-text-dark ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}>
                                            {col.render ? col.render(row, rowIndex) : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-border-light bg-gray-50 text-sm text-text-dark">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Rows per page:</span>
                        <select
                            className="admin-input py-1 px-2 w-20"
                            value={limit}
                            onChange={(e) => onLimitChange(parseInt(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <span className="font-bold">Total: {totalRecords}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={page === 1}
                        className="p-1 rounded hover:bg-white border border-transparent hover:border-border-light disabled:opacity-50 transition-all text-text-dark"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-1 rounded hover:bg-white border border-transparent hover:border-border-light disabled:opacity-50 transition-all text-text-dark"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="px-4 py-1 font-bold text-primary bg-white border border-border-light rounded">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-1 rounded hover:bg-white border border-transparent hover:border-border-light disabled:opacity-50 transition-all text-text-dark"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={page === totalPages}
                        className="p-1 rounded hover:bg-white border border-transparent hover:border-border-light disabled:opacity-50 transition-all text-text-dark"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
