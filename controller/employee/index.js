const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

const employeeSchema = require('../../models/employee');

/**
 * Create all coast center (initial load)
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function createall(req, res){
  if(req.body != undefined && req.body.length > 0){
    connectToDatabase().then(() => {
      co(function* () {
        for(var i = 0; i < req.body.length; i += 1) {
          let employee = new employeeSchema({
            name: req.body[i].Nome,
            email: req.body[i].email,
            displayName: req.body[i].conhecido,
            telstation: req.body[i].Ramal,
            cel: req.body[i].Celular,
            tel: req.body[i].Telefone,
            telemergency: req.body[i].contatoNecessidade,
            isActive: true,
          });
          employee.save(function (err){
            res.status(httpStatus.InternalServerError).json({error: error}).end();
          });
          res.status(httpStatus.Ok).send("Funcionário cadastrado com sucesso!").end();
        }
      }).catch((error) => {
        res.status(httpStatus.InternalServerError).json({'error': error}).end();
      });
    });
  }
  res.json('Fim da carga de dados');
}

/**
 * Get all employees
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function getAll(req, res) {
  connectToDatabase()
  .then(() => {
      co(function*() {
          let employees = yield employeeSchema.find().exec();
          res.send(employees);
      }).catch((error) => {
          res.send('Erro:' + error);
      });
  }).catch((error) => {
      res.send('Erro:' + error);
  });
}

module.exports = {
  createall,
  getAll
}
