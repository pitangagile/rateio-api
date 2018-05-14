const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var reportingScheme = new mongoose.Schema(
    {
        employee: {type: String },
        period: {type: String},
        costCenter: {type: String, required: [true, '{PATH} é um campo obrigatório']},
        Hours: {type: Number},
    }, {timestamps: true}
);

reportingScheme.plugin(unique, { message: '{PATH} já cadastrado' });
reportingScheme.set('collection', 'reporting');
module.exports = mongoose.models.reporting || mongoose.model('reporting', reportingScheme);
