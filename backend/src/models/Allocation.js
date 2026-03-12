const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  row: Number,
  column: Number,
  status: {
    type: String,
    enum: ['allocated', 'present', 'absent'],
    default: 'allocated'
  },
  allocatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one student per exam
allocationSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', allocationSchema);