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
        .skip((limit * page) - limit)
        .limit(limit)
        .populate('reporting')
        .populate('reporting.costCenter')
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

      for (var i = 0; i < manages.length; i++) {
        var manage = manages[i];
        let employee = await employeeSchema.findById(manage.employee._id).exec();
        let originCostCenter = await costCenterSchema.findById(manage.originCostCenter._id).exec();
        let reportings = await reportingSchema.find({'employee': manage.employee._id});

        // Colaborador sem reportagens
        if (reportings.length === 0) {
          var totalHours = await employee.workHours * await calculateTotalBusinessDaysByActivePeriod();

          let newReporting = await new reportingSchema({
            period : period,
            employee: employee,
            costCenter : originCostCenter,
            totalHoursCostCenter: totalHours,
          });

          newReporting.save(function (err) {
            if (err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Created).end();
            }
          });

          manage.reporting = newReporting;

          manage.save(function (err) {
            if (err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Created).end();
            }
          });

        } else {
          let qtdCostCentersReportings = manage.reporting.costCenters.length;

          // Colaborador com 1 reportagem e centro de custo informado igual ao centro de custo de origem.
          if (qtdCostCentersReportings === 1 && manage.reporting.costCenters[0]._id.equals(reportings[0].originCostCenter._id)) {

          }
        }
      }

    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
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

  return {
    getAll: getAll,
    generateManage: generateManage,
    createManageFromEmployees: createManageFromEmployees,
  }
};

module.exports = manageController;
