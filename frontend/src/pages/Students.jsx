import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import StudentList from '../components/Students/StudentList';
import AddStudent from '../components/Students/AddStudent';
import StudentDetails from '../components/Students/StudentDetails';
import ImportStudents from '../components/Students/ImportStudents';
import { PlusIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    search: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll(filters);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      await studentAPI.create(studentData);
      toast.success('Student added successfully');
      setShowAddModal(false);
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const handleImportStudents = async (studentsData) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      // Show loading toast
      const loadingToast = toast.loading(`Importing ${studentsData.length} students...`);

      // Import students one by one
      for (const student of studentsData) {
        try {
          await studentAPI.create(student);
          successCount++;
        } catch (error) {
          console.error('Error importing student:', student, error);
          errorCount++;
        }
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show result
      if (successCount > 0) {
        toast.success(`✅ Successfully imported ${successCount} students`);
      }
      if (errorCount > 0) {
        toast.error(`❌ Failed to import ${errorCount} students`);
      }

      // Refresh the list
      fetchStudents();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import students');
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      await studentAPI.update(selectedStudent._id, studentData);
      toast.success('Student updated successfully');
      setShowAddModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowAddModal(true);
  };

  const handleExport = () => {
    const exportData = students.map(s => ({
      'Registration No': s.registrationNumber,
      'Name': s.name,
      'Department': s.department,
      'Year': s.year,
      'Semester': s.semester,
      'Email': s.email,
      'Phone': s.phone || '',
      'Address': s.address || '',
      'Special Needs': s.specialNeeds ? 'Yes' : 'No',
      'Special Need Description': s.specialNeedDescription || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success('Students exported successfully!');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExport}
            className="btn-secondary inline-flex items-center"
            title="Export to Excel"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary inline-flex items-center"
            title="Import from Excel/CSV"
          >
            <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
            Import
          </button>
          <button
            onClick={() => {
              setSelectedStudent(null);
              setShowAddModal(true);
            }}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Department
            </label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="EEE">Electrical</option>
              <option value="MECH">Mechanical</option>
              <option value="CIVIL">Civil</option>
              <option value="IT">Information Technology</option>
              <option value="AIML">AI &amp; Machine Learning</option>
              <option value="AIDS">AI &amp; Data Science</option>
              <option value="CCE">Computer &amp; Communication Engg.</option>
              <option value="Chemical">Chemical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Year
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name or reg number..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <StudentList
          students={students}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
          onEdit={handleEditStudent}
        />
      )}

      {/* Add/Edit Student Modal */}
      {showAddModal && (
        <AddStudent
          onClose={() => {
            setShowAddModal(false);
            setSelectedStudent(null);
          }}
          onSave={selectedStudent ? handleUpdateStudent : handleAddStudent}
          editData={selectedStudent}
        />
      )}

      {/* Import Students Modal */}
      {showImportModal && (
        <ImportStudents
          onClose={() => setShowImportModal(false)}
          onImport={handleImportStudents}
        />
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedStudent && (
        <StudentDetails
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

export default Students;