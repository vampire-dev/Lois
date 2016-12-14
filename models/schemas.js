var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var schemas = {};

schemas['regions'] = mongoose.model('Region', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'regions' }));

schemas['locations'] = mongoose.model('Location', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true },
    "prefix": { type: String, default: null },
    "region": { type: ObjectId, ref: 'Region' }
}, { versionKey: false, collection: 'locations' }));

schemas['paymentTypes'] = mongoose.model('PaymentType', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'paymentTypes' }));

schemas['itemTypes'] = mongoose.model('ItemType', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'itemTypes' }));

schemas['packingTypes'] = mongoose.model('PackingType', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'packingTypes' }));

schemas['trainTypes'] = mongoose.model('TrainType', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'trainTypes' }));

schemas['drivers'] = mongoose.model('Driver', new Schema({
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'drivers' }));

schemas['menus'] = mongoose.model('Menu', new Schema({
    "name": { type: String, required: true },
    "state": { type: String, required: true },
    "icon": { type: String, default: null },
    "position": { type: Number, default: null }
}, { versionKey: false, collection: 'menus' }));

schemas['reports'] = mongoose.model('Report', new Schema({
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'reports' }));

schemas['roleMenus'] = mongoose.model('RoleMenu', new Schema({
    "role": { type: ObjectId, ref: 'Role' },
    "menu": { type: ObjectId, ref: 'Menu' }
}, { versionKey: false, collection: 'roleMenus' }));

schemas['roleReports'] = mongoose.model('RoleReport', new Schema({
    "role": { type: ObjectId, ref: 'Role' },
    "report": { type: ObjectId, ref: 'Report' }
}, { versionKey: false, collection: 'roleReports' }));

schemas['partners'] = mongoose.model('Partner', new Schema({
    "name": { type: String, required: true },
    "address": { type: String, default: null },
    "contact": { type: String, default: null }
}, { versionKey: false, collection: 'partners' }));

schemas['roles'] = mongoose.model('Role', new Schema({
    "name": { type: String, required: true }
}, { versionKey: false, collection: 'roles' }));

schemas['users'] = mongoose.model('User', new Schema({
    "name": { type: String, required: true },
    "userName": { type: String, required: true },
    "hash": { type: String, required: true },
    "salt": { type: String, required: true },
    "role": { type: ObjectId, ref: 'Role' },
    "location": { type: ObjectId, ref: 'Location' }
}, { versionKey: false, collection: 'users' }));

schemas['clients'] = mongoose.model('Client', new Schema({
    "number": { type: Number, default: null },
    "name": { type: String, required: true },
    "address1": { type: String, default: null },
    "address2": { type: String, default: null },
    "contact": { type: String, default: null },
    "quota": { type: Number, default: 0 },
    "location": { type: ObjectId, ref: 'Location' }
}, { versionKey: false, collection: 'clients' }));

schemas['tariffs'] = mongoose.model('Tariff', new Schema({
    "client": { type: ObjectId, ref: 'Client' },
    "destination": { type: ObjectId, ref: 'Location' },
    "minimum": { type: Number, default: 0 },
    "prices": [{ type: Number, default: 0 }]
}, { versionKey: false, collection: 'tariffs' }));

var shippingItem = {
    "itemType": { type: ObjectId, ref: 'ItemType' },
    "packingType": { type: ObjectId, ref: 'PackingType' },
    "content": { type: String, default: null },
    "dimensions": {
        "length": { type: Number, default: 0 },
        "width": { type: Number, default: 0 },
        "height": { type: Number, default: 0 },
        "weight": { type: Number, default: 0 }
    },
    "colli": {
        "quantity": { type: Number, default: 0 },
        "available": { type: Number, default: 0 },
        "delivered": { type: Number, default: 0 }
    },
    "cost": {
        "colli": { type: Number, default: 0 },
        "additional": { type: Number, default: 0 },
        "discount": { type: Number, default: 0 },
        "shipping": { type: Number, default: 0 }
    },
    "status": { type: String, default: 'Belum Terekap' },
    "audited": { type: Boolean, default: false },
    "recapitulations": [{
        "item": { type: ObjectId },
        "quantity": { type: Number, default: 0 },
        "available": { type: Number, default: 0 },
        "weight": { type: Number, default: 0 },
        "limasColor": { type: String, default: null },
        "relationColor": { type: String, default: null },
        "vehicleNumber": { type: String, default: null },
        "departureDate": { type: Date, default: null },
        "notes": { type: String, default: null },
        "trainType": { type: ObjectId, ref: 'TrainType' },
        "driver": { type: ObjectId, ref: 'Driver' },
        "createdDate": { type: Date, default: null },
        "updatedDate": { type: Date, default: null },
        "userCreated": { type: ObjectId, ref: 'User', default: null },
        "userUpdated": { type: ObjectId, ref: 'User', default: null }
    }],
    "deliveries": [{
        "item": { type: ObjectId },
        "recapitulation": { type: ObjectId },
        "quantity": { type: Number, default: 0 },
        "available": { type: Number, default: 0 },
        "weight": { type: Number, default: 0 },
        "limasColor": { type: String, default: null },
        "relationColor": { type: String, default: null },
        "vehicleNumber": { type: String, default: null },
        "deliveryCode": { type: String, default: null },
        "notes": { type: String, default: null },
        "driver": { type: ObjectId, ref: 'Driver' },
        "createdDate": { type: Date, default: null },
        "updatedDate": { type: Date, default: null },
        "userCreated": { type: ObjectId, ref: 'User', default: null },
        "userUpdated": { type: ObjectId, ref: 'User', default: null }
    }]
};

