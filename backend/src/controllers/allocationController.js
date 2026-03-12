const Allocation = require('../models/Allocation');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Exam = require('../models/Exam');
const AllocationAlgorithm = require('../utils/allocationAlgorithm');

exports.getAllAllocations = async (req, res) => {
  try {
    const { examId, roomId, status } = req.query;
    let query = {};

    if (examId) query.exam = examId;
    if (roomId) query.room = roomId;
    if (status) query.status = status;

    const allocations = await Allocation.find(query)
      .populate('student', 'name registrationNumber department year')
      .populate('room', 'roomNumber building capacity')
      .populate('exam', 'examName subject examDate')
      .sort({ 'room.roomNumber': 1, seatNumber: 1 });

    res.json({
      success: true,
      count: allocations.length,
      data: allocations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('student')
      .populate('room')
      .populate('exam');

    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }
    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { examId, studentIds } = req.body;

    // Get exam details
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Get all students
    const students = await Student.find({ _id: { $in: studentIds } });
    
    // Get all available rooms
    const rooms = await Room.find({ isActive: true });

    // Run allocation algorithm
    const result = await AllocationAlgorithm.allocateStudents(
      students,
      rooms,
      examId
    );

    res.status(201).json({
      success: true,
      message: 'Allocation completed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAllocationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allocation = await Allocation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }

    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }
    res.json({ success: true, message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllocationByExam = async (req, res) => {
  try {
    const allocations = await Allocation.find({ exam: req.params.examId })
      .populate('student')
      .populate('room')
      .sort({ 'room.roomNumber': 1, seatNumber: 1 });

    // Group by room for seat map
    const roomMap = {};
    allocations.forEach(allocation => {
      const roomId = allocation.room._id.toString();
      if (!roomMap[roomId]) {
        roomMap[roomId] = {
          room: allocation.room,
          seats: []
        };
      }
      roomMap[roomId].seats.push({
        seatNumber: allocation.seatNumber,
        student: allocation.student,
        status: allocation.status
      });
    });

    res.json({
      success: true,
      data: Object.values(roomMap)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { allocations } = req.body; // Array of { id, status }

    const updatePromises = allocations.map(a => 
      Allocation.findByIdAndUpdate(a.id, { status: a.status })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Bulk update completed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};