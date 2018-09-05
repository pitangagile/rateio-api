const express = require('express');
const multer = require('multer');
const router = express.Router();

const fileuploadSchema = require('../models/fileupload');
const manageSchema = require('../models/manage');
const periodSchema = require('../models/period');
const fileuploadController = require('../controller/fileupload')(fileuploadSchema, manageSchema, periodSchema);

// GET
router.get('/api/fileupload', fileuploadController.getAll);
router.get('/api/fileupload/gridlist', fileuploadController.getGridList);
router.get('/api/fileupload/getById', fileuploadController.getById);

// POST
router.post('/api/fileupload', multer().single('file'), fileuploadController.create);

// DELETE
router.delete('/api/fileupload', fileuploadController.remove);

module.exports = router;