schemas['shippings'] = mongoose.model('Shipping', new Schema({
    "number": { type: Number, required: true },
    "spbNumber": { type: String, required: true },
    "date": { type: Date, default: null },
    "receiver": {
        "name": { type: String, default: null },
        "address": { type: String, default: null },
        "contact": { type: String, default: null }
    },
    "sender": { type: ObjectId, ref: 'Client' },
    "destination": { type: ObjectId, ref: 'Location' },
    "partner": { type: ObjectId, ref: 'Partner' },
    "regions": {
        "source": { type: ObjectId, ref: 'Region' },
        "destination": { type: ObjectId, ref: 'Region' }
    },
    "payment": {
        "type": { type: ObjectId, ref: 'PaymentType' },
        "location": { type: ObjectId, ref: 'Location' },
        "status": { type: String, default: "Belum Terbayar" },
        "phases": [{
            "transferDate": { type: Date, default: null },
            "bank": { type: String, default: null },
            "notes": { type: String, default: null },
            "amount": { type: Number, default: 0 },
            "date": { type: Date, default: Date.now },
            "user": { type: ObjectId, ref: 'User' }
        }],
        "paid": { type: Number, default: 0 }
    },
    "cost": {
        "pph": { type: Number, default: 0.0 },
        "worker": { type: Number, default: 0.0 },
        "expedition": { type: Number, default: 0.0 },
        "expeditionType": { type: String, default: "include" },
        "total": { type: Number, default: 0.0 },
        "base": { type: Number, default: 0.0 },
        "ppn": { type: Number, default: 0.0 }
    },
    "driver": {
        "sender": { type: String, default: null },
        "pickup": { type: String, default: null }
    },
    "notes": {
        "shipping": { type: String, default: null },
        "partner": { type: String, default: null },
        "po": { type: String, default: null }
    },
    "invoice": {
        "all": { type: String, default: null },
        "client": { type: String, default: null },
        "partner": { type: String, default: null }
    },
    "tariff": { type: Number, default: 0 },
    "audited": { type: Boolean, default: false },
    "returned": { type: Boolean, default: false },
    "confirmed": { type: Boolean, default: false },
    "colli": { type: Number, default: 0 },
    "weight": { type: Number, default: 0 },
    "itemCount": { type: Number, default: 0 },
    "returnInfo": {
        "filePath": { type: String, default: null },
        "stamped": { type: Boolean, default: false },
        "signed": { type: Boolean, default: false },
        "receipt": { type: Boolean, default: false },
        "accepted": { type: Boolean, default: false },
        "limasColor": { type: String, default: null },
        "relationColor": { type: String, default: null },
        "relationCode": { type: String, default: null },
        "notes": { type: String, default: null },
        "concernedPerson": { type: String, default: null },
        "created": {
            "date": { type: Date, default: null },
            "user": { type: ObjectId, ref: 'User' }
        },
        "modified": {
            "date": { type: Date, default: Date.now },
            "user": { type: ObjectId, ref: 'User' }
        },
    },
    "inputLocation": { type: ObjectId, ref: 'Location' },
    "items": [shippingItem],
    "created": {
        "date": { type: Date, default: null },
        "user": { type: ObjectId, ref: 'User' }
    },
    "modified": {
        "date": { type: Date, default: Date.now },
        "user": { type: ObjectId, ref: 'User' }
    }
}, { versionKey: false, collection: 'shippings' }));

schemas['notifications'] = mongoose.model('Notification', new Schema({
    "event": { type: String, default: null },
    "filePath": { type: String, default: null },
    "date": { type: Date, default: Date.now },
    "user": { type: ObjectId, ref: 'User' }
}, { versionKey: false, collection: 'notifications' }));

schemas['audits'] = mongoose.model('Audit', new Schema({
    "type": { type: String, default: null },
    "notes": { type: String, default: null },
    "date": { type: Date, default: Date.now },
    "data": {},
    "user": { type: ObjectId, ref: 'User' },
    "stat": { type: String, default: null }
}, { versionKey: false, collection: 'audits' }));

schemas['invoices'] = mongoose.model('Invoice', new Schema({
    "number": { type: String, required: true },
    "inc": { type: Number, required: true },
    "to": { type: String, required: true },
    "location": { type: String, required: true },
    "type": { type: String, default: 'Semua' },
    "shippings": [{ type: ObjectId, ref: 'Shipping' }],
    "inputLocation": { type: ObjectId, ref: 'Location' },
    "created": {
        "date": { type: Date, default: null },
        "user": { type: ObjectId, ref: 'User' }
    },
    "modified": {
        "date": { type: Date, default: Date.now },
        "user": { type: ObjectId, ref: 'User' }
    },
}, { versionKey: false, collection: 'invoices' }));

module.exports = schemas;