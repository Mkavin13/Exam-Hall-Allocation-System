import React, { useState, useEffect } from 'react';
import { allocationAPI, examAPI } from '../services/api';
import AllocationForm from '../components/Allocation/AllocationForm';
import SeatMap from '../components/Allocation/SeatMap';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchAllocations(selectedExam);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAll();
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    }
  };

  const fetchAllocations = async (examId) => {
    try {
      setLoading(true);
      const response = await allocationAPI.getByExam(examId);
      setAllocations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (allocationData) => {
    try {
      await allocationAPI.create(allocationData);
      toast.success('Allocation completed successfully');
      setShowAllocationForm(false);
      fetchAllocations(selectedExam);
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast.error('Failed to create allocation');
    }
  };

  const handleStatusUpdate = async (seatId, newStatus) => {
    try {
      await allocationAPI.updateStatus(seatId, newStatus);
      toast.success(`Student marked as ${newStatus}`);
      fetchAllocations(selectedExam);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportToExcel = () => {
    const exportData = allocations.flatMap(roomAlloc => 
      roomAlloc.seats.map(seat => ({
        'Room': roomAlloc.room.roomNumber,
        'Building': roomAlloc.room.building,
        'Seat Number': seat.seatNumber,
        'Student Name': seat.student.name,
        'Registration No': seat.student.registrationNumber,
        'Department': seat.student.department,
        'Year': seat.student.year,
        'Status': seat.status
      }))
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Allocations');
    XLSX.writeFile(wb, `allocations_${selectedExam}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const exam = exams.find(e => e._id === selectedExam);
    
    doc.setFontSize(18);
    doc.text('Exam Hall Allocation Report', 14, 22);
    
    if (exam) {
      doc.setFontSize(12);
      doc.text(`Exam: ${exam.examName} - ${exam.subject}`, 14, 32);
      doc.text(`Date: ${new Date(exam.examDate).toLocaleDateString()}`, 14, 38);
    }
    
    let yOffset = 50;
    
    allocations.forEach((roomAlloc, index) => {
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Room: ${roomAlloc.room.roomNumber} (${roomAlloc.room.building})`, 14, yOffset);
      yOffset += 10;
      
      const tableData = roomAlloc.seats.map(seat => [
        seat.seatNumber,
        seat.student.registrationNumber,
        seat.student.name,
        seat.student.department,
        seat.status
      ]);
      
      doc.autoTable({
        startY: yOffset,
        head: [['Seat', 'Reg No', 'Name', 'Dept', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });
      
      yOffset = doc.lastAutoTable.finalY + 15;
    });
    
    doc.save(`allocations_${selectedExam}.pdf`);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Exam Allocations</h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedExam && (
            <>
              <button
                onClick={exportToExcel}
                className="btn-secondary inline-flex items-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="btn-secondary inline-flex items-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export PDF
              </button>
            </>
          )}
          <button
            onClick={() => setShowAllocationForm(true)}
            className="btn-primary"
          >
            New Allocation
          </button>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Exam
        </label>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="input-field max-w-md"
        >
          <option value="">Choose an exam...</option>
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>
              {exam.examName} - {exam.subject} ({new Date(exam.examDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {/* Seat Maps */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        selectedExam && (
          <div className="space-y-6">
            {allocations.map((roomAlloc, index) => (
              <SeatMap
                key={index}
                room={roomAlloc.room}
                seats={roomAlloc.seats}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )
      )}

      {/* Allocation Form Modal */}
      {showAllocationForm && (
        <AllocationForm
          onClose={() => setShowAllocationForm(false)}
          onSave={handleAllocate}
          exams={exams}
        />
      )}
    </div>
  );
}

export default Allocations;