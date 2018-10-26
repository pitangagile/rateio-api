const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validators = require('mongoose-validators');
const Schema = mongoose.Schema;

var manageSchema = new mongoose.Schema(
  {
    period: {
      description: {required: true, type: String}
    },
    employee: {
      _id: { required: true, type: Schema.Types.ObjectId},
      registration: { required: true, type: String },
      name: { required: true, type: String }
    },
    originCostCenter: {
      _id: { required: true, type: Schema.Types.ObjectId},
      code: {type: String, required: true},
      description : { required: true, type: String }
    },
    destinyCostCenter : {
      _id: { type: Schema.Types.ObjectId},
      code: {type: String},
      description : { type: String }
    },
    hours : {type: Number},
    totalHoursReporting : {type: Number},
    allocation : {type: Number}
  }, { timestamps: true }
);

manageSchema.plugin(unique, {message: '{PATH} já cadastrado'});
manageSchema.set('collection', 'manage');
module.exports = mongoose.models.manage || mongoose.model('manage', manageSchema);
