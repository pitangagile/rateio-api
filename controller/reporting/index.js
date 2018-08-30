const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');
const moment = require('moment-business-days');

var reportingController = function (reportingSchema, employeeSchema, costCenterSchema, periodSchema) {

  moment.updateLocale('br',
    {
      workingWeekdays: [1, 2, 3, 4, 5]
    }
  );

  async function findAllByActivePeriod(req, res) {
    try {
      await connectToDatabase();

      let data = JSON.parse(req.query.data);

      const limit = parseInt(data.limit);
      const page = parseInt(data.page);

      let period = await periodSchema.findOne({'isActive': true}).exec();

      const queryFind = {
        $and: [
          {'period': period._id},
        ],
        $or : [
          {'employee.name' : {"$regex": data.query, "$options": "i"}},
        ]
      };

      let total = await reportingSchema.find(queryFind).count().exec();

      let items = await reportingSchema
        .find(queryFind)
        .populate('period')
        .populate('costCenter')
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({'code': 1})
        .exec();

      console.log('total > ', total);

      const result = {
        data: items,
        count: total
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function create(req, res) {
    try {
      await connectToDatabase();

      const employee = await employeeSchema.findById(req.body.params.user_id).exec();
      const period = await periodSchema.findById(req.body.params.period._id).exec();
      const costCenter = await costCenterSchema.findById(req.body.params.costCenter._id).exec();

      let reporting = await new reportingSchema(
        {
          'period': period,
          'employee._id': employee._id,
          'employee.name': employee.name,
          'costCenter': costCenter,
          'totalHoursCostCenter': req.body.params.totalHoursCostCenter,
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

  /**
   Edit a employee from settings
   * @param {object} req
   * @param {object} res
   */
  async function edit(req, res) {
    try {
      await connectToDatabase();

      reportingSchema.findById(req.body._id, function (err, entity) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Reportagem não encontrada');
        }
        else {
          entity.totalHoursCostCenter = req.body.totalHoursCostCenter;
          entity.save(function (err) {
            if (err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function del(req, res) {
    try {
      await connectToDatabase();

      let reporting = await reportingSchema
        .findByIdAndRemove(req.query._id)
        .populate('period')
        .populate('employee')
        .exec();

      let employee = await employeeSchema.findById(reporting.employee._id).exec();
      let period = await periodSchema.findById(reporting.period._id).exec();

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

      let data = JSON.parse(req.query.data);

      const limit = parseInt(data.limit);
      const page = parseInt(data.page);

      const queryFind = {
        $and: [
          {"employee._id": req.query.user_id},
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
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function calculateTotalReportingHoursByUserIdAndPerActivePeriod(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.query.user_id).exec();
      var period = await periodSchema.findOne({'isActive': true}).exec();

      var response = await reportingSchema.aggregate([
          {
            $match:
              {
                $and: [
                  {'employee._id': employee._id},
                  {'period': period._id}
                ]
              }
          },
          {
            $group:
              {
                _id: null,
                totalHoursReportingByActivePeriod:
                  {$sum: "$totalHoursCostCenter"}
              },
          },
          {
            $project: {_id: 0, totalHoursReportingByActivePeriod: 1}
          }
        ]
      ).then(function (response, err) {
        if (err)
          console.log('err > ', err);
        return response;
      });

      if (response[0] == undefined) {
        response[0] = {_id: null, totalHoursReportingByActivePeriod: 0}
      }

      const result = {
        data: response[0],
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function findUserCostCenterByUserIdWithoutReportingInPeriod(req, res) {
    try {
      await connectToDatabase();

      let activePeriod = await periodSchema.find({'isActive': true}).exec();

      let reportingsCcs = await reportingSchema.find({
        'employee': req.query.user_id,
        'period': activePeriod
      }, 'costCenter').populate('costCenter').exec();

      let userCostCenters = await employeeSchema.findById(req.query.user_id)
        .sort({code: 1})
        .exec();

      var userIdsCcs = userCostCenters.costCenters;
      var userIdsCcsObjectId = [];
      var reportingIdsCcs = [];
      var idsCcs = [];

      for (var i = 0; i < userIdsCcs.length; i++) {
        userIdsCcsObjectId.push(userIdsCcs[i].toString());
      }

      for (var i = 0; i < reportingsCcs.length; i++) {
        reportingIdsCcs.push(reportingsCcs[i].costCenter._id.toString());
      }

      for (var i = 0; i < userIdsCcs.length; i++) {
        var index = reportingIdsCcs.indexOf(userIdsCcsObjectId[i]);
        if (index < 0) {
          idsCcs.push(userIdsCcsObjectId[i]);
        }
      }

      let response = await costCenterSchema.find({'_id': {$in: idsCcs}}).exec();

      const result = {
        data: response
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  return {
    findAllByActivePeriod: findAllByActivePeriod,
    create: create,
    del: del,
    update: edit,
    findReportsByUserId: findReportsByUserId,
    calculateTotalReportingHoursByUserIdAndPerActivePeriod: calculateTotalReportingHoursByUserIdAndPerActivePeriod,
    findUserCostCenterByUserIdWithoutReportingInPeriod: findUserCostCenterByUserIdWithoutReportingInPeriod,
  }
};

module.exports = reportingController;
