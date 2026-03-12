import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function StudentDetails({ student, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Registration Number</p>
              <p className="text-base font-medium text-gray-900">{student.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-base font-medium text-gray-900">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="text-base font-medium text-gray-900">{student.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year & Semester</p>
              <p className="text-base font-medium text-gray-900">Year {student.year}, Sem {student.semester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{student.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-base font-medium text-gray-900">{student.phone || 'Not provided'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-base font-medium text-gray-900">{student.address || 'Not provided'}</p>
            </div>
            {student.specialNeeds && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Special Needs</p>
                <p className="text-base font-medium text-gray-900">{student.specialNeedDescription}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;