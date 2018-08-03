const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validators = require('mongoose-validators');
const Schema = mongoose.Schema;

var fileuploadSchema = new mongoose.Schema(
  {
    name: {type: String, required: [true, '{PATH} é um campo obrigatório'], unique: true},
    responsable: {type: String},
    file: {data: {type: Buffer}, contentType: {type:String}},
  }, {timestamps: true}
);

fileuploadSchema.plugin(unique, {message: '{PATH} já cadastrado'});
fileuploadSchema.set('collection', 'fileupload');
module.exports = mongoose.models.fileupload || mongoose.model('fileupload', fileuploadSchema);
