var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var mongoose = require('mongoose');
var date = require('../utils/date');
var static = require('../utils/static');
var schemas = require('../models/schemas');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.get = function (id) {
    return schemas.shippings.findOne({ "_id": ObjectId(id) })
        .populate('sender destination payment.type payment.location partner items.itemType items.packingType').lean().exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0; 
    var parameters = { "inputLocation": ObjectId(query['location'])};

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['receiverName'])
        parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['partner'])
        parameters['partner'] = ObjectId(query['partner']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    var entities = schemas.shippings.find(parameters);

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().sort({ "number": -1 })
        .populate('sender destination payment.type payment.location partner items.itemType items.packingType').lean().exec();
};

Controller.prototype.add = function (user) {
    var self = this;

    if (!user.location)
        throw new Error('Location is not defined');

    if (!user.location.prefix)
        throw new Error('Prefix is not defined for location ' + user.location.name);

    return co(function* () {
        var lastShipping = yield schemas.shippings.findOne({}).sort({ "number": -1 }).exec();

        var lastLocShipping = yield schemas.shippings.findOne({ "inputLocation": ObjectId(user.location._id) })
            .sort({ "number": -1 }).exec();

        var number = lastShipping ? lastShipping.number + 1 : 1;
        var spbNumber = lastLocShipping ? (parseInt(lastLocShipping.spbNumber.split('-')[0]) + 1) + '-' + user.location.prefix
            : '1-' + user.location.prefix;

        var existingShipping = yield schemas.shippings.findOne({ "spbNumber": spbNumber }).exec();

        if (existingShipping)
            throw new Error('Spb number already exists');

        var shipping = {
            "number": number,
            "spbNumber": spbNumber,
            "sender": ObjectId(static.client),
            "destination": ObjectId(static.location),
            "regions": { "source": ObjectId(static.region), "destination": ObjectId(static.region) },
            "payment": { "type": ObjectId(static.paymentType), "location": ObjectId(static.location) },
            "partner": ObjectId(static.partner),
            "inputLocation": user.location._id,
            "created": { "user": user._id, "date": new Date() },
            "modified": { "user": user._id }
        };

        return new schemas.shippings(shipping).save();
    });
};

Controller.prototype.calculateCost = function (item, tariff, quota, option) {
    var self = this;
    var price = 0;
    var minimum = 0;

    if (tariff) {
        price = tariff.prices[option];
        minimum = tariff.minimum;
    }

    var dimensions = {
        length: _.parseInt(item.dimensions.length),
        width: _.parseInt(item.dimensions.width),
        height: _.parseInt(item.dimensions.height),
        weight: _.parseInt(item.dimensions.weight)
    };

    var cost = {
        colli: parseFloat(item.cost.colli),
        additional: parseFloat(item.cost.additional),
        discount: parseFloat(item.cost.discount)
    };

    var colli = _.parseInt(item.colli.quantity);
    var colliCost = colli * cost.colli;
    var limit = 0;
    var itemType = item.itemType._id ? item.itemType._id : item.itemType;

    switch (itemType.toString()) {
        case static.weight:
            limit = dimensions.weight * price;

            if (limit > minimum)
                return (price * dimensions.weight) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;

        case static.volume:
            limit = dimensions.length * dimensions.width * (dimensions.height / 4000) * price * colli;

            if (limit > minimum)
                return limit - cost.discount + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case static.colli:
            return colliCost + cost.additional - cost.discount;
        case static.minOfMultiple:
            return (colli - 1) * cost.colli + cost.additional - cost.discount + minimum;
        case static.motor:
            return cost.colli + cost.additional - cost.discount;
        case static.jakartaMinWeight:
            if (dimensions.weight > quota)
                return minimum + ((dimensions.weight - quota) * price) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;

        case static.surabayaMinWeight:
            if (dimensions.weight > quota)
                return minimum + ((dimensions.weight - quota) * price) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case static.combinationWeight:
            if (dimensions.weight > quota)
                return minimum + ((dimensions.weight - quota) * price) - (colli - 1) * colliCost - cost.discount + cost.additional;

            return 0;

        case static.freeoncharge:
            return 0;
        default:
            return 0;
    };
};

Controller.prototype.save = function (data, fromManager) {
    var self = this;

    return co(function* () {
        var sender = yield schemas.clients.findOne({ "_id": ObjectId(data.sender._id ? data.sender._id : data.sender) }).exec();
        var tariff = yield schemas.tariffs.findOne({ "client": ObjectId(sender._id), "destination": data.destination._id ? data.destination._id : data.destination }).exec();
        var source = yield schemas.locations.findOne({ "_id": ObjectId(sender.location) }).exec();
        var dest = yield schemas.locations.findOne({ "_id": ObjectId(data.destination._id ? data.destination._id : data.destination) }).exec();

        data.cost.total = 0;
        var count = 0;
        data.colli = 0;
        var ppn = 0;
        data.weight = 0;

        yield _co.coEach(data.items, function* (item) {
            var auditedItem = null;

            if (!fromManager) 
                auditedItem = yield self.auditComponent(data, item);
            else
                item.audited = false;

            if (auditedItem != null) {
                data.items[count] = auditedItem._doc;
                count++;
                return;
            }

            if (item.status === static.belumTerekap)
                item.colli.available = item.colli.quantity;

            item.cost.shipping = self.calculateCost(item, tariff, data.sender.quota, data.tariff);
            data.cost.total += parseFloat(item.cost.shipping);
            data.colli += _.parseInt(item.colli.quantity);
            data.weight += _.parseInt(item.dimensions.weight);
            count++;
        });

        data.itemCount = count;
        data.cost.base = parseFloat(data.cost.total);
        data.cost.total += parseFloat(data.cost.worker);

        if (data.cost.expeditionType === 'reimburse')
        data.cost.total += parseFloat(data.cost.expedition);

        if (data.cost.ppn === 0.1)
            ppn = data.cost.total * 0.1;

        if (data.cost.pph === 0.02)
            data.cost.total += (data.cost.total * 0.02);

        else if (data.cost.pph === 0.98)
            data.cost.total /= 0.98;

        data.cost.total += parseFloat(ppn);

        data.regions.source = source === null ? data.regions.source : source.region;
        data.regions.destination = dest === null ? data.regions.destination : dest.region;
        
        var entity = new schemas.shippings(data);
        return schemas.shippings.update({ "_id": ObjectId(entity._id) }, entity);
    });
};

