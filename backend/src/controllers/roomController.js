const Room = require('../models/Room');

exports.getAllRooms = async (req, res) => {
  try {
    const { building, isLab, isActive } = req.query;
    let query = {};

    if (building) query.building = building;
    if (isLab) query.isLab = isLab === 'true';
    if (isActive) query.isActive = isActive === 'true';

    const rooms = await Room.find(query).sort({ building: 1, floor: 1, roomNumber: 1 });
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        error: 'Room number already exists' 
      });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });
    const totalCapacity = await Room.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$capacity' } } }
    ]);

    const roomsByBuilding = await Room.aggregate([
      { $group: { _id: '$building', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalRooms,
        activeRooms,
        totalCapacity: totalCapacity[0]?.total || 0,
        roomsByBuilding
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};