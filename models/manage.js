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
      _id: { required: true, type: Schema.Types.ObjectId , ref : 'employee'},
      name: { required: true, type: String }
    },
    originCostCenter: {
      _id: { required: true, type: Schema.Types.ObjectId, ref : 'costCenter' },
      description : { required: true, type: String }
    },
    reporting: { type: Schema.Types.ObjectId , ref : 'reporting' },
  }, { timestamps: true }
);

manageSchema.plugin(unique, {message: '{PATH} já cadastrado'});
manageSchema.set('collection', 'manage');
module.exports = mongoose.models.manage || mongoose.model('manage', manageSchema);
