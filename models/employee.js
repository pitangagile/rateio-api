const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validators = require('mongoose-validators');
const Schema = mongoose.Schema;

var employeeSchema = new mongoose.Schema(
  {
    name: {type: String, required: [true, '{PATH} é um campo obrigatório']},
    email: {type: String, required: [true, '{PATH} é um campo obrigatório'], unique: true},
    registration: {type: String, required: [true, '{PATH} é um campo obrigatório'], unique: true},
    idSocialLogin: String,
    displayName: String,
    urlPicture: String,
    isActive: Boolean,
    deactivationDate: Date,
    login: String,
    location: String,
    telStation: String,
    tel: String,
    cel: String,
    telEmergency: String,
    workHours: Number,
    isPj: Boolean,
    role: {type: String, required: [true, '{PATH} é um campo obrigatório']},
    costCenterOrigin: {type: Schema.Types.ObjectId, ref: 'costCenter'},
    costCenters: [{type: Schema.Types.ObjectId, ref: 'costCenter'}]
  }, {timestamps: true}
);

employeeSchema.plugin(unique, {message: '{PATH} já cadastrado'});
employeeSchema.set('collection', 'employee');
module.exports = mongoose.models.employee || mongoose.model('employee', employeeSchema);
