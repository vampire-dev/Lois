var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    type: { type: String, default: null },
    notes: { type: String, default: null },
    date: { type: Date, default: Date.now },
    data: {},
    user: { type: refId, ref: 'User' }
}, { versionKey: false, collection: 'audits' });

module.exports = mongoose.model('Audit', model);
