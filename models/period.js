const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var periodSchema = new mongoose.Schema(
    {
       description:{type: String, required: [true, '{PATH} é um campo obrigatório']},
       initialDate:{type: Date, required: [true, '{PATH} é um campo obrigatório']},
       finalDate:{type: Date, required: [true, '{PATH} é um campo obrigatório']},
       endReportingDate: Date,
       endReportingManagerDate: Date,
       endReportingAdminDate: Date,
       isActive: Boolean,
    }, {timestamps: true}
);

periodSchema.plugin(unique, { message: '{PATH} já cadastrado' });
periodSchema.set('collection', 'period');
module.exports = mongoose.models.period || mongoose.model('period', periodSchema);
