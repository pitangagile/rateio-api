const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

var reportingController = function (reportingSchema, employeeSchema, costCenterSchema, periodSchema) {

  async function create(req, res) {
    try {
      await connectToDatabase();

      const employee = await employeeSchema.findById(req.body.params.user_id).exec();

      let reporting = await new reportingSchema(
        {
          hours: req.body.params.hours,
          employee: employee,
          period: req.body.params.period,
          costCenter: req.body.params.costCenter
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

      let data = JSON.parse(req.query.data);

      const limit = parseInt(data.limit);
      const page = parseInt(data.page);

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
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function getReportingTotalHoursPerActivePeriodAndByUserId(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.query.user_id).exec();
      var period = await periodSchema.findOne({'isActive': true}).exec();

      var response = await reportingSchema.aggregate([
          {
            $match:
              {
                $and: [
                  {'employee': employee._id},
                  {'period': period._id}
                ]
              }
          },
          {
            $group:
              {
                _id: null,
                totalHoursReporting:
                  {$sum: "$hours"}
              },
          },
          {
            $project: {_id: 0, totalHoursReporting: 1}
          }
        ]
      ).then(function (response, err) {
        if (err)
          console.log('err > ', err);
        return response;
      });

      const result = {
        data: response[0]
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
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
      console.log('req > ', req);
      reportingSchema.findById(req.body._id, function (err, entity) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Reportagem não encontrada');
        }
        else {
          console.log('entity > ', entity);
          entity.hours = req.body.hours;
          entity.save(function (err) {
            if (err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      })
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
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
    create: create,
    del: del,
    update: edit,
    findReportsByUserId: findReportsByUserId,
    getReportingTotalHoursPerActivePeriodAndByUserId: getReportingTotalHoursPerActivePeriodAndByUserId,
    findUserCostCenterByUserIdWithoutReportingInPeriod: findUserCostCenterByUserIdWithoutReportingInPeriod
  }
}

module.exports = reportingController;
