const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const holidayController = require('../controller/holiday');

const app = express();
app.use(bodyParser.json());

app.get('/api/holiday', holidayController.getIndexData);
app.get('/api/holiday/getAll', holidayController.getAll);
app.post('/api/holiday/create', holidayController.create);


module.exports.routers = serverless(app);
