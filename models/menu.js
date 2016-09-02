var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var model = new Schema({
    name: { type: String, required: true },
    state: { type: String, required: true },
    icon: { type: String, default: null },
    position: { type: Number, default: 0 }
}, { versionKey: false, collection: 'menus' });

module.exports = mongoose.model('Menu', model);