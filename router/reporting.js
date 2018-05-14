const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const reportingsController = require('../controller/reportings');

const app = express();
app.use(bodyParser.json());

app.get('/api/reportings', reportingController.getIndexData);
app.post('/api/reportings/search', reportingController.search);
app.post('/api/reportings/create', reportingController.create);


module.exports.routers = serverless(app);
