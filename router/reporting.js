const express = require('express');
const router = express.Router();
const reportingsController = require('../controller/reporting');

router.get('/api/reportings', reportingsController.getIndexData);
router.get('/api/reportings/getAll', reportingsController.getAll);
router.post('/api/reportings/search', reportingsController.search);
router.post('/api/reportings/create', reportingsController.create);
router.post('/api/reportings/update', reportingsController.update);
router.post('/api/reportings/deletePost', reportingsController.deletePost);

module.exports = router;
