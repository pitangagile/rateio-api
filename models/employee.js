const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validators = require('mongoose-validators');
const Schema = mongoose.Schema;

var employeeSchema = new mongoose.Schema(
  {
    'Nome' : {type: String, required: [true, '{PATH} é um campo obrigatório']},
    'Conhecido Por' : {type: String, required: [true, '{PATH} é um campo obrigatório']},
    'Login' : String,
    'Ramal' : String,
    'E-mail Corporativo' : String,
    'Localização' : String,
    'Matrícula' : String,
    'Celular' : Date,
    'Telefone' : String,
    'Contato em caso de necessidade' : String,
  }, {timestamps: true}
);

employeeSchema.plugin(unique, {message: '{PATH} já cadastrado'});
employeeSchema.set('collection', 'employee');
module.exports = mongoose.models.employee || mongoose.model('employee', employeeSchema);
