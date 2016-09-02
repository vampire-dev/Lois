var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    menu: { type: refId, ref: 'Menu' },
    role: { type: refId, ref: 'Role' }
}, { versionKey: false, collection: 'roleMenus' });

module.exports = mongoose.model('RoleMenu', model);