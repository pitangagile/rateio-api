const express = require('express');
const router = express.Router();

const periodSchema = require('../models/period');
const holidaySchema = require('../models/holiday');
const fileUploadSchema = require('../models/fileupload');

const periodController = require('../controller/period')(periodSchema, holidaySchema, fileUploadSchema);

router.get('/api/period', periodController.getAll);
router.get('/api/period/findAllPeriods', periodController.findAllPeriods);
router.get('/api/period/pickActivePeriod', periodController.pickActivePeriod);
router.get('/api/period/calculateTotalBusinessDaysByActivePeriod', periodController.calculateTotalBusinessDaysByActivePeriod);
router.get('/api/period/getQtdHalfHolidaysInActivePeriod', periodController.getQtdHalfHolidaysInActivePeriod);
router.get('/api/period/getQtdFullHolidaysInActivePeriod', periodController.getQtdFullHolidaysInActivePeriod);
router.get('/api/period/findAllPeriodsWithoutFile', periodController.findAllPeriodsWithoutFile);

module.exports = router;
