const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const reportingsController = require('../controller/reporting');

const app = express();
app.use(bodyParser.json());

app.get('/api/reportings', reportingsController.getIndexData);
app.get('/api/reportings/getAll', reportingsController.getAll);
app.post('/api/reportings/search', reportingsController.search);
app.post('/api/reportings/create', reportingsController.create);
app.post('/api/reportings/update', reportingsController.update);
app.post('/api/reportings/deletePost', reportingsController.deletePost);


module.exports.routers = serverless(app);
