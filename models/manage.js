const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');
const Schema        = mongoose.Schema;

var manageSchema = new mongoose.Schema(
    {
      originCostCenter : { required: true, type: Schema.Types.ObjectId, ref: 'costCenter' },
      reporting : { required: true, type: Schema.Types.ObjectId, ref: 'reporting' },
    }, {timestamps: true}
);

manageSchema.plugin(unique, { message: '{PATH} já cadastrado' });
manageSchema.set('collection', 'manage');
module.exports = mongoose.models.manage || mongoose.model('manage', manageSchema);
