const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const holidayController = require('../controller/holiday');

const app = express();
app.use(bodyParser.json());

app.get('/api/holiday', holidayController.getIndexData);
app.post('/api/holiday/search', holidayController.search);
app.post('/api/holiday/create', holidayController.create);
app.post('/api/holiday/delete', holidayController.delete_post);


module.exports.routers = serverless(app);
