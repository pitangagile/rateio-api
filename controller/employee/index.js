const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

const employeeSchema = require('../../models/employee');

var employeeController = function(employeeSchema) {
  async function getAll(req, res){
    try {
      await connectToDatabase();
      let items = await employeeSchema.find({isActive: true}).exec();
      res.status(httpStatus.Ok).json(items);
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function create(req, res) {
    try {
      await connectToDatabase();
      let newEmployee = new employeeSchema(req.body);
      newEmployee.isActive = true;

      newEmployee.save(function (err) {
        if(err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Created).end();
        }
      });
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function delete_employee(req, res) {
    try {
      await connectToDatabase();
      employeeSchema.findById(req.body.id, function(err, entity) {
        if(err) {
          res.status(httpStatus.NotFound).send('Funcionário não encontrado');
        }
        else {
          entity.remove(function (err) {
            if(err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      });
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function edit (req, res) {
    try {
      await connectToDatabase();
      employeeController.findById(req.body.id, function(err, entity) {
        if(err) {
          res.status(httpStatus.InternalServerError).send('Funcionário não encontrado');
        }
        else {
          entity.coastCenters = req.body.coastCenters;
          entity.workHours = req.body.workHours;
          entity.isPj = req.body.isPj;

          entity.save(function (err) {
            if(err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      })
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  return {
    getAll: getAll,
    create: create,
    delete: delete_employee,
    update: edit
  }
}

module.exports = employeeController;
