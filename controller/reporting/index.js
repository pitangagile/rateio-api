const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes');
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');
const moment = require('moment-business-days');

var reportingController = function (reportingSchema, employeeSchema, costCenterSchema, periodSchema) {

  moment.updateLocale('pt',
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
        $or: [
          {'employee.name': {"$regex": data.query, "$options": "i"}},
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
          'isPerDiscipline': req.body.params.isPerDiscipline,
          'discipline.req': req.body.params.discipline.req,
          'discipline.aep': req.body.params.discipline.aep,
          'discipline.imple': req.body.params.discipline.imple,
          'discipline.tst': req.body.params.discipline.tst,
          'discipline.peg': req.body.params.discipline.peg,
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

      console.log('req > ', req);

      reportingSchema.findById(req.body._id, function (err, entity) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Reportagem não encontrada');
        }
        else {
          entity.discipline.req = req.body.discipline.req;
          entity.discipline.aep = req.body.discipline.aep;
          entity.discipline.imple = req.body.discipline.imple;
          entity.discipline.tst = req.body.discipline.tst;
          entity.discipline.peg = req.body.discipline.peg;
          entity.isPerDiscipline = req.body.isPerDiscipline;
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

      let period = await periodSchema.find({'isActive': true}).exec();

      let employee = await employeeSchema.findById(req.query.user_id).exec();

      var response = [];

      for (var i = 0; i < employee.costCenters.length; i++) {

        const queryFind = {
          $and: [
            {'employee._id': req.query.user_id},
            {'period': period},
            {'costCenter': employee.costCenters[i]}
          ]
        };

        let reporting = await reportingSchema.findOne(queryFind).exec();

        console.log('reporting > ', reporting);

        if (!reporting) {
          let costCenter = await costCenterSchema.findById(employee.costCenters[i]);
          response.push(costCenter);
        }
      }

      const result = {
        data: response
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function findReportingHoursDisciplinePerCostCenter(req, res) {
    try {
      await connectToDatabase();

      let period = JSON.parse(req.query.period);
      let costCenter = JSON.parse(req.query.costCenter);

      var response = await reportingSchema.aggregate([
          {
            $match:
              {
                $and: [
                  {'costCenter': mongoose.Types.ObjectId(costCenter._id)},
                  {'period': mongoose.Types.ObjectId(period._id)}
                ]
              }
          },
          {
            $group:
              {
                _id: null,
                totalReq: {$sum: "$discipline.req"},
                totalAep: {$sum: "$discipline.aep"},
                totalImple: {$sum: "$discipline.imple"},
                totalTst: {$sum: "$discipline.tst"},
                totalPeg: {$sum: "$discipline.peg"},
              },
          },
          {
            $project: {_id: 0, totalReq: 1, totalAep: 2, totalImple: 3, totalTst: 4, totalPeg: 5}
          }
        ]
      ).exec();

      console.log('response > ', response);

      if (!response[0]) {
        const result = {
          data: [{totalReq: 0, totalAep: 0, totalImple: 0, totalTst: 0, totalPeg: 0}],
        };
        res.status(httpStatus.Ok).json(result);
      } else {
        const result = {
          data: response,
        };
        res.status(httpStatus.Ok).json(result);
      }
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function findReportingHoursEmployeePerCostCenter(req, res) {
    try {
      await connectToDatabase();

      let period = JSON.parse(req.query.period);
      let costCenter = JSON.parse(req.query.costCenter);

      var response = await reportingSchema.aggregate([
          {
            $match:
              {
                $and: [
                  {'costCenter': mongoose.Types.ObjectId(costCenter._id)},
                  {'period': mongoose.Types.ObjectId(period._id)}
                ]
              }
          },
          {
            $group:
              {
                _id: "$employee.name",
                hours: {$sum: "$totalHoursCostCenter"},
              },
          }
        ]
      ).exec();

      const result = {
        data: response,
      };
      res.status(httpStatus.Ok).json(result);

    }catch (e) {
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
    findReportingHoursDisciplinePerCostCenter: findReportingHoursDisciplinePerCostCenter,
    findReportingHoursEmployeePerCostCenter : findReportingHoursEmployeePerCostCenter,
  }
};

module.exports = reportingController;
