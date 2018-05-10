const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');

var employeeSchema = new mongoose.Schema(
    {
        name: {type: Date, required: [true, '{PATH} é um campo obrigatório']},
        email: {type:String, required: [true, '{PATH} é um campo obrigatório']},
        idSocialLogin: String,
        displayName: String,
        urlPicture: String,
        isActive: Boolean,
        dateDeactivation: Date,
    }, {timestamps: true}
);

employeeSchema.plugin(unique, { message: '{PATH} já cadastrado' });
employeeSchema.set('collection', 'employee');
module.exports = mongoose.models.employee || mongoose.model('employee', employeeSchema);
