const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

var reportingController = function (reportingSchema, employeeSchema, costCenterSchema) {

  async function create(req, res) {
    try {
      await connectToDatabase();

      const employee =  await employeeSchema.findById(req.body.params.user_id).exec();

      let reporting = await new reportingSchema(
        {
          hours: req.body.params.hours,
          employee: employee,
          period : req.body.params.period,
          costCenter : req.body.params.costCenter
        });

      reporting.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Created).end();
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function del(req, res) {
    try {
      await connectToDatabase();

      await reportingSchema.findByIdAndRemove(req.query._id).exec().then(function (response, err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Ok).end();
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function findReportsByUserId(req, res) {
    try {
      await connectToDatabase();

      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      const queryFind = {
        $and: [
          {"employee": req.query.user_id},
        ]
      };

      let total = await reportingSchema.find(queryFind).count().exec();

      let items = await reportingSchema.find(queryFind)
        .populate('period')
        .populate('costCenter')
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({code: 1})
        .exec();

      const result = {
        data: items,
        count: total
      }

      res.status(httpStatus.Ok).json(result);
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  return {
    create : create,
    del: del,
    findReportsByUserId: findReportsByUserId
  }
}

module.exports = reportingController;
