import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

function ImportRooms({ onClose, onImport }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState({ headers: [], rows: [] });
    const [loading, setLoading] = useState(false);

    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        if (!validTypes.includes(selected.type) && !selected.name.endsWith('.csv')) {
            toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
            return;
        }
        setFile(selected);
        previewFile(selected);
    };

    const previewFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
            setPreview({ headers: jsonData[0] || [], rows: jsonData.slice(1, 4) });
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const template = [
            ['roomNumber', 'building', 'floor', 'capacity', 'rows', 'columns', 'isLab', 'hasAC', 'hasWheelchairAccess', 'isActive'],
            ['101', 'Block A', '1', '40', '5', '8', 'FALSE', 'TRUE', 'FALSE', 'TRUE'],
            ['Lab-01', 'Block B', '2', '30', '5', '6', 'TRUE', 'TRUE', 'TRUE', 'TRUE'],
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(template);
        XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
        XLSX.writeFile(wb, 'room_import_template.xlsx');
        toast.success('Template downloaded!');
    };

    const handleImport = () => {
        if (!file) { toast.error('Please select a file'); return; }
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(ws);

                const parseBool = (val) => val === true || val === 'TRUE' || val === 'true' || val === 1 || val === '1';

                const rooms = jsonData.map((row) => ({
                    roomNumber: String(row.roomNumber || '').trim(),
                    building: String(row.building || '').trim(),
                    floor: parseInt(row.floor) || 0,
                    capacity: parseInt(row.capacity) || 0,
                    rows: parseInt(row.rows) || 0,
                    columns: parseInt(row.columns) || 0,
                    isLab: parseBool(row.isLab),
                    hasAC: parseBool(row.hasAC),
                    hasWheelchairAccess: parseBool(row.hasWheelchairAccess),
                    isActive: row.isActive !== undefined ? parseBool(row.isActive) : true,
                }));

                const invalid = rooms.filter(r => !r.roomNumber || !r.building || !r.capacity);
                if (invalid.length > 0) {
                    toast.error(`${invalid.length} row(s) are missing required fields (roomNumber, building, capacity)`);
                    setLoading(false);
                    return;
                }

                await onImport(rooms);
                setLoading(false);
                onClose();
            } catch (err) {
                console.error(err);
                toast.error('Failed to import rooms. Check the file format.');
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card max-w-2xl w-full animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Import Rooms</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Upload an Excel or CSV file to bulk-import rooms</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Step 1 – Template */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-blue-800 mb-1">Step 1 — Download Template</h3>
                        <p className="text-xs text-blue-600 mb-3">Use our pre-filled template for the correct column format.</p>
                        <button onClick={downloadTemplate} className="btn-secondary text-xs py-1.5">
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            Download Template
                        </button>
                    </div>

                    {/* Step 2 – Upload */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Step 2 — Upload Your File</h3>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100 cursor-pointer"
                        />
                        {file && (
                            <p className="mt-2 text-xs text-green-600 font-medium">✓ {file.name} selected</p>
                        )}
                    </div>

                    {/* Preview */}
                    {preview.headers.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (first 3 rows)</h3>
                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {preview.headers.map((h, i) => (
                                                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {preview.rows.map((row, i) => (
                                            <tr key={i}>
                                                {row.map((cell, j) => (
                                                    <td key={j} className="px-3 py-2 text-gray-700">{cell ?? '—'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Format guide */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-amber-800 mb-2">Required Columns</h3>
                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                            <li><span className="font-semibold">roomNumber*</span> — unique room identifier (e.g., 101, Lab-01)</li>
                            <li><span className="font-semibold">building*</span> — building name or block (e.g., Block A)</li>
                            <li><span className="font-semibold">floor</span> — floor number (default 0)</li>
                            <li><span className="font-semibold">capacity*</span> — total seating capacity</li>
                            <li><span className="font-semibold">rows / columns</span> — seat layout grid dimensions</li>
                            <li><span className="font-semibold">isLab / hasAC / hasWheelchairAccess</span> — TRUE or FALSE</li>
                            <li><span className="font-semibold">isActive</span> — TRUE or FALSE (default TRUE)</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="btn-primary"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <DocumentArrowUpIcon className="h-4 w-4" />
                                    Import Rooms
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportRooms;
