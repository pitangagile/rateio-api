const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const authController = require('../controller/auth');

const app = express();
app.use(bodyParser.json());

app.post('/api/auth/regularLogin', authController.regularLogin);
app.post('/api/auth/refreshToken', authController.refreshToken);
app.post('/api/auth/socialLogin', authController.socialLogin);
app.post('/api/auth/validate', authController.validate);

module.exports.routers = serverless(app);
