const express = require('express');
const router = express.Router();
const coastCenterController = require('../controller/coastcenter');

router.get('/api/coastcenter/getAll', coastCenterController.getAll);
router.post('/api/coastcenter/create', coastCenterController.create);
router.post('/api/coastcenter/delete', coastCenterController.delete_center);
router.post('/api/coastcenter/edit', coastCenterController.edit);
router.post('/api/coastcenter/createall', coastCenterController.createall);

module.exports = router;
