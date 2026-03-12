import React, { useState } from 'react';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

function SeatMap({ room, seats, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Create seat matrix based on room dimensions
  const createSeatMatrix = () => {
    if (!room || !seats) return [];

    const matrix = [];
    let seatIndex = 0;

    for (let row = 0; row < room.rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < room.columns; col++) {
        const seat = seats[seatIndex] || null;
        rowSeats.push(seat);
        seatIndex++;
      }
      matrix.push(rowSeats);
    }
    return matrix;
  };

  const seatMatrix = createSeatMatrix();

  // Filter seats based on search and status
  const filteredSeats = seats.filter(seat => {
    if (!seat || !seat.student) return false;
    
    const matchesSearch = searchTerm === '' || 
      seat.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || seat.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get status color and style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'allocated':
        return 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100';
      case 'present':
        return 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100';
      case 'absent':
        return 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100';
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'allocated':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Allocated</span>;
      case 'present':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Present</span>;
      case 'absent':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Absent</span>;
      default:
        return null;
    }
  };

  // Handle status update
  const handleStatusChange = (seatId, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(seatId, newStatus);
    }
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Seat Map - Room ${room.roomNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .room-info { margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .seat-map { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
            .seat-row { display: flex; gap: 10px; justify-content: center; }
            .seat { 
              width: 100px; 
              min-height: 100px; 
              border: 2px solid #ccc; 
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 8px;
              font-size: 12px;
              background: #f9f9f9;
            }
            .seat.allocated { background: #e6f3ff; border-color: #3b82f6; }
            .seat.present { background: #e6ffe6; border-color: #10b981; }
            .seat.absent { background: #ffe6e6; border-color: #ef4444; }
            .seat-number { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .student-name { font-weight: 500; text-align: center; }
            .student-reg { font-size: 10px; color: #666; margin-top: 3px; }
            .legend { margin-top: 30px; display: flex; gap: 20px; justify-content: center; }
            .legend-item { display: flex; align-items: center; gap: 5px; }
            .legend-color { width: 20px; height: 20px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Exam Hall Seat Map</h1>
          <div class="room-info">
            <p><strong>Room:</strong> ${room.roomNumber}</p>
            <p><strong>Building:</strong> ${room.building}</p>
            <p><strong>Floor:</strong> ${room.floor}</p>
            <p><strong>Total Capacity:</strong> ${room.capacity}</p>
            <p><strong>Layout:</strong> ${room.rows} rows x ${room.columns} columns</p>
          </div>
          <div class="seat-map">
            ${seatMatrix.map((row, rowIndex) => `
              <div class="seat-row">
                ${row.map((seat, colIndex) => {
                  if (!seat || !seat.student) {
                    return `<div class="seat" style="background: #f0f0f0; border-color: #ddd; opacity: 0.5;">
                              <div class="seat-number">${String.fromCharCode(65 + rowIndex)}${colIndex + 1}</div>
                              <div class="student-name">Empty</div>
                            </div>`;
                  }
                  return `<div class="seat ${seat.status}">
                            <div class="seat-number">${seat.seatNumber}</div>
                            <div class="student-name">${seat.student.name}</div>
                            <div class="student-reg">${seat.student.registrationNumber}</div>
                          </div>`;
                }).join('')}
              </div>
            `).join('')}
          </div>
          <div class="legend">
            <div class="legend-item"><div class="legend-color" style="background: #e6f3ff;"></div> Allocated</div>
            <div class="legend-item"><div class="legend-color" style="background: #e6ffe6;"></div> Present</div>
            <div class="legend-item"><div class="legend-color" style="background: #ffe6e6;"></div> Absent</div>
            <div class="legend-item"><div class="legend-color" style="background: #f0f0f0;"></div> Empty</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div 
        className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer border-b"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Room {room.roomNumber} - {room.building}
          </h3>
          <p className="text-sm text-gray-500">
            Floor {room.floor} • Capacity: {room.capacity} • Layout: {room.rows} rows x {room.columns} columns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrint();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Print Seat Map"
          >
            <PrinterIcon className="h-5 w-5" />
          </button>
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="allocated">Allocated</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Row labels */}
              <div className="flex mb-2">
                <div className="w-8 flex-shrink-0"></div>
                {Array.from({ length: room.columns }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-sm font-medium text-gray-500">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Seat rows */}
              {seatMatrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex mb-2">
                  {/* Row label */}
                  <div className="w-8 flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-500">
                    {String.fromCharCode(65 + rowIndex)}
                  </div>

                  {/* Seats in this row */}
                  {row.map((seat, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="flex-1 px-1"
                    >
                      {seat && seat.student ? (
                        <div
                          className={`border-2 rounded-lg p-2 ${getStatusStyle(seat.status)} transition-colors duration-200 cursor-pointer group relative`}
                          title={`${seat.student.name} - ${seat.student.registrationNumber}`}
                        >
                          <div className="text-xs font-bold mb-1">
                            {seat.seatNumber}
                          </div>
                          <div className="text-xs truncate font-medium">
                            {seat.student.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {seat.student.registrationNumber}
                          </div>
                          
                          {/* Status dropdown on hover */}
                          {onStatusUpdate && (
                            <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white shadow-lg rounded-lg border p-1 z-10">
                              <button
                                onClick={() => handleStatusChange(seat._id, 'present')}
                                className="block w-full text-left px-3 py-1 text-xs hover:bg-green-50 text-green-700 rounded"
                              >
                                Mark Present
                              </button>
                              <button
                                onClick={() => handleStatusChange(seat._id, 'absent')}
                                className="block w-full text-left px-3 py-1 text-xs hover:bg-red-50 text-red-700 rounded"
                              >
                                Mark Absent
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-gray-200 border-dashed rounded-lg p-2 bg-gray-50">
                          <div className="text-xs font-bold mb-1 text-gray-400">
                            {String.fromCharCode(65 + rowIndex)}{colIndex + 1}
                          </div>
                          <div className="text-xs text-gray-400 text-center">
                            Empty
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Allocated</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 border-dashed rounded mr-2"></div>
              <span className="text-sm text-gray-600">Empty</span>
            </div>
          </div>

          {/* Student List for this room */}
          {filteredSeats.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Student List</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSeats.map((seat, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {seat.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {seat.student.registrationNumber} • Seat {seat.seatNumber}
                        </p>
                      </div>
                      {getStatusBadge(seat.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SeatMap;