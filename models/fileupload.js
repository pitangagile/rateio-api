const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validators = require('mongoose-validators');
const Schema = mongoose.Schema;

var fileuploadSchema = new mongoose.Schema(
  {
    name: {type: String, required: [true, '{PATH} é um campo obrigatório'], unique: true},
    responsable: {type: Schema.Types.ObjectId, ref: 'employee'},
    status: {type: String, required: [true, '{PATH} é um campo obrigatório']},
    employees: [{type: Schema.Types.ObjectId, ref: 'employee'}],
  }, {timestamps: true}
);

fileuploadSchema.plugin(unique, {message: '{PATH} já cadastrado'});
fileuploadSchema.set('collection', 'fileupload');
module.exports = mongoose.models.fileupload || mongoose.model('fileupload', fileuploadSchema);
