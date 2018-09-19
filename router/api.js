const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRouter = require('./auth'); // OK
const costcenterRouter = require('./costcenter'); // OK
const employeeRouter = require('./employee'); // OK
const holidayRouter = require('./holiday'); // OK

const periodRouter = require('./period');
const reportingRouter = require('./reporting');
const fileuploadRouter = require('./fileupload'); // OK
const manageRouter = require('./manage');

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
app.use(manageRouter);

module.exports.routers = serverless(app);
