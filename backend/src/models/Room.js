const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 10
  },
  isLab: {
    type: Boolean,
    default: false
  },
  hasProjector: Boolean,
  hasAC: Boolean,
  hasWheelchairAccess: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    required: true
  },
  columns: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);