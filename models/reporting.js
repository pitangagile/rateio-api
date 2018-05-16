const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var reportingSchema = new mongoose.Schema(
    {
        period: {type: String},
        costCenter: {type: String},
        hours: {type: Number},
    }, {timestamps: true}
);

reportingSchema.plugin(unique, { message: '{PATH} já cadastrado' });
reportingSchema.set('collection', 'reporting');
module.exports = mongoose.models.reporting || mongoose.model('reporting', reportingSchema);
