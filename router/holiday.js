const express = require('express');
const router = express.Router();

const holidaySchema = require('../models/holiday');
const holidayController = require('../controller/holiday')(holidaySchema);

router.get('/api/holiday', holidayController.getAll);

module.exports = router;