Controller.prototype.auditComponent = function (data, item) {
    var self = this;

    return co(function* () {
        if (!item._id)
            return null;

        var prevShipping = yield schemas.shippings.findOne({ "_id": ObjectId(data._id) }).populate('items.itemType');

        if (!prevShipping)
            return;

        var notes = [];
        var self = this;
        var prevItem = _.find(prevShipping.items, function (prevItem) {
            return prevItem._id.toString() === item._id.toString();
        });

        if (!prevItem)
            return null;

        if ((item.dimensions.length !== prevItem.dimensions.length) && prevItem.dimensions.length > 0) 
            notes.push("Perubahan dimensi panjang dari " + prevItem.dimensions.length + " ke " + item.dimensions.length);

        if ((item.dimensions.width !== prevItem.dimensions.width) && prevItem.dimensions.width > 0) 
            notes.push("Perubahan dimensi lebar dari " + prevItem.dimensions.width + " ke " + item.dimensions.width);
        
        if ((item.dimensions.height !== prevItem.dimensions.height) && prevItem.dimensions.height > 0) 
            notes.push("Perubahan dimensi tinggi dari " + prevItem.dimensions.height + " ke " + item.dimensions.height);

        if ((item.dimensions.weight !== prevItem.dimensions.weight) && prevItem.dimensions.weight > 0) 
            notes.push("Perubahan dimensi berat dari " + prevItem.dimensions.weight + " ke " + item.dimensions.weight);

        if ((item.colli.quantity !== prevItem.colli.quantity) && prevItem.colli.quantity > 0)
            notes.push("Perubahan koli dari " + prevItem.colli.quantity + " ke " + item.colli.quantity);

        if ((item.cost.additional !== prevItem.cost.additional) && prevItem.cost.additional > 0)
            notes.push("Perubahan bea tambahan dari " + prevItem.cost.additional + " ke " + item.cost.additional);

        if ((item.cost.discount !== prevItem.cost.discount) && prevItem.cost.discount > 0)
            notes.push("Perubahan diskon dari " + prevItem.cost.discount + " ke " + item.cost.discount);

        if (item.itemType._id.toString() !== prevItem.itemType._id.toString())
            notes.push("Perubahan jenis barang dari " + prevItem.itemType.name + " ke " + item.itemType.name);

        if (notes.length > 0) {
            item = prevItem;

            var audit = new schemas.audits({
                "type": "price",
                "date": new Date(),
                "notes": notes.join(),
                "data": new schemas.shippings(data),
                "user": data.modified.user
            });

            yield audit.save();
            prevItem.audited = true;
            return prevItem;
        }

        return null;
    });
};

Controller.prototype.getDataReport = function (viewModels, user) {
    var self = this;

    var result = {
        "title": "SURAT JALAN",
        "template_file": "suratjalan.xlsx",
        "user": user.name,
        "report_data": []
    };

    return co(function* () {
        yield _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(viewModel.shipping) }).populate('items.packingType');
            //var items = _.map(shipping.items, "_id");
            var items = [];
            var totalColli = 0;
            var totalWeight = 0;
            var additional = 0;

            _.forEach(shipping.items, function (item) {
                items.push({
                    "content": item.content,
                    "packing": item.packingType ? item.packingType.name : " ",
                    "colli": item.colli.quantity,
                    "weight": item.dimensions.weight,
                    "volume": item.dimensions.length + "x" + item.dimensions.width + "x" + item.dimensions.height
                });
                totalColli += item.colli.quantity;
                totalWeight += item.dimensions.weight;
                additional += item.cost.additional;
            });

            result.report_data.push({
                sender: viewModel.sender,
                sender_driver: viewModel.sender_driver,
                sender_contact: viewModel.sender_contact,
                pickup_driver: viewModel.pickup_driver,
                destination_city: viewModel.destination_city,
                receiver: viewModel.receiver,
                receiver_phone: viewModel.receiver_phone,
                receiver_address: viewModel.receiver_address,
                items: items,
                sum_total_coli: totalColli,
                sum_total_weight: totalWeight,
                bea_tambahan: viewModel.noPrice ? 0 : additional,
                sum_price: viewModel.noPrice ? 0 : viewModel.sum_price,
                payment_method: viewModel.payment_method,
                spb_no: viewModel.spb_no,
                po_no: viewModel.po_no,
                transaction_date: viewModel.transaction_date,
                note: viewModel.note
            });

            
        });
        return result;
    });
};

module.exports = new Controller();