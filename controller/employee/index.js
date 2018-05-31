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
      for(var i = 0; i < req.body.length; i += 1) {
          console.log('employee:' + req.body[i].Nome + ' | '
                                  + req.body[i].email + ' | '
                                  + req.body[i].conhecido + ' | '
                                  + req.body[i].Ramal + ' | '
                                  + req.body[i].Celular + ' | '
                                  + req.body[i].Telefone + ' | '
                                  + req.body[i].contatoNecessidade + ' | ');
          // co(function* () {
          //     let employee = new employeeSchema({
          //         name: req.body[i].Nome,
          //         email: req.body[i].email,
          //         displayName: req.body[i].conhecido,
          //         telstation: req.body[i].Ramal,
          //         cel: req.body[i].Celular,
          //         tel: req.body[i].Telefone,
          //         telemergency: req.body[i].contatoNecessidade,
          //         isActive: true,
          //     });
          //     employee.save().then(() => {
          //         res.status(httpStatus.Ok).send("Centro de custo incluído com sucesso!").end();
          //     }).catch(error => {
          //         res.status(httpStatus.InternalServerError).json({error: error}).end();
          //     });
          // }).catch((error) => {
          //     res.status(httpStatus.InternalServerError).json({error: error}).end();
          // });
      }
  }
  res.json(req.body);
}

module.exports = {
  createall,
}
