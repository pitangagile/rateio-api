const express = require('express');
const router = express.Router();

const periodSchema = require('../models/period');
const periodController = require('../controller/period')(periodSchema);

router.get('/api/period', periodController.getAll);
router.post('/api/period', periodController.create);
//router.put('/api/period', periodController.update);
router.delete('/api/period', periodController.delete_period);
// router.post('/api/period/closuredate', periodController.closureDate);
// router.post('/api/period/generationdate', periodController.generationDate);

module.exports = router;
