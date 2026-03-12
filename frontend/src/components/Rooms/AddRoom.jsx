import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function AddRoom({ onClose, onSave, editData }) {
  const [formData, setFormData] = useState(editData || {
    roomNumber: '',
    building: '',
    floor: 1,
    capacity: 30,
    rows: 5,
    columns: 6,
    isLab: false,
    hasAC: false,
    hasWheelchairAccess: false,
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Auto-calculate capacity when rows or columns change
  const handleLayoutChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: numValue };
      // Update capacity based on rows * columns
      newData.capacity = newData.rows * newData.columns;
      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., 101, LAB-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building *
              </label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Main Building"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor *
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                className="input-field bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from rows × columns</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rows *
              </label>
              <input
                type="number"
                name="rows"
                value={formData.rows}
                onChange={handleLayoutChange}
                required
                min="1"
                max="20"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Columns *
              </label>
              <input
                type="number"
                name="columns"
                value={formData.columns}
                onChange={handleLayoutChange}
                required
                min="1"
                max="20"
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isLab"
                checked={formData.isLab}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Laboratory Room
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasAC"
                checked={formData.hasAC}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Air Conditioned
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasWheelchairAccess"
                checked={formData.hasWheelchairAccess}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Wheelchair Accessible
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active (Available for allocation)
              </label>
            </div>
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
            >
              {editData ? 'Update Room' : 'Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRoom;