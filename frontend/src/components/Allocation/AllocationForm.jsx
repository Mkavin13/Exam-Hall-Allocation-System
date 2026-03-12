import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { studentAPI, roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

function AllocationForm({ onClose, onSave, exams }) {
  const [formData, setFormData] = useState({
    examId: '',
    studentIds: []
  });
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, roomsRes] = await Promise.all([
        studentAPI.getAll(),
        roomAPI.getAll({ isActive: true })
      ]);
      setStudents(studentsRes.data.data || []);
      setRooms(roomsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.examId) {
      toast.error('Please select an exam');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    if (selectedStudents.length > totalCapacity) {
      toast.error(`Total capacity (${totalCapacity}) is less than selected students (${selectedStudents.length})`);
      return;
    }

    onSave({
      examId: formData.examId,
      studentIds: selectedStudents
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Create New Allocation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Exam Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exam *
            </label>
            <select
              value={formData.examId}
              onChange={(e) => setFormData(prev => ({ ...prev, examId: e.target.value }))}
              required
              className="input-field"
            >
              <option value="">Choose an exam...</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>
                  {exam.examName} - {exam.subject} ({new Date(exam.examDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Room Info Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Available Rooms Summary</h3>
            <p className="text-sm text-blue-600">
              Total Rooms: {rooms.length} | Total Capacity: {rooms.reduce((sum, room) => sum + room.capacity, 0)} students
            </p>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {rooms.map(room => (
                <div key={room._id} className="text-xs bg-white p-2 rounded">
                  <span className="font-medium">{room.roomNumber}</span>: {room.capacity} seats
                </div>
              ))}
            </div>
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Students *
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedStudents.length === students.length && students.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reg No.
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => handleStudentSelect(student._id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">{student.registrationNumber}</td>
                          <td className="px-4 py-2 text-sm font-medium">{student.name}</td>
                          <td className="px-4 py-2 text-sm">{student.department}</td>
                          <td className="px-4 py-2 text-sm">{student.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedStudents.length} students
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Start Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllocationForm;