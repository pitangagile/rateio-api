const express = require('express');
const router = express.Router();

const manageSchema = require('../models/manage');
const employeeSchema = require('../models/employee');
const costCenterSchema = require('../models/costcenter');
const periodSchema = require('../models/costcenter');

const manageController = require('../controller/manage')(manageSchema, employeeSchema, costCenterSchema);

router.get('/api/manage', manageController.getAll);
router.post('/api/manage/createManageFromEmployees', manageController.createManageFromEmployees);

module.exports = router;
