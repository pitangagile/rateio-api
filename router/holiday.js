const express = require('express');
const router = express.Router();
const holidayController = require('../controller/holiday');

router.get('/api/holiday', holidayController.getIndexData);
router.post('/api/holiday/search', holidayController.search);
router.post('/api/holiday/create', holidayController.create);
router.post('/api/holiday/delete', holidayController.delete_post);
router.post('/api/holiday/update', holidayController.update);

module.exports = router;
