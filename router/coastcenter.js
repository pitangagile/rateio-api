const express = require('express');
const router = express.Router();

const coastCenter = require('../models/coastcenter');
const coastCenterController = require('../controller/coastcenter')(coastCenter);

router.get('/api/coastcenter', coastCenterController.getAll);
router.post('/api/coastcenter', coastCenterController.create);
router.put('/api/coastcenter', coastCenterController.update);
router.delete('/api/coastcenter/:id', coastCenterController.delete_center);

router.get('/api/coastcenter/getById', coastCenterController.getById);

router.post('/api/coastcenter/createall', coastCenterController.createall);

module.exports = router;
