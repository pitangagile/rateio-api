const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employee');

router.post('/api/employee/createall', employeeController.createall);
router.get('/api/employee/getall', employeeController.getAll);

module.exports = router;
