const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');

router.get('/', allocationController.getAllAllocations);
router.get('/exam/:examId', allocationController.getAllocationByExam);
router.get('/:id', allocationController.getAllocationById);
router.post('/', allocationController.createAllocation);
router.put('/bulk-status', allocationController.bulkUpdateStatus);
router.put('/:id/status', allocationController.updateAllocationStatus);
router.delete('/:id', allocationController.deleteAllocation);

module.exports = router;