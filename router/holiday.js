const express = require('express');
const router = express.Router();

const holidaySchema = require('../models/holiday');
const holidayController = require('../controller/holiday')(holidaySchema);

router.get('/api/holiday', holidayController.getIndexData);
router.get('/api/holiday/search', holidayController.search);
router.post('/api/holiday', holidayController.create);
router.delete('/api/holiday', holidayController.del);
router.put('/api/holiday', holidayController.update);

module.exports = router;
