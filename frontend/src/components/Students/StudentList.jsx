import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const deptColors = {
  CSE: 'bg-blue-100 text-blue-700',
  ECE: 'bg-green-100 text-green-700',
  EEE: 'bg-yellow-100 text-yellow-700',
  MECH: 'bg-orange-100 text-orange-700',
  CIVIL: 'bg-stone-100 text-stone-700',
  IT: 'bg-indigo-100 text-indigo-700',
  AIML: 'bg-purple-100 text-purple-700',
  AIDS: 'bg-pink-100 text-pink-700',
  CCE: 'bg-cyan-100 text-cyan-700',
  Chemical: 'bg-red-100 text-red-700',
};

function StudentList({ students, onDelete, onView, onEdit }) {
  if (students.length === 0) {
    return (
      <div className="card text-center py-16">
        <UserCircleIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">No students found</p>
        <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="table-header">Reg No.</th>
              <th className="table-header">Name</th>
              <th className="table-header">Department</th>
              <th className="table-header">Year</th>
              <th className="table-header">Semester</th>
              <th className="table-header">Email</th>
              <th className="table-header">Phone</th>
              <th className="table-header text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student) => {
              const deptCls = deptColors[student.department] || 'bg-gray-100 text-gray-600';
              return (
                <tr key={student._id} className="table-row">
                  <td className="table-cell">
                    <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                      {student.registrationNumber}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge text-xs font-semibold ${deptCls}`}>{student.department}</span>
                  </td>
                  <td className="table-cell text-gray-500">Year {student.year}</td>
                  <td className="table-cell text-gray-500">Sem {student.semester}</td>
                  <td className="table-cell text-gray-500 text-xs">{student.email}</td>
                  <td className="table-cell text-gray-500">{student.phone || '—'}</td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-1 pr-0">
                      <button
                        onClick={() => onView(student)}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        className="p-1.5 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(student._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
        <p className="text-xs text-gray-400">{students.length} student{students.length !== 1 ? 's' : ''} listed</p>
      </div>
    </div>
  );
}

export default StudentList;