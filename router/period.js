const express = require('express');
const router = express.Router();

const periodSchema = require('../models/period');
const periodController = require('../controller/period')(periodSchema);

router.get('/api/period', periodController.getAll);
router.post('/api/period', periodController.create);
router.delete('/api/period/:id', periodController.delete_period);
router.get('/api/period/pickActivePeriod', periodController.pickActivePeriod);

module.exports = router;
