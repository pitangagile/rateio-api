const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const moment = require('moment-business-days');

var manageController = function (manageSchema, employeeSchema, costCenterSchema, periodSchema, reportingSchema, holidaySchema, fileUploadSchema) {

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

      if (period === null || period === undefined){
        const result = {
          data: [],
          count: 0
        };
        res.status(httpStatus.Ok).json(result);
      }else{
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
      }
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function getAllToDownload(req, res) {
    try {
      await connectToDatabase();

      let period = await periodSchema.findOne({'isActive': true}).exec();

      if (period === null || period === undefined){
        res.status(httpStatus.Ok).json([]);
      } else{
        let queryFind = {
          $and: [
            {
              'period.name': period.name,
            }
          ]
        };

        var items = await manageSchema
          .find(queryFind)
          .sort({'employee.name': 1})
          .exec();

        for (var i = 0; i < items.length; i++) {
          items[i].allocation = Math.round(items[i].allocation);
        }

        res.status(httpStatus.Ok).json(items);
      }
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function createManagesFromFile(req, res) {
    try {
      await connectToDatabase();
      let data = req.body.params.employees;
      await createManagesFromData(data);
      res.status(httpStatus.Created).end();
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function createManagesFromData(data) {
    for (var i = 0; i < data.length; i++) {

      let period = await periodSchema.findOne({'isActive': true}).exec();
      let employee = await employeeSchema.findOne({'registration': data[i]['MATR']}).exec();
      let costCenter = await costCenterSchema.findOne({'code': data[i]['COD CC ORIG']}).exec();

      let newManage = await new manageSchema({
        'period.description': period.description,
        'employee._id': employee._id,
        'employee.name': employee.name,
        'employee.registration': employee.registration,
        'originCostCenter._id': costCenter._id,
        'originCostCenter.code': costCenter.code,
        'originCostCenter.description': costCenter.description,
      });

      await newManage.save(function (err) {
        if (err) {
          console.log('err > ', err);
        }
      });
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
        let totalHoursReporting = await calculateTotalReportingHoursByUserIdAndPerActivePeriod(employee._id);

        // Usuário sem reportagens
        if (qtdReportingsOfEmployee === 0) {
          if (qtdCostCentersOfEmployee === 0 || qtdCostCentersOfEmployee > 1) {
            await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, idealHours, idealHours, res);
          }
          else if (qtdCostCentersOfEmployee === 1) {
            let destinyCostCenter = userCostCenters[0];
            await generateAndSaveManage(manageFromSpreadSheet, destinyCostCenter, idealHours, idealHours,);
          }
        }
        // Usuário com reportagens
        else {
          // qtdReportings === 1
          if (qtdReportingsOfEmployee === 1) {
            let destinyCostCenter = reportings[0].costCenter;
            let reportingHours = reportings[0].totalHoursCostCenter;

            // CC origem === CC destino
            if (originCostCenter._id.equals(destinyCostCenter._id)) {
              await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, reportingHours, reportingHours);
            }
            // CC origem !== CC destino
            else {
              //  reportingHours < idealHours
              if (totalHoursReporting < idealHours) {
                let newManage = await new manageSchema({
                  'period.description': period.description,
                  'employee._id': employee._id,
                  'employee.registration': employee.registration,
                  'employee.name': employee.name,
                  'originCostCenter._id': originCostCenter._id,
                  'originCostCenter.code': originCostCenter.code,
                  'originCostCenter.description': originCostCenter.description,
                });
                await generateAndSaveManage(newManage, destinyCostCenter, totalHoursReporting, idealHours);
                await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, await (idealHours - totalHoursReporting), idealHours);
              }
              // reportingHours >= idealHours
              else {
                await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, reportingHours, reportingHours);
              }
            }
          }
          // qtdReportings > 1
          else {
            // idealHours < totalHoursReporting
            if (totalHoursReporting < idealHours) {
              var hoursNotReporting = await (idealHours - totalHoursReporting);
              await generateAndSaveManage(manageFromSpreadSheet, originCostCenter, hoursNotReporting, idealHours);

              for (var j = 0; j < qtdReportingsOfEmployee; j++) {
                let destinyCostCenter = reportings[j].costCenter;

                let newManage = await new manageSchema({
                  'period.description': period.description,
                  'employee._id': employee._id,
                  'employee.registration': employee.registration,
                  'employee.name': employee.name,
                  'originCostCenter._id': originCostCenter._id,
                  'originCostCenter.code': originCostCenter.code,
                  'originCostCenter.description': originCostCenter.description,
                });

                if (totalHoursReporting < idealHours) {
                  if (originCostCenter._id.equals(destinyCostCenter._id)) {
                    await generateAndSaveManage(manageFromSpreadSheet, reportings[j].costCenter, await (idealHours - (await (totalHoursReporting - reportings[j].totalHoursCostCenter))), idealHours);
                  } else {
                    await generateAndSaveManage(newManage, reportings[j].costCenter, reportings[j].totalHoursCostCenter, idealHours);
                  }
                } else {
                  await generateAndSaveManage(newManage, reportings[j].costCenter, reportings[j].totalHoursCostCenter, totalHoursReporting);
                }
              }
            } else {
              for (var k = 0; k < qtdReportingsOfEmployee; k++) {
                let destinyCostCenter = reportings[k].costCenter;
                let totalHoursCostCenter = reportings[k].totalHoursCostCenter;
                if (originCostCenter._id.equals(destinyCostCenter._id)) {
                  await generateAndSaveManage(manageFromSpreadSheet, destinyCostCenter, totalHoursCostCenter, totalHoursReporting);
                } else {
                  let newManage = await new manageSchema({
                    'period.description': period.description,
                    'employee._id': employee._id,
                    'employee.registration': employee.registration,
                    'employee.name': employee.name,
                    'originCostCenter._id': originCostCenter._id,
                    'originCostCenter.code': originCostCenter.code,
                    'originCostCenter.description': originCostCenter.description,
                  });
                  await generateAndSaveManage(newManage, destinyCostCenter, totalHoursCostCenter, totalHoursReporting);
                }
              }
            }
          }
        }
        await updatePeriod(period);
      }
      res.status(httpStatus.Created).end();
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function generateAndSaveManage(manage, destinyCostCenter, hours, totalHoursReporting) {
    manage.destinyCostCenter._id = destinyCostCenter._id;
    manage.destinyCostCenter.code = destinyCostCenter.code;
    manage.destinyCostCenter.description = destinyCostCenter.description;
    manage.hours = hours;
    manage.totalHoursReporting = totalHoursReporting;
    manage.allocation = (await (await (hours / totalHoursReporting) * 100)).toFixed(2);

    await manage.save(function (err) {
      if (err) {
        console.log('err > ', err);
      }
    });
  }

  async function updatePeriod(period) {
    period.initialManageExecuted = true;
    period.endReportingDate = new Date();
    await period.save(function (err) {
      if (err) {
        console.log('err: ' + err);
      }
    });
  }

  async function calculateTotalBusinessDaysByActivePeriod() {
    try {
      await connectToDatabase();

      var period = await periodSchema.findOne({'isActive': true}).exec();

      var qtdBusinessDays = moment(period.finalDate, 'YYYY-MM-DD').businessDiff(moment(period.initialDate, 'YYYY-MM-DD'));

      return qtdBusinessDays - await getQtdFullHolidaysInActivePeriod() - (0.5 * await getQtdHalfHolidaysInActivePeriod());
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

  async function isPossibleExecuteManage(req, res) {
    try {
      await connectToDatabase();

      const queryFindPeriod = {
        $and:
          [
            {'isActive': true},
            {'initialManageExecuted': false},
            {'finalManageExecuted': false},
            {'finalDate' : {$lt:  new Date()}}
          ]
      };

      const queryFindFileUpload = {
        $and:
          [
            {'status': 'Sucesso'},
          ]
      };


      let period = await periodSchema.findOne(queryFindPeriod).exec();
      let fileUpload = await fileUploadSchema.findOne(queryFindFileUpload).populate('period').exec();

      let executeManage =
        period !== null
        && period !== undefined
        && fileUpload !== null
        && fileUpload !== undefined
        && period._id.equals(fileUpload.period._id);

      if (executeManage) {
        res.status(httpStatus.Ok).json(true);
      } else {
        res.status(httpStatus.Ok).json(false);
      }
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function isPossibleExecuteFinalManage(req, res) {
    try {
      await connectToDatabase();

      const queryFindPeriod = {
        $and:
          [
            {'isActive': true},
            {'initialManageExecuted': true},
            {'finalManageExecuted': false},
            {'finalDate' : {$lt:  new Date()}}
          ]
      };

      const queryFindFileUpload = {
        $and:
          [
            {'status': 'Sucesso'},
          ]
      };


      let period = await periodSchema.findOne(queryFindPeriod).exec();
      let fileUpload = await fileUploadSchema.findOne(queryFindFileUpload).populate('period').exec();

      let executeManage =
        period !== null
        && period !== undefined
        && fileUpload !== null
        && fileUpload !== undefined
        && period._id.equals(fileUpload.period._id);

      if (executeManage) {
        res.status(httpStatus.Ok).json(true);
      } else {
        res.status(httpStatus.Ok).json(false);
      }
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function manageExecutedWithSuccess(req, res) {
    try {
      await connectToDatabase();

      const queryFindPeriod = {
        $and:
          [
            {'isActive': true},
            {'initialManageExecuted': true},
            {'finalManageExecuted': true}
          ]
      };

      const queryFindFileUpload = {
        $and:
          [
            {'status': 'Sucesso'},
          ]
      };


      let period = await periodSchema.findOne(queryFindPeriod).exec();
      let fileUpload = await fileUploadSchema.findOne(queryFindFileUpload).populate('period').exec();

      let manageExecuteWithSuccess =
        period !== null
        && period !== undefined
        && fileUpload !== null
        && fileUpload !== undefined
        && period._id.equals(fileUpload.period._id);

      if (manageExecuteWithSuccess) {
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

      if (response[0] === null || response[0] === undefined) {
        return 0;
      } else {
        return response[0].totalHoursReportingByActivePeriod;
      }
    } catch (err) {
      console.log('err > ', err);
    }
  }

  async function generateFinalManage(req, res) {
    try {
      await connectToDatabase();

      let period = await periodSchema.findOne({'isActive': true}).exec();
      period.finalManageExecuted = true;
      period.endReportingAdminDate = new Date();

      period.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Ok).end();
        }
      });

    }catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  return {
    getAll: getAll,
    getAllToDownload: getAllToDownload,
    generateManage: generateManage,
    createManagesFromFile: createManagesFromFile,
    isPossibleExecuteManage: isPossibleExecuteManage,
    manageExecutedWithSuccess: manageExecutedWithSuccess,
    generateFinalManage: generateFinalManage,
    isPossibleExecuteFinalManage: isPossibleExecuteFinalManage,
  }
};

module.exports = manageController;
