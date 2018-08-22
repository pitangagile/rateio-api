const express = require('express');
const router = express.Router();

const manageSchema = require('../models/manage');
const manageController = require('../controller/manage')(manageSchema);

router.get('/api/manage', manageController.getAll);

module.exports = router;
