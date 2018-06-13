const express = require('express');
const router = express.Router();

const holidayController = require('../controller/holiday')

router.get('/api/holiday', holidayController.getIndexData);
router.get('/api/holiday/search', holidayController.search);
router.post('/api/holiday/create', holidayController.create);
router.delete('/api/holiday/delete', holidayController.delete_post);
router.put('/api/holiday/update', holidayController.update);

module.exports = router;
