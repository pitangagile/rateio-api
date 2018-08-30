const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');

var manageController = function (manageSchema, employeeSchema, costCenterSchema) {

  async function getAll(req, res) {
    try {
      await connectToDatabase();

      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      var total = await manageSchema
        .find({$or : [{'employee.name' : {"$regex": req.query.query, "$options": "i"}}]})
        .count()
        .exec();

      var items = await manageSchema
        .find({$or : [{'employee.name' : {"$regex": req.query.query, "$options": "i"}}]})
        .skip((limit * page) - limit)
        .limit(limit)
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

  async function resolveResult(response, name) {
    var result = await response.forEach(async function (employee) {
      if (!name || await employee[i].employee.name.match(name))
        return employee;
    });
    return result;
  }

  async function createManageFromEmployees(req, res) {
    try {
      await connectToDatabase();

      let data = req.body.params.employees;

      console.log('data > ', data);

      for (var i = 0; i < data.length; i++) {

        let employee = await employeeSchema.findOne({'registration': data[i]['MATR']}).exec();
        let costCenter = await costCenterSchema.findOne({'code': data[i]['COD CC ORIG']}).exec();

        let newManageEmployee = new manageSchema({
          'employee._id' : employee._id,
          'employee.name' : employee.name,
          'originCostCenter._id' : costCenter._id,
          'originCostCenter.description' : costCenter.description,
        });

        console.log('newManageEmployee > ', newManageEmployee);

        newManageEmployee.save(function (err) {
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

  return {
    getAll: getAll,
    createManageFromEmployees: createManageFromEmployees,
  }
};

module.exports = manageController;
