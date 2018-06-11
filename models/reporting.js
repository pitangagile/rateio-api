const mongoose      = require('mongoose');
const unique        = require('mongoose-unique-validator');
const validators    = require('mongoose-validators');
const Schema = mongoose.Schema;

var reportingSchema = new mongoose.Schema(
    {
        hours: Number,
        employee: { type: Schema.Types.ObjectId, ref: 'employee' },
        costcenter: { type: Schema.Types.ObjectId, ref: 'coastCenter' },
        period: { type: Schema.Types.ObjectId, ref: 'period' },
        isSpecial: Boolean,
        ManagerName: String
    }, {timestamps: true}
);

reportingSchema.plugin(unique, { message: '{PATH} já cadastrado' });
reportingSchema.set('collection', 'reporting');
module.exports = mongoose.models.reporting || mongoose.model('reporting', reportingSchema);
