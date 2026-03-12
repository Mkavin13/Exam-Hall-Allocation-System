import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

function RoomList({ rooms, onDelete, onView, onEdit }) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No rooms found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Room No.</th>
              <th className="table-header">Building</th>
              <th className="table-header">Floor</th>
              <th className="table-header">Capacity</th>
              <th className="table-header">Layout</th>
              <th className="table-header">Features</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">
                  {room.roomNumber}
                </td>
                <td className="table-cell">{room.building}</td>
                <td className="table-cell">Floor {room.floor}</td>
                <td className="table-cell">{room.capacity}</td>
                <td className="table-cell">
                  {room.rows} x {room.columns} seats
                </td>
                <td className="table-cell">
                  <div className="flex space-x-1">
                    {room.hasAC && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">AC</span>}
                    {room.isLab && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Lab</span>}
                    {room.hasWheelchairAccess && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">♿</span>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(room)}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(room)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(room._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoomList;