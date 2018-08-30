const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

var employeeController = function (employeeSchema, costCenterSchema) {
  /**
   * Get all employees in database
   * @param {object} req
   * @param {object} res
   */
  async function getAll(req, res) {
    try {
      await connectToDatabase();
      let total = await employeeSchema.find().exec();
      let items = await costCenterSchema
        .find()
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({code: 1})
        .exec();
      const result = {
        data: items,
        count: total
      }
      res.status(httpStatus.Ok).json(items);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
   Find to populate grid for interface
   * @param {object} req
   * @param {object} res
   */
  async function getGridList(req, res) {
    try {
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      const queryFind = {
        $or: [
          {"name": {"$regex": req.query.query, "$options": "i"}},
        ]
      };
      await connectToDatabase();
      const total = await employeeSchema.find(queryFind).count().exec();
      let items = await employeeSchema
        .find(queryFind)
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({name: 1})
        .exec();
      const result = {
        data: items,
        count: total
      }
      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
   Create a new employee
   * @param {object} req
   * @param {object} res
   */
  async function create(req, res) {
    try {
      await connectToDatabase();
      let newEmployee = new employeeSchema(req.body);
      newEmployee.isActive = true;

      newEmployee.save(function (err) {
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
   Desactive a employee
   * @param {object} req
   * @param {object} res
   */
  async function del(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.query.user_id).exec();

      employee.costCenters.remove(req.query.costCenterId);
      employee.save(function (err) {
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

  /**
   Edit a employee from settings
   * @param {object} req
   * @param {object} res
   */
  async function edit(req, res) {
    try {
      await connectToDatabase();

      let employeeId = req.body.params.employee._id;

      console.log('req > ', req);
      console.log('employeeId > ', employeeId);

      await employeeSchema.findById(employeeId).exec();

      await employeeSchema.findByIdAndUpdate(employeeId, req.body.params.employee, function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro ao atualizar colaborador');
        }
        res.status(httpStatus.Ok).end();
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function findUserCostCentersByUserId(req, res) {
    try {
      await connectToDatabase();

      var queryFind = '';
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      var employee = await employeeSchema.findById(req.query.user_id, 'costCenters').exec();

      queryFind = {
        $and: [{'_id': employee.costCenters}]
      };

      let costCenters = await costCenterSchema.find(queryFind)
        .find(queryFind)
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({code: 1})
        .exec();

      const result = {
        data: costCenters,
        count: costCenters.length
      };

      res.status(httpStatus.Ok).json(result);
    } catch
      (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function findEmployeeById(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema
        .findById(req.query.user_id)
        .exec();

      res.status(httpStatus.Ok).json(employee);
    } catch
      (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function findEmployeeByEmail(req, res) {
    try {
      await connectToDatabase();

      queryFind = {
        $and: [{'email': req.query.email}]
      };

      var employee = await employeeSchema
        .find(queryFind)
        .exec();

      res.status(httpStatus.Ok).json(employee[0]);
    } catch
      (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function findCostCentersWithoutUserId(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.query.user_id, 'costCenters').exec();

      let listIdCostCenters = employee.costCenters;
      let notUserCostCenters = await costCenterSchema.find({'_id': {$nin: listIdCostCenters}})
        .sort({code: 1})
        .exec();

      res.status(httpStatus.Ok).send(notUserCostCenters);
    } catch
      (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function addCostCenter(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.body.params.user_id).exec();

      employee.costCenters.push(req.body.params.costCenter);
      employee.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Ok).end();
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function validateAllEmployeesFromSpreadsheet(req, res) {
    try {
      await connectToDatabase();

      let registrations = req.query.registrations;

      var registrationsNotInDatabase = [];

      for(var i = 0; i < registrations.length; i++){
        let employees = await employeeSchema.findOne({$and : [{'registration' : registrations[i]}]}).exec();
        if (!employees){
          registrationsNotInDatabase.push(registrations[i]);
        }
      }
      res.status(httpStatus.Ok).json(registrationsNotInDatabase);
    }catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  return {
    getAll: getAll,
    getGridList: getGridList,
    create: create,
    delete: del,
    update: edit,
    findEmployeeById: findEmployeeById,
    findUserCostCentersByUserId: findUserCostCentersByUserId,
    findCostCentersWithoutUserId: findCostCentersWithoutUserId,
    findEmployeeByEmail: findEmployeeByEmail,
    addCostCenter: addCostCenter,
    validateAllEmployeesFromSpreadsheet : validateAllEmployeesFromSpreadsheet
  }
}

module.exports = employeeController;
