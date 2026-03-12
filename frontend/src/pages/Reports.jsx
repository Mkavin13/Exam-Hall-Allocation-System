import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';
import { studentAPI, roomAPI, examAPI, allocationAPI } from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [stats, setStats] = useState({
    students: {},
    rooms: {},
    exams: {},
    allocations: {}
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [studentsRes, roomsRes, examsRes, allocationsRes] = await Promise.all([
        studentAPI.getAll(),
        roomAPI.getAll(),
        examAPI.getAll(),
        allocationAPI.getAll()
      ]);

      setStats({
        students: {
          total: studentsRes.data.count || 0,
          byDepartment: groupByDepartment(studentsRes.data.data || [])
        },
        rooms: {
          total: roomsRes.data.count || 0,
          totalCapacity: roomsRes.data.data?.reduce((sum, r) => sum + r.capacity, 0) || 0,
          byBuilding: groupByBuilding(roomsRes.data.data || [])
        },
        exams: {
          total: examsRes.data.count || 0,
          byStatus: groupByStatus(examsRes.data.data || [])
        },
        allocations: {
          total: allocationsRes.data.count || 0,
          byStatus: groupByAllocationStatus(allocationsRes.data.data || [])
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const groupByDepartment = (students) => {
    const groups = {};
    students.forEach(s => {
      groups[s.department] = (groups[s.department] || 0) + 1;
    });
    return groups;
  };

  const groupByBuilding = (rooms) => {
    const groups = {};
    rooms.forEach(r => {
      groups[r.building] = (groups[r.building] || 0) + 1;
    });
    return groups;
  };

  const groupByStatus = (exams) => {
    const groups = {};
    exams.forEach(e => {
      groups[e.status] = (groups[e.status] || 0) + 1;
    });
    return groups;
  };

  const groupByAllocationStatus = (allocations) => {
    const groups = {};
    allocations.forEach(a => {
      groups[a.status] = (groups[a.status] || 0) + 1;
    });
    return groups;
  };

  const generateSummaryReport = () => {
    const data = [
      ['Category', 'Metric', 'Value'],
      ['Students', 'Total Students', stats.students.total],
      ['', 'By Department', ''],
      ...Object.entries(stats.students.byDepartment || {}).map(([dept, count]) => ['', `  ${dept}`, count]),
      ['Rooms', 'Total Rooms', stats.rooms.total],
      ['', 'Total Capacity', stats.rooms.totalCapacity],
      ['', 'By Building', ''],
      ...Object.entries(stats.rooms.byBuilding || {}).map(([bldg, count]) => ['', `  ${bldg}`, count]),
      ['Exams', 'Total Exams', stats.exams.total],
      ['', 'By Status', ''],
      ...Object.entries(stats.exams.byStatus || {}).map(([status, count]) => ['', `  ${status}`, count]),
      ['Allocations', 'Total Allocations', stats.allocations.total],
      ['', 'By Status', ''],
      ...Object.entries(stats.allocations.byStatus || {}).map(([status, count]) => ['', `  ${status}`, count])
    ];

    return data;
  };

  const handleExportExcel = () => {
    let data = [];
    
    switch (reportType) {
      case 'summary':
        data = generateSummaryReport();
        break;
      case 'students':
        // Fetch and prepare student data
        break;
      case 'rooms':
        // Fetch and prepare room data
        break;
      case 'allocations':
        // Fetch and prepare allocation data
        break;
      default:
        break;
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Exam Hall Allocation System Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType.toUpperCase()}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

    const data = generateSummaryReport();
    
    doc.autoTable({
      startY: 45,
      head: [['Category', 'Metric', 'Value']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="summary">Summary Report</option>
              <option value="students">Student Report</option>
              <option value="rooms">Room Report</option>
              <option value="exams">Exam Report</option>
              <option value="allocations">Allocation Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={handleExportExcel}
            className="btn-secondary inline-flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-2xl font-semibold text-blue-700">{stats.students.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-green-600 font-medium">Total Rooms</p>
                <p className="text-2xl font-semibold text-green-700">{stats.rooms.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-purple-600 font-medium">Total Exams</p>
                <p className="text-2xl font-semibold text-purple-700">{stats.exams.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-yellow-600 font-medium">Allocations</p>
                <p className="text-2xl font-semibold text-yellow-700">{stats.allocations.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="space-y-6">
          {/* Students by Department */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Students by Department</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Department</th>
                  <th className="table-header">Count</th>
                  <th className="table-header">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats.students.byDepartment || {}).map(([dept, count]) => (
                  <tr key={dept}>
                    <td className="table-cell">{dept}</td>
                    <td className="table-cell">{count}</td>
                    <td className="table-cell">
                      {((count / stats.students.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rooms by Building */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Rooms by Building</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Building</th>
                  <th className="table-header">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats.rooms.byBuilding || {}).map(([bldg, count]) => (
                  <tr key={bldg}>
                    <td className="table-cell">{bldg}</td>
                    <td className="table-cell">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Allocation Status */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Allocation Status</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Status</th>
                  <th className="table-header">Count</th>
                  <th className="table-header">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats.allocations.byStatus || {}).map(([status, count]) => (
                  <tr key={status}>
                    <td className="table-cell capitalize">{status}</td>
                    <td className="table-cell">{count}</td>
                    <td className="table-cell">
                      {((count / stats.allocations.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;