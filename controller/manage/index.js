const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const moment = require('moment-business-days');

var manageController = function (manageSchema, employeeSchema, costCenterSchema, periodSchema, reportingSchema, holidaySchema) {

  moment.updateLocale('br',
    {
      workingWeekdays: [1, 2, 3, 4, 5]
    }
  );

  async function getAll(req, res) {
    try {
      await connectToDatabase();

      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      let period = await periodSchema.findOne({'isActive': true}).exec();

      let queryFind = {
        $and: [
          {
            'period.name': period.name,
          }
        ],
        $or: [
          {
            'employee.name':
              {"$regex": req.query.query, "$options": "i"}
          }
        ]
      };

      var total = await manageSchema
        .find(queryFind)
        .count()
        .exec();

      var items = await manageSchema
        .find(queryFind)
        .limit(limit)
        .skip((limit * page) - limit)
        .sort({'employee.name': 1})
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

  async function createManageFromEmployees(req, res) {
    try {
      await connectToDatabase();

      let data = req.body.params.employees;

      for (var i = 0; i < data.length; i++) {

        let period = await periodSchema.findOne({'isActive': true}).exec();
        let employee = await employeeSchema.findOne({'registration': data[i]['MATR']}).exec();
        let costCenter = await costCenterSchema.findOne({'code': data[i]['COD CC ORIG']}).exec();

        let newManageEmployee = new manageSchema({
          'period.description': period.description,
          'employee._id': employee._id,
          'employee.name': employee.name,
          'originCostCenter._id': costCenter._id,
          'originCostCenter.description': costCenter.description,
        });

        await newManageEmployee.save(function (err) {
          if (err) {
            res.status(httpStatus.InternalServerError).send('Erro: ' + err);
          }
          else {
            res.status(httpStatus.Created).end();
          }
        });
      }

    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function updatePeriod(period, res) {
    period.initialManageExecuted = true;
    await period.save(function (err) {
      if (err) {
        res.status(httpStatus.InternalServerError).send('Erro: ' + err);
      }
      else {
        res.status(httpStatus.Created).end();
      }
    });
  }

  async function generateManage(req, res) {
    try {
      await connectToDatabase();

      let period = await periodSchema.findOne({'isActive': true}).exec();

      const queryFind = {
        $and: [
          {
            'period.name': period.name,
          }
        ],
      };

      let manages = await manageSchema
        .find(queryFind)
        .populate('reporting')
        .exec();

      const qtdManages = manages.length;

      for (var i = 0; i < qtdManages; i++) {
        var manageFromSpreadSheet = manages[i];

        let employee = await employeeSchema.findById(manageFromSpreadSheet.employee._id).exec();
        let originCostCenter = await costCenterSchema.findById(manageFromSpreadSheet.originCostCenter._id).exec();
        let reportings = await reportingSchema.find({'employee._id': manageFromSpreadSheet.employee._id}).populate('costCenter').exec();

        let qtdCostCentersOfEmployee = await costCenterSchema.find({'employee': employee._id}).count().exec();
        let userCostCenters = await costCenterSchema.find({'employee': employee._id}).exec();
        let qtdReportingsOfEmployee = await reportingSchema.find({'employee._id': manageFromSpreadSheet.employee._id}).count().exec();

        var idealHours = await employee.workHours * await calculateTotalBusinessDaysByActivePeriod();

        // Usuário sem reportagens
        if (qtdReportingsOfEmployee === 0) {
          if (qtdCostCentersOfEmployee === 0) {
            let destinyCostCenter = originCostCenter;
            await generateAndSaveManage(manageFromSpreadSheet, destinyCostCenter, idealHours, res);
          }

          else if (qtdCostCentersOfEmployee === 1) {
            let destinyCostCenter = userCostCenters[0];
            await generateAndSaveManage(manageFromSpreadSheet, destinyCostCenter, idealHours, res);
          }

          else if (qtdCostCentersOfEmployee > 1) {
            for (var i = 0; i < userCostCenters.length; i++) {
              let destinyCostCenter = userCostCenters[i];
              await generateAndSaveManage(manageFromSpreadSheet, destinyCostCenter, idealHours, res);
            }
          }
        }
        // Usuário com reportagens
        else {
          // qtdReportings === 1
          if (qtdReportingsOfEmployee === 1) {
            let destinyCostCenter = reportings[0].costCenter;
            let reportingHours = reportings[0].totalHoursCostCenter;

            // CC origem === CC destino
            if (originCostCenter._id === destinyCostCenter._id) {
              await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, reportingHours, res);
            }
            // CC origem !== CC destino
            else {
              //  reportingHours < idealHours
              if (reportingHours < idealHours) {
                await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, reportingHours, res);
                await generateAndSaveManage(manageFromSpreadSheet, destinyCostCenter, await (idealHours - reportingHours), res);
              }
              // reportingHours >= idealHours
              else {
                await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, reportingHours, res);
              }
            }
          }
          // qtdReportings > 1
          else {
            let totalReportingHours = await calculateTotalReportingHoursByUserIdAndPerActivePeriod(employee._id);

            console.log('idealHours > ', idealHours);
            console.log('totalReportingHours > ', totalReportingHours);

            // idealHours < totalReportingHours
            if (totalReportingHours < idealHours) {
              var hoursNotReporting = await (idealHours - totalReportingHours);
              await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, hoursNotReporting, res);
            }

            for (var j = 0; j < qtdReportingsOfEmployee; j++) {
              let newManageEmployee = await new manageSchema({
                'period.description': period.description,
                'employee._id': employee._id,
                'employee.name': employee.name,
                'originCostCenter._id': originCostCenter._id,
                'originCostCenter.description': originCostCenter.description,
              });
              await generateAndSaveManage(newManageEmployee, reportings[j].costCenter, reportings[j].totalHoursCostCenter, res);
            }
          }
        }
        await updatePeriod(period, res);
      }
      res.status(httpStatus.Created).end();
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function generateAndSaveManage(manage, destinyCostCenter, hours, res) {

    manage.destinyCostCenter._id = destinyCostCenter._id;
    manage.destinyCostCenter.description = destinyCostCenter.description;
    manage.hours = hours;

    var result = await manage.save(function (err) {
      if (err) {
        res.status(httpStatus.InternalServerError).send('Erro: ' + err);
      }
      else {
        res.status(httpStatus.Created).end();
      }
    });
    return result;
  }

  async function calculateTotalBusinessDaysByActivePeriod() {
    try {
      await connectToDatabase();

      var period = await periodSchema.findOne({'isActive': true}).exec();

      var qtdBusinessDays = moment(period.finalDate, 'YYYY-MM-DD').businessDiff(moment(period.initialDate, 'YYYY-MM-DD'));
      var absQtdBusinessDays = qtdBusinessDays - await getQtdFullHolidaysInActivePeriod() - (0.5 * await getQtdHalfHolidaysInActivePeriod());

      return absQtdBusinessDays;
    } catch (e) {
      console.error('Erro: ' + e);
    }
  }

  async function getQtdHalfHolidaysInActivePeriod() {
    try {
      await connectToDatabase();

      let period = await periodSchema.findOne({'isActive': true}).exec();

      const queryFindHalfHolidays = {
        $and: [
          {'percentageWorked': [50]},
        ],
        'date': {'$gte': period.initialDate, '$lt': period.finalDate}
      };

      var halfHolidays = await holidaySchema.find(queryFindHalfHolidays).exec();

      var qtdBusinessDaysAndHalfHolidays = 0;

      for (var i = 0; i < halfHolidays.length; i++) {
        if (moment(halfHolidays[i].date, 'YYYY-MM-DD').isBusinessDay()) {
          qtdBusinessDaysAndHalfHolidays += 1;
        }
      }

      return qtdBusinessDaysAndHalfHolidays;
    } catch (e) {
      console.error('Erro: ' + e);
    }
  }

  async function getQtdFullHolidaysInActivePeriod() {
    try {
      await connectToDatabase();

      let period = await periodSchema.findOne({'isActive': true}).exec();

      const queryFindFullHolidays = {
        $and: [
          {'percentageWorked': [0]},
        ],
        'date': {'$gte': period.initialDate, '$lt': period.finalDate}
      };
      var fullHolidays = await holidaySchema.find(queryFindFullHolidays).exec();

      var qtdBusinessDaysAndFullHolidays = 0;

      for (var i = 0; i < fullHolidays.length; i++) {
        if (moment(fullHolidays[i].date, 'YYYY-MM-DD').isBusinessDay()) {
          qtdBusinessDaysAndFullHolidays += 1;
        }
      }

      return qtdBusinessDaysAndFullHolidays;

    } catch (e) {
      console.error('Erro: ' + e);
    }
  }

  async function existManageExecuted(req, res) {
    try {
      await connectToDatabase();

      const queryFind = {
        $and:
          [
            {'isActive': true},
            {'initialManageExecuted': true}
          ]
      };
      let period = await periodSchema.findOne(queryFind).exec();

      console.log(period);

      if (period) {
        res.status(httpStatus.Ok).json(true);
      } else {
        res.status(httpStatus.Ok).json(false);
      }
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function calculateTotalReportingHoursByUserIdAndPerActivePeriod(user_id) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(user_id).exec();
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
        return 0;
      } else {
        return response[0].totalHoursReportingByActivePeriod;
      }
    } catch (err) {
      console.log('err > ', err);
    }
  }

  return {
    getAll: getAll,
    generateManage: generateManage,
    createManageFromEmployees: createManageFromEmployees,
    existManageExecuted: existManageExecuted
  }
};

module.exports = manageController;
