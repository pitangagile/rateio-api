const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const periodController = require('../controller/period');

const app = express();
app.use(bodyParser.json());

app.get('/api/period/getAll', periodController.getAll);
app.post('/api/period/create', periodController.create);
app.post('/api/period/delete', periodController.delete_period);

module.exports.routers = serverless(app);
