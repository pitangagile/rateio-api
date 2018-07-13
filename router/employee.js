const express = require('express');
const router = express.Router();

const employeeSchema = require('../models/employee');
const employeeController = require('../controller/employee')(employeeSchema);

router.get('/api/employee', employeeController.getAll);
router.get('/api/employee/gridlist', employeeController.getGridList);
router.post('/api/employee', employeeController.create);
router.put('api/employee', employeeController.update);
router.delete('/api/employee', employeeController.delete);

module.exports = router;
