const express = require('express');
const router = express.Router();

const coastCenterSchema = require('../models/coastcenter');
const periodSchema = require('../models/period');
const reportingSchema = require('../models/reporting');
const reportingsController = require('../controller/reporting')
        (reportingSchema, coastCenterSchema, periodSchema);

//router.get('/api/reportings/getAll', reportingsController.getAll);
router.get('/api/reporting/getIndexData', reportingsController.getIndexData);
//router.post('/api/reportings/search', reportingsController.search);
//router.post('/api/reportings/create', reportingsController.create);
//router.post('/api/reportings/update', reportingsController.update);
//router.post('/api/reportings/deletePost', reportingsController.deletePost);

module.exports = router;
