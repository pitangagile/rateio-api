const express = require('express');
const router = express.Router();
const periodController = require('../controller/period');

router.get('/api/period/getAll', periodController.getAll);
router.post('/api/period/create', periodController.create);
router.post('/api/period/delete', periodController.delete_period);
router.post('/api/period/closuredate', periodController.closureDate);
router.post('/api/period/generationdate', periodController.generationDate);

module.exports = router;
