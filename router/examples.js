const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const serverTableController = require('../controller/examples/server-table');

const app = express();
app.use(bodyParser.json());

app.get('/api/examples/table/fetch', serverTableController.fetch);

module.exports.routers = serverless(app);
