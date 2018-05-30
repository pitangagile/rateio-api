const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var periodSchema = new mongoose.Schema(
    {
       description:{type: String, required: [true, '{PATH} é um campo obrigatório']},
       initialdate:{type: Date, required: [true, '{PATH} é um campo obrigatório'],  unique: true},
       finaldate:{type: Date, required: [true, '{PATH} é um campo obrigatório'],  unique: true},
       closuredate: Date,
       generationdate: Date,
       isActive: Boolean,
    }, {timestamps: true}
);

periodSchema.plugin(unique, { message: '{PATH} já cadastrado' });
periodSchema.set('collection', 'period');
module.exports = mongoose.models.period || mongoose.model('period', periodSchema);
