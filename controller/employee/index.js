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

  return {
    getAll: getAll,
    create: create,
    delete: delete_employee
  }
}

module.exports = employeeController;
// /**
//  * Create all coast center (initial load)
//  * @param {object} req The Express Request object
//  * @param {object} res The Express Response object
//  */
// function createall(req, res){
//   if(req.body != undefined && req.body.length > 0){
//     connectToDatabase().then(() => {
//       co(function* () {
//         for(var i = 0; i < req.body.length; i += 1) {
//           let employee = new employeeSchema({
//             name: req.body[i].Nome,
//             email: req.body[i].email,
//             displayName: req.body[i].conhecido,
//             telstation: req.body[i].Ramal,
//             cel: req.body[i].Celular,
//             tel: req.body[i].Telefone,
//             telemergency: req.body[i].contatoNecessidade,
//             isActive: true,
//           });
//           employee.save(function (err){
//             res.status(httpStatus.InternalServerError).json({error: error}).end();
//           });
//           res.status(httpStatus.Ok).send("Funcionário cadastrado com sucesso!").end();
//         }
//       }).catch((error) => {
//         res.status(httpStatus.InternalServerError).json({'error': error}).end();
//       });
//     });
//   }
//   res.json('Fim da carga de dados');
// }

// /**
//  * Get all employees
//  * @param {object} req The Express Request object
//  * @param {object} res The Express Response object
//  */
// function getAll(req, res) {
//   connectToDatabase()
//   .then(() => {
//       co(function*() {
//           let employees = yield employeeSchema.find().exec();
//           res.send(employees);
//       }).catch((error) => {
//           res.send('Erro:' + error);
//       });
//   }).catch((error) => {
//       res.send('Erro:' + error);
//   });
// }

// module.exports = {
//   createall,
//   getAll
// }
