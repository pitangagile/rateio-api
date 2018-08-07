const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');
const Schema = mongoose.Schema;

var reportingSchema = new mongoose.Schema(
    {
        hours: {type:Number,required: true},
        employee: {required: true, type: Schema.Types.ObjectId, ref: 'employee' },
        costCenter: {required: true, type: Schema.Types.ObjectId, ref: 'costCenter' },
        period: {required: true, type: Schema.Types.ObjectId, ref: 'period' },
        isSpecial: Boolean,
        ManagerName: String
    }, {timestamps: true}
);

reportingSchema.plugin(unique, { message: '{PATH} já cadastrado' });
reportingSchema.set('collection', 'reporting');
module.exports = mongoose.models.reporting || mongoose.model('reporting', reportingSchema);
