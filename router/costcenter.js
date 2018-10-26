const express = require('express');
const router = express.Router();

const costCenter = require('../models/costcenter');
const costCenterController = require('../controller/costcenter')(costCenter);

router.get('/api/costcenter', costCenterController.getAll);
router.get('/api/costcenter/findAllCostCenters', costCenterController.findAllCostCenters);
router.get('/api/costcenter/findById', costCenterController.findById);

router.put('/api/costcenter', costCenterController.update);

router.post('/api/costcenter', costCenterController.create);
router.post('/api/costcenter/createall', costCenterController.createall);

router.delete('/api/costcenter/:id', costCenterController.delete_center);

module.exports = router;
