const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var reportingSchema = new mongoose.Schema(
    {
        period: {type: String, required: [true, '{PATH} é um campo obrigatório']},
        costCenter: {type: String, required: [true, '{PATH} é um campo obrigatório']},
        Hours: {type: Number, required: [true, '{PATH} é um campo obrigatório']},
    }, {timestamps: true}
);

reportingSchema.plugin(unique, { message: '{PATH} já cadastrado' });
reportingSchema.set('collection', 'reporting');
module.exports = mongoose.models.reporting || mongoose.model('reporting', reportingSchema);
