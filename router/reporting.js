const express = require('express');
const router = express.Router();

const reportingSchema = require('../models/reporting');
const employeeSchema = require('../models/employee');
const costCenterSchema = require('../models/costcenter');
const periodSchema = require('../models/period');

const reportingsController = require('../controller/reporting')
        (reportingSchema, employeeSchema, costCenterSchema, periodSchema);

router.post('/api/reporting', reportingsController.create);
router.put('/api/reporting', reportingsController.update);
router.delete('/api/reporting', reportingsController.del);
router.get('/api/reporting/findReportsByUserId', reportingsController.findReportsByUserId);
router.get('/api/reporting/getReportingTotalHoursPerActivePeriodAndByUserId', reportingsController.getReportingTotalHoursPerActivePeriodAndByUserId);
router.get('/api/reporting/findUserCostCenterByUserIdWithoutReportingInPeriod', reportingsController.findUserCostCenterByUserIdWithoutReportingInPeriod);

module.exports = router;
