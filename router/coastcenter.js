const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const coastCenterController = require('../controller/coastcenter');

const app = express();
app.use(bodyParser.json());

app.get('/api/coastcenter/getAll', coastCenterController.getAll);
app.post('/api/coastcenter/create', coastCenterController.create);
app.post('/api/coastcenter/delete', coastCenterController.delete_center);
app.post('/api/coastcenter/edit', coastCenterController.edit);
app.post('/api/coastcenter/createall', coastCenterController.createall);

module.exports.routers = serverless(app);
