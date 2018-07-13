const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var holidaySchema = new mongoose.Schema(
    {
        date: {type: Date, required: [true, '{PATH} é um campo obrigatório']},
        description: {type:String, required: [true, '{PATH} é um campo obrigatório']},
        classification: String,
        dayDescription: String,
        percentageWorked: {type:Number, required: [true, '{PATH} é um campo obrigatório']},
    }, {timestamps: true}
);

holidaySchema.plugin(unique, { message: '{PATH} já cadastrado' });
holidaySchema.set('collection', 'holiday');
module.exports = mongoose.models.holiday || mongoose.model('holiday', holidaySchema);
