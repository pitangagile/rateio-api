const express = require('express');
const router = express.Router();

const fileuploadSchema = require('../models/fileupload');
const fileuploadController = require('../controller/fileupload')(fileuploadSchema);

router.get('/api/fileupload', fileuploadController.getAll);
router.post('/api/fileupload', fileuploadController.create);
// router.put('/api/fileupload', fileuploadController.update);
// router.delete('/api/fileupload/:id', fileuploadController.delete_center);
//
// router.post('/api/fileupload/createall', fileuploadController.createall);

module.exports = router;
