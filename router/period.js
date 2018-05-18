const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const coastCenterController = require('../controller/coastcenter');

const app = express();
app.use(bodyParser.json());



module.exports.routers = serverless(app);
