const express = require('express');
const router = express.Router();

const periodSchema = require('../models/period');
const holidaySchema = require('../models/holiday');

const periodController = require('../controller/period')(periodSchema, holidaySchema);

router.get('/api/period', periodController.getAll);
router.get('/api/period/findAllPeriods', periodController.findAllPeriods);
router.get('/api/period/pickActivePeriod', periodController.pickActivePeriod);
router.get('/api/period/calculateTotalBusinessDaysByActivePeriod', periodController.calculateTotalBusinessDaysByActivePeriod);
router.get('/api/period/getQtdHalfHolidaysInActivePeriod', periodController.getQtdHalfHolidaysInActivePeriod);
router.get('/api/period/getQtdFullHolidaysInActivePeriod', periodController.getQtdFullHolidaysInActivePeriod);

module.exports = router;
