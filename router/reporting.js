const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const reportingsController = require('../controller/reportings');

const app = express();
app.use(bodyParser.json());

app.get('/api/reporting', reportingController.getIndexData);
app.post('/api/reporting/search', reportingController.search);
app.post('/api/reporting/create', reportingController.create);


module.exports.routers = serverless(app);
