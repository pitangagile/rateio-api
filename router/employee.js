const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const employeeController = require('../controller/employee');

const app = express();

app.use(bodyParser.json());

app.post('/api/employee/createall', employeeController.createall);

module.exports.routers = serverless(app);
