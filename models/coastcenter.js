const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var coastCenterSchema = new mongoose.Schema(
    {
        code: {type:String, required: [true, '{PATH} é um campo obrigatório'], unique: true},
        description: {type:String, required: [true, '{PATH} é um campo obrigatório']},
        isActive: Boolean,
    }, {timestamps: true}
);

coastCenterSchema.plugin(unique, { message: '{PATH} já cadastrado' });
coastCenterSchema.set('collection', 'coastCenter');
module.exports = mongoose.models.coastCenter || mongoose.model('coastCenter', coastCenterSchema);
