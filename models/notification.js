var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    event: { type: String, default: null },
    filePath: { type: String, default: null },
    date: { type: Date, default: Date.now },
    user: { type: refId, ref: 'User' }
}, { versionKey: false, collection: 'notifications' });

module.exports = mongoose.model('Notification', model);
