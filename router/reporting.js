const express = require('express');
const router = express.Router();

const reportingSchema = require('../models/reporting');
const employeeSchema = require('../models/employee');
const costCenterSchema = require('../models/costcenter');

const reportingsController = require('../controller/reporting')
        (reportingSchema, employeeSchema, costCenterSchema);

router.post('/api/reporting', reportingsController.create);
router.get('/api/reporting/findReportsByUserId', reportingsController.findReportsByUserId);

module.exports = router;
