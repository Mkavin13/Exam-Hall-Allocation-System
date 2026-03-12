const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const examRoutes = require('./routes/examRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const authRoutes = require('./routes/authRoutes');
const Admin = require('./models/Admin');

const app = express();

// Connect to database and seed default admin
connectDB().then(async () => {
  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.create({ username: 'admin', password: 'admin123', name: 'Admin User' });
    console.log('Default admin created: username=admin password=admin123');
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/allocations', allocationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});