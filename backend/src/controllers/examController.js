const Exam = require('../models/Exam');
const Allocation = require('../models/Allocation');

exports.getAllExams = async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (fromDate || toDate) {
      query.examDate = {};
      if (fromDate) query.examDate.$gte = new Date(fromDate);
      if (toDate) query.examDate.$lte = new Date(toDate);
    }

    const exams = await Exam.find(query).sort({ examDate: -1 });
    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    // First delete all allocations for this exam
    await Allocation.deleteMany({ exam: req.params.id });
    
    // Then delete the exam
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Exam and related allocations deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExamStats = async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const scheduledExams = await Exam.countDocuments({ status: 'scheduled' });
    const completedExams = await Exam.countDocuments({ status: 'completed' });
    
    const upcomingExams = await Exam.find({
      examDate: { $gte: new Date() },
      status: 'scheduled'
    }).sort({ examDate: 1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalExams,
        scheduledExams,
        completedExams,
        upcomingExams
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};