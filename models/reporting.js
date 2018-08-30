const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validators = require('mongoose-validators');
const Schema = mongoose.Schema;

var reportingSchema = new mongoose.Schema(
  {
    period: {required: true, type: Schema.Types.ObjectId, ref: 'period'},
    employee:
      {
        _id: {required: true, type: Schema.Types.ObjectId, ref: 'employee'},
        name: {required: true, type : String},
      },
    costCenter: {required: true, type: Schema.Types.ObjectId, ref: 'costCenter'},
    totalHoursCostCenter: {type: Number, required: true},
  }, {timestamps: true}
);

reportingSchema.plugin(unique, {message: '{PATH} já cadastrado'});
reportingSchema.set('collection', 'reporting');
module.exports = mongoose.models.reporting || mongoose.model('reporting', reportingSchema);
