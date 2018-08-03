const express = require('express');
const router = express.Router();

const employeeSchema = require('../models/employee');
const coastCenterSchema = require('../models/coastcenter');

const employeeController = require('../controller/employee')(employeeSchema, coastCenterSchema);

router.get('/api/employee', employeeController.getAll);
router.get('/api/employee/gridlist', employeeController.getGridList);
router.post('/api/employee', employeeController.create);
router.put('api/employee', employeeController.update);
router.delete('/api/employee', employeeController.delete);

router.get('/api/employee/findUserCoastCentersByUserId', employeeController.findUserCoastCentersByUserId);
router.get('/api/employee/findCoastCentersWithoutUserId', employeeController.findCoastCentersWithoutUserId);
router.post('/api/employee/addCoastCenter', employeeController.addCoastCenter);

module.exports = router;
