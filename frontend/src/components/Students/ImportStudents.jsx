import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

function ImportStudents({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv' // csv
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    previewFile(selectedFile);
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Get headers and first 3 rows for preview
      const headers = jsonData[0] || [];
      const rows = jsonData.slice(1, 4) || [];
      setPreview({ headers, rows });
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      ['registrationNumber', 'name', 'department', 'year', 'semester', 'email', 'phone', 'address', 'specialNeeds', 'specialNeedDescription'],
      ['CS001', 'John Doe', 'CSE', '3', '5', 'john@college.edu', '9876543210', 'Address here', 'FALSE', ''],
      ['EC002', 'Jane Smith', 'ECE', '2', '3', 'jane@college.edu', '9876543211', '', 'TRUE', 'Wheelchair access needed']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_import_template.xlsx');

    toast.success('Template downloaded!');
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and transform data
        const students = jsonData.map((row, index) => {
          // Handle boolean fields
          const specialNeeds = row.specialNeeds === 'TRUE' || row.specialNeeds === true || row.specialNeeds === 'true';

          return {
            registrationNumber: String(row.registrationNumber || '').trim(),
            name: String(row.name || '').trim(),
            department: String(row.department || 'CSE').trim(),
            year: parseInt(row.year) || 1,
            semester: parseInt(row.semester) || 1,
            email: String(row.email || '').trim(),
            phone: String(row.phone || '').trim(),
            address: String(row.address || '').trim(),
            specialNeeds: specialNeeds,
            specialNeedDescription: specialNeeds ? String(row.specialNeedDescription || '').trim() : ''
          };
        });

        // Validate required fields
        const invalidStudents = students.filter(s => !s.registrationNumber || !s.name || !s.email);
        if (invalidStudents.length > 0) {
          toast.error(`${invalidStudents.length} students have missing required fields`);
          setLoading(false);
          return;
        }

        // Call the import function
        await onImport(students);
        setLoading(false);
        onClose();
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import students. Check file format.');
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Import Students</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Step 1: Download Template</h3>
            <p className="text-sm text-blue-600 mb-3">
              Download the template to see the required format
            </p>
            <button
              onClick={downloadTemplate}
              className="btn-secondary inline-flex items-center"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Step 2: Upload Your File</h3>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Selected: {file.name}
              </p>
            )}
          </div>

          {/* Preview */}
          {preview.headers && preview.headers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (First 3 rows)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.map((header, i) => (
                        <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-sm text-gray-900">
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Required Format</h3>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li><span className="font-medium">registrationNumber*</span> - Unique identifier (e.g., CS001)</li>
              <li><span className="font-medium">name*</span> - Student's full name</li>
              <li><span className="font-medium">department*</span> - CSE, ECE, EEE, MECH, CIVIL, IT, AIML, AIDS, CCE, Chemical</li>
              <li><span className="font-medium">year*</span> - 1, 2, 3, or 4</li>
              <li><span className="font-medium">semester*</span> - 1 to 8</li>
              <li><span className="font-medium">email*</span> - Valid email address</li>
              <li><span className="font-medium">phone</span> - Optional contact number</li>
              <li><span className="font-medium">specialNeeds</span> - TRUE or FALSE</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="btn-primary inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                  Import Students
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportStudents;