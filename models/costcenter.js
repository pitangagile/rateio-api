const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var costCenterSchema = new mongoose.Schema(
    {
        code: {type:String, required: [true, '{PATH} é um campo obrigatório'], unique: true},
        description: {type:String, required: [true, '{PATH} é um campo obrigatório']},
        isActive: Boolean,
    }, {timestamps: true}
);

costCenterSchema.plugin(unique, { message: '{PATH} já cadastrado' });
costCenterSchema.set('collection', 'costCenter');
module.exports = mongoose.models.costCenter || mongoose.model('costCenter', costCenterSchema);
