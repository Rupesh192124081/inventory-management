import React, { useState, useMemo } from 'react';
import {
    Search, Download, Filter, ArrowUpCircle, ArrowDownCircle,
    Package, Calendar, FileText, RefreshCw, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { StockLedgerEntry, Item } from '../types/inventory';

interface StockLedgerProps {
    items: Item[];
}

const StockLedger: React.FC<StockLedgerProps> = ({ items }) => {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [movementType, setMovementType] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Get all ledger entries
    const allEntries = useMemo(() => {
        if (selectedItemId) {
            return inventoryService.getItemLedger(selectedItemId);
        }
        return inventoryService.getStockLedger()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedItemId]);

    // Filter entries
    const filteredEntries = useMemo(() => {
        let entries = [...allEntries];

        // Filter by date range
        if (dateFrom) {
            entries = entries.filter(e => new Date(e.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            entries = entries.filter(e => new Date(e.date) <= new Date(dateTo + 'T23:59:59'));
        }

        // Filter by movement type
        if (movementType !== 'all') {
            entries = entries.filter(e => e.type === movementType);
        }

        return entries;
    }, [allEntries, dateFrom, dateTo, movementType]);

    // Paginate
    const paginatedEntries = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEntries.slice(start, start + itemsPerPage);
    }, [filteredEntries, currentPage]);

    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

    // Filter items by search
    const filteredItems = useMemo(() => {
        if (!searchQuery) return items.slice(0, 50);
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query)
        ).slice(0, 50);
    }, [items, searchQuery]);

    // Get item name by ID
    const getItemName = (itemId: string): string => {
        const item = items.find(i => i.id === itemId);
        return item?.name || 'Unknown Item';
    };

    // Format date
    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get movement type badge
    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            'IN': 'bg-emerald-100 text-emerald-700',
            'OUT': 'bg-rose-100 text-rose-700',
            'ADJUSTMENT': 'bg-amber-100 text-amber-700',
            'RETURN': 'bg-blue-100 text-blue-700',
            'DAMAGE': 'bg-red-100 text-red-700',
            'TRANSFER': 'bg-purple-100 text-purple-700',
        };
        return styles[type] || 'bg-slate-100 text-slate-700';
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Date', 'Item', 'Type', 'Reference', 'In', 'Out', 'Balance', 'Rate', 'Value', 'Party', 'Note'];
        const rows = filteredEntries.map(e => [
            formatDate(e.date),
            getItemName(e.itemId),
            e.type,
            e.referenceNumber || e.referenceId,
            e.quantityIn,
            e.quantityOut,
            e.balanceAfter,
            e.rate,
            e.value,
            e.partyName || '',
            e.note || '',
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-ledger-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Stock Ledger</h1>
                    <p className="text-slate-500">Complete audit trail of all stock movements</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Item Search */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Item Filter</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value === '') setSelectedItemId('');
                                }}
                                placeholder="Search items..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {selectedItemId && (
                                <button
                                    onClick={() => {
                                        setSelectedItemId('');
                                        setSearchQuery('');
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                        {searchQuery && !selectedItemId && (
                            <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                                {filteredItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedItemId(item.id);
                                            setSearchQuery(item.name);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors"
                                    >
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-slate-500">Stock: {item.stock} {item.unit}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Movement Type */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Movement Type</label>
                        <select
                            value={movementType}
                            onChange={(e) => setMovementType(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="IN">Stock In</option>
                            <option value="OUT">Stock Out</option>
                            <option value="ADJUSTMENT">Adjustment</option>
                            <option value="RETURN">Return</option>
                            <option value="DAMAGE">Damage</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase">Total Stock In</p>
                            <p className="text-2xl font-black text-emerald-700">
                                {filteredEntries.reduce((sum, e) => sum + e.quantityIn, 0).toLocaleString()}
                            </p>
                        </div>
                        <ArrowDownCircle className="w-8 h-8 text-emerald-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-rose-600 uppercase">Total Stock Out</p>
                            <p className="text-2xl font-black text-rose-700">
                                {filteredEntries.reduce((sum, e) => sum + e.quantityOut, 0).toLocaleString()}
                            </p>
                        </div>
                        <ArrowUpCircle className="w-8 h-8 text-rose-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase">Total Value In</p>
                            <p className="text-2xl font-black text-indigo-700">
                                ₹{filteredEntries.filter(e => e.quantityIn > 0).reduce((sum, e) => sum + Math.abs(e.value), 0).toLocaleString()}
                            </p>
                        </div>
                        <Package className="w-8 h-8 text-indigo-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-600 uppercase">Entries</p>
                            <p className="text-2xl font-black text-amber-700">
                                {filteredEntries.length.toLocaleString()}
                            </p>
                        </div>
                        <FileText className="w-8 h-8 text-amber-500 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Item</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Reference</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">In</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Out</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Balance</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Party</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">No stock movements found</p>
                                        <p className="text-sm">Stock movements will appear here as transactions occur</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedEntries.map((entry, index) => (
                                    <tr key={entry.id} className={`border-t border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {formatDate(entry.date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{getItemName(entry.itemId)}</p>
                                            {entry.variantId && (
                                                <p className="text-xs text-slate-500">Variant: {entry.variantId}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTypeBadge(entry.type)}`}>
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-slate-700">{entry.referenceType}</p>
                                            <p className="text-xs text-slate-500">{entry.referenceNumber || entry.referenceId.slice(-8)}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {entry.quantityIn > 0 && (
                                                <span className="font-bold text-emerald-600">+{entry.quantityIn}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {entry.quantityOut > 0 && (
                                                <span className="font-bold text-rose-600">-{entry.quantityOut}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                                            {entry.balanceAfter}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                                            ₹{entry.rate.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {entry.partyName || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockLedger;
