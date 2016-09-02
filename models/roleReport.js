var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    report: { type: refId, ref: 'Report' },
    role: { type: refId, ref: 'Role' }
}, { versionKey: false, collection: 'roleReports' });

module.exports = mongoose.model('RoleReport', model);