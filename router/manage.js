const express = require('express');
const router = express.Router();

const manageSchema = require('../models/manage');
const employeeSchema = require('../models/employee');
const costCenterSchema = require('../models/costcenter');
const periodSchema = require('../models/period');
const reportingSchema = require('../models/reporting');
const holidaySchema = require('../models/holiday');

const manageController = require('../controller/manage')(manageSchema, employeeSchema, costCenterSchema, periodSchema, reportingSchema, holidaySchema);

// GET
router.get('/api/manage', manageController.getAll);
router.get('/api/manage/getAllToDownload', manageController.getAllToDownload);
router.get('/api/manage/generateManage', manageController.generateManage);
router.get('/api/manage/existManageExecuted', manageController.existManageExecuted);

// POST
router.post('/api/manage/createManagesFromFile', manageController.createManagesFromFile);

module.exports = router;
