var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var shippingItem = {
    itemType: { type: refId, ref: 'ItemType' },
    packingType: { type: refId, ref: 'PackingType' },
    content: { type: String, default: null },
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        weight: { type: Number, default: 0 }
    },
    colli: {
        quantity: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 }
    },
    cost: {
        colli: { type: Number, default: 0 },
        additional: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 }
    },
    status: { type: String, default: 'Belum Terekap' },
    audited: { type: Boolean, default: false },
    recapitulations: [{
        item: { type: refId },
        quantity: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        limasColor: { type: String, default: null },
        relationColor: { type: String, default: null },
        vehicleNumber: { type: String, default: null },
        departureDate: { type: Date, default: null },
        notes: { type: String, default: null },
        trainType: { type: refId, ref: 'TrainType' },
        driver: { type: refId, ref: 'Driver' },
        created: {
            date: { type: Date, default: null },
            user: { type: refId, ref: 'User' }
        },
        modified: {
            date: { type: Date, default: null },
            user: { type: refId, ref: 'User' }
        }
    }],
    deliveries: [{
        item: { type: refId },
        recapitulation: { type: refId },
        quantity: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        limasColor: { type: String, default: null },
        relationColor: { type: String, default: null },
        vehicleNumber: { type: String, default: null },
        deliveryCode: { type: String, default: null },
        notes: { type: String, default: null },
        driver: { type: refId, ref: 'Driver' },
        created: {
            date: { type: Date, default: null },
            user: { type: refId, ref: 'User' }
        },
        modified: {
            date: { type: Date, default: null },
            user: { type: refId, ref: 'User' }
        }
    }]
};

var model = new Schema({
    number: { type: Number, required: true },
    spbNumber: { type: String, requried: true },
    date: { type: Date, default: null },
    driver: { type: String, default: null },
    receiver: {
        name: { type: String, default: null },
        address: { type: String, default: null },
        contact: { type: String, default: null }
    },
    sender: { type: refId, ref: 'Client' },
    destination: { type: refId, ref: 'Location' },
    partner: { type: refId, ref: 'Partner' },
    regions: {
        source: { type: refId, ref: 'Region' },
        destination: { type: refId, ref: 'Region' }
    },
    payment: {
        type: { type: refId, ref: 'PaymentType' },
        location: { type: refId, ref: 'Location' },
        status: { type: String, default: 'Belum Terbayar' },
        phases: [{
            transferDate: { type: Date, default: null },
            bank: { type: String, default: null },
            notes: { type: String, default: null },
            amount: { type: Number, default: 0 },
            date: { type: Date, default: Date.now }
        }],
        paid: { type: Number, default: 0 }
    },
    cost: {
        pph: { type: Number, default: 0.0 },
        worker: { type: Number, default: 0.0 },
        expedition: { type: Number, default: 0.0 },
        total: { type: Number, default: 0.0 }
    },
    notes: {
        shipping: { type: String, default: null },
        partner: { type: String, default: null },
        po: { type: String, default: null }
    },
    invoice: {
        all: { type: String, default: null },
        client: { type: String, default: null },
        partner: { type: String, default: null }
    },
    tariff: { type: Number, default: 0 },
    audited: { type: Boolean, default: false },
    returned: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    inputLocation: { type: refId, ref: 'Location' },
    created: {
        date: { type: Date, default: null },
        user: { type: refId, ref: 'User' }
    },
    modified: {
        date: { type: Date, default: null },
        user: { type: refId, ref: 'User' }
    },
    items: [shippingItem]
}, { versionKey: false, collection: 'shippings' });

module.exports = mongoose.model('Shipping', model);