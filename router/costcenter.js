const express = require('express');
const router = express.Router();

const costCenter = require('../models/costcenter');
const costCenterController = require('../controller/costcenter')(costCenter);

router.get('/api/costcenter', costCenterController.getAll);
router.post('/api/costcenter', costCenterController.create);
router.put('/api/costcenter', costCenterController.update);
router.delete('/api/costcenter/:id', costCenterController.delete_center);

router.get('/api/costcenter/findById', costCenterController.findById);

router.post('/api/costcenter/createall', costCenterController.createall);

module.exports = router;
