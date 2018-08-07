const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRouter = require('./auth');
const costcenterRouter = require('./costcenter');
const employeeRouter = require('./employee');
const holidayRouter = require('./holiday');
const periodRouter = require('./period');
const reportingRouter = require('./reporting');
const fileuploadRouter = require('./fileupload');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(authRouter);
app.use(costcenterRouter);
app.use(employeeRouter);
app.use(holidayRouter);
app.use(periodRouter);
app.use(reportingRouter);
app.use(fileuploadRouter);

module.exports.routers = serverless(app);
