const express = require('express');
const router = express.Router();

const authController = require('../controller/auth');

router.post('/api/auth/regularLogin', authController.regularLogin);
router.post('/api/auth/refreshToken', authController.refreshToken);
router.post('/api/auth/socialLogin', authController.socialLogin);
router.post('/api/auth/validate', authController.validate);

module.exports = router;
