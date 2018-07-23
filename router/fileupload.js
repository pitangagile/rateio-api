const express = require('express');
const multer = require('multer');
const router = express.Router();

const fileuploadSchema = require('../models/fileupload');
const fileuploadController = require('../controller/fileupload')(fileuploadSchema);

router.get('/api/fileupload', fileuploadController.getAll);
router.get('/api/fileupload/gridlist', fileuploadController.getGridList);
router.post('/api/fileupload', multer().single('data'), fileuploadController.create);

module.exports = router;
