import React, { useState, useEffect } from 'react';
import { roomAPI } from '../services/api';
import RoomList from '../components/Rooms/RoomList';
import AddRoom from '../components/Rooms/AddRoom';
import ImportRooms from '../components/Rooms/ImportRooms';
import { PlusIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({
    building: '',
    isLab: '',
    isActive: 'true'
  });

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll(filters);
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (roomData) => {
    try {
      await roomAPI.create(roomData);
      toast.success('Room added successfully');
      setShowAddModal(false);
      fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    }
  };

  const handleUpdateRoom = async (roomData) => {
    try {
      await roomAPI.update(selectedRoom._id, roomData);
      toast.success('Room updated successfully');
      setShowAddModal(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomAPI.delete(id);
        toast.success('Room deleted successfully');
        fetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error('Failed to delete room');
      }
    }
  };

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    // You can implement a view modal here
    toast.success(`Viewing room ${room.roomNumber}`);
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setShowAddModal(true);
  };

  const handleExport = () => {
    const exportData = rooms.map(r => ({
      'Room No': r.roomNumber,
      'Building': r.building,
      'Floor': r.floor,
      'Capacity': r.capacity,
      'Layout': `${r.rows} x ${r.columns}`,
      'Type': r.isLab ? 'Lab' : 'Classroom',
      'AC': r.hasAC ? 'Yes' : 'No',
      'Wheelchair Access': r.hasWheelchairAccess ? 'Yes' : 'No',
      'Status': r.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
    XLSX.writeFile(wb, `rooms_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportRooms = async (roomsData) => {
    let successCount = 0;
    let errorCount = 0;
    const loadingToast = toast.loading(`Importing ${roomsData.length} rooms...`);
    for (const room of roomsData) {
      try {
        await roomAPI.create(room);
        successCount++;
      } catch (err) {
        console.error('Error importing room:', room, err);
        errorCount++;
      }
    }
    toast.dismiss(loadingToast);
    if (successCount > 0) toast.success(`✅ Imported ${successCount} rooms successfully`);
    if (errorCount > 0) toast.error(`❌ Failed to import ${errorCount} rooms`);
    fetchRooms();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="section-title">Rooms</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage exam halls and laboratory spaces</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button onClick={handleExport} className="btn-secondary">
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">
            <DocumentArrowUpIcon className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => { setSelectedRoom(null); setShowAddModal(true); }}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Add Room
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building
            </label>
            <input
              type="text"
              name="building"
              value={filters.building}
              onChange={handleFilterChange}
              placeholder="Filter by building..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              name="isLab"
              value={filters.isLab}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="true">Laboratory</option>
              <option value="false">Classroom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
              <option value="">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <RoomList
          rooms={rooms}
          onDelete={handleDeleteRoom}
          onView={handleViewRoom}
          onEdit={handleEditRoom}
        />
      )}

      {/* Add/Edit Room Modal */}
      {showAddModal && (
        <AddRoom
          onClose={() => { setShowAddModal(false); setSelectedRoom(null); }}
          onSave={selectedRoom ? handleUpdateRoom : handleAddRoom}
          editData={selectedRoom}
        />
      )}

      {/* Import Rooms Modal */}
      {showImportModal && (
        <ImportRooms
          onClose={() => setShowImportModal(false)}
          onImport={handleImportRooms}
        />
      )}
    </div>
  );
}

export default Rooms;