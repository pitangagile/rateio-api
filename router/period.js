const express = require('express');
const router = express.Router();

const periodSchema = require('../models/period');
const holidaySchema = require('../models/holiday');
const fileUploadSchema = require('../models/fileupload');
const manageSchema = require('../models/manage');
const reportingSchema = require('../models/reporting');

const periodController = require('../controller/period')(periodSchema, holidaySchema, fileUploadSchema, manageSchema, reportingSchema);

router.get('/api/period', periodController.getAll);
router.get('/api/period/findAllPeriods', periodController.findAllPeriods);
router.get('/api/period/pickActivePeriod', periodController.pickActivePeriod);
router.get('/api/period/calculateTotalBusinessDaysByActivePeriod', periodController.calculateTotalBusinessDaysByActivePeriod);
router.get('/api/period/getQtdHalfHolidaysInActivePeriod', periodController.getQtdHalfHolidaysInActivePeriod);
router.get('/api/period/getQtdFullHolidaysInActivePeriod', periodController.getQtdFullHolidaysInActivePeriod);
router.get('/api/period/findAllPeriodsWithoutFile', periodController.findAllPeriodsWithoutFile);
router.get('/api/period/findByDescription', periodController.findByDescription);

router.post('/api/period', periodController.create);

router.delete('/api/period', periodController.remove);

module.exports = router;
