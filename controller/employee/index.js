const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

var employeeController = function (employeeSchema, coastCenterSchema) {
  /**
   * Get all employees in database
   * @param {object} req
   * @param {object} res
   */
  async function getAll(req, res) {
    try {
      await connectToDatabase();
      let total = await employeeSchema.find().exec();
      let items = await coastCenterSchema
        .find(queryFind)
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
    console.log(req.body);
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
        .sort({code: 1})
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

      console.log('employee > ', employee);

      employee.coastCenters.remove(req.query.coastCenterId);
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
      employeeController.findById(req.body.id, function (err, entity) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Funcionário não encontrado');
        }
        else {
          entity.coastCenters = req.body.coastCenters;
          entity.workHours = req.body.workHours;
          entity.isPj = req.body.isPj;

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

  async function findUserCoastCentersByUserId(req, res) {
    try {
      await connectToDatabase();

      var queryFind = '';
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      var employee = await employeeSchema.findById(req.query.user_id, 'coastCenters').exec();

      queryFind = {
        $and: [{'_id': employee.coastCenters}]
      };

      let coastCenters = await coastCenterSchema.find(queryFind)
        .find(queryFind)
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({code: 1})
        .exec();

      const result = {
        data: coastCenters,
        count: coastCenters.length
      }

      res.status(httpStatus.Ok).json(result);
    } catch
      (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function findCoastCentersWithoutUserId(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.query.user_id, 'coastCenters').exec();

      let listIdCoastCenters = employee.coastCenters;
      let notUserCoastCenters = await coastCenterSchema.find({'_id': {$nin : listIdCoastCenters}})
        .sort({code: 1})
        .exec();

      res.status(httpStatus.Ok).send(notUserCoastCenters);
    } catch
      (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function addCoastCenter(req, res) {
    try {
      await connectToDatabase();

      var employee = await employeeSchema.findById(req.body.params.user_id).exec();

      employee.coastCenters.push(req.body.params.coastCenter);
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

  return {
    getAll: getAll,
    getGridList: getGridList,
    create: create,
    delete: del,
    update: edit,
    findUserCoastCentersByUserId: findUserCoastCentersByUserId,
    findCoastCentersWithoutUserId: findCoastCentersWithoutUserId,
    addCoastCenter: addCoastCenter
  }
}

module.exports = employeeController;
