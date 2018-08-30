const express = require('express');
const router = express.Router();

const employeeSchema = require('../models/employee');
const costCenterSchema = require('../models/costcenter');

const employeeController = require('../controller/employee')(employeeSchema, costCenterSchema);

router.get('/api/employee', employeeController.getAll);
router.get('/api/employee/findEmployeeById', employeeController.findEmployeeById);
router.get('/api/employee/findEmployeeByEmail', employeeController.findEmployeeByEmail);
router.get('/api/employee/gridlist', employeeController.getGridList);
router.post('/api/employee', employeeController.create);
router.put('/api/employee', employeeController.update);
router.delete('/api/employee', employeeController.delete);

router.get('/api/employee/findUserCostCentersByUserId', employeeController.findUserCostCentersByUserId);
router.get('/api/employee/findCostCentersWithoutUserId', employeeController.findCostCentersWithoutUserId);
router.post('/api/employee/addCostCenter', employeeController.addCostCenter);

router.get('/api/employee/validateAllEmployeesFromSpreadsheet', employeeController.validateAllEmployeesFromSpreadsheet);

module.exports = router;
