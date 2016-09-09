var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.getPaid = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "payment.status": 'Terbayar' };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['paymentDate'])
        parameters['payment.phases'] = { "$elemMatch": { "date": { "$gte": date.createLower(query['paymentDate']), "$lte": date.createUpper(query['paymentDate']) } } };

    if (query['transferDate'])
        parameters['payment.phases'] = { "$elemMatch": { "transferDate": { "$gte": date.createLower(query['transferDate']), "$lte": date.createUpper(query['transferDate']) } } };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getPaidReport = function (viewModels, query, user) {
    var self = this;
    var lastPaymentDate = _.map(viewModels[0].payment.phases, "date")[0];

    var result = {
        "title": "LAPORAN SURAT JALAN TERBAYAR",
        "template_file": "lapterbayar.xlsx",
        "location": user.location.name,
        "user": user.name,
        "date": query['paymentDate'],
        "payment_method": null,
        "report_data": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var contents = _.map(viewModel.items, "content");
            var transactionDates = _.map(viewModel.payment.phases, "transferDate");
            var paymentDates = _.map(viewModel.payment.phases, "date");
            var banks = _.map(viewModel.payment.phases, "bank");
            var totalColli = _.sumBy(viewModel.items, "colli.quantity");
            var paymentType = query['paymentType'] ? yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec() : "Kosong";

            result['payment_method'] = paymentType.name;

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join() : " ",
                "total_coli": totalColli,
                "total_weight": totalWeight,
                "price": viewModel.cost.total,
                "transaction_date": viewModel.date,
                "payment_date": paymentDates.length > 0 ? paymentDates.join() : " ",
                "bank": banks.length > 0 ? banks.join() : " "
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sum_total_coli'] = sumTotalColli;
        result['sum_total_weight'] = sumTotalWeight;
        result['sum_price'] = sumPrice;

        return result;
    });
};

Controller.prototype.getUnpaid = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "payment.status": { $ne: 'Terbayar' } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['invoice'])
        parameters['$or'] = [{ "invoice.all": query['invoice'] }, { "invoice.client": query['invoice'] }, { "invoice.partner": query['invoice'] }];

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getUnpaidReport = function (viewModels, user) {
    var self = this;

    var result = {
        "title": "LAPORAN SURAT JALAN BELUM TERBAYAR",
        "template_file": "lapbelumbayar.xlsx",
        "location": user.location.name,
        "user": user.name,
        "date": new Date(),
        "report_data": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var contents = _.map(viewModel.items, "content");
            var invoices = [];

            if (viewModel.invoice.all !== null)
                invoices.push(viewModel.invoice.all);
            if (viewModel.invoice.client !== null)
                invoices.push(viewModel.invoice.client);
            if (viewModel.invoice.partner !== null)
                invoices.push(viewModel.invoice.partner);

            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join() : " ",
                "total_coli": totalColli,
                "total_weight": totalWeight,
                "price": viewModel.cost.total,
                "payment_method": viewModel.payment.type.name,
                "invoice_no": invoices.length > 0 ? invoices.join() : " ",
                "transaction_date": viewModel.date
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sum_total_coli'] = sumTotalColli;
        result['sum_total_weight'] = sumTotalWeight;
        result['sum_price'] = sumPrice;

        return result;
    });
};

Controller.prototype.getRecapitulations = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };
    var recapParameters = { "items.recapitulations.quantity": { "$gt": 0 } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['trainType'])
        recapParameters['items.recapitulations.trainType'] = ObjectId(query['trainType']);

    if (query['vehicleNumber'])
        recapParameters['items.recapitulations.vehicleNumber'] = query['vehicleNumber'];

    if (query['driver'])
        recapParameters['items.recapitulations.driver'] = ObjectId(query['driver'])

    if (query['recapDate'])
        recapParameters['items.recapitulations.date'] = { "$gte": date.createLower(query['recapDate']), "$lte": date.createUpper(query['recapDate']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.recapitulations" },
        { "$match": recapParameters },
        { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
        { "$lookup": { "from": "trainTypes", "localField": "items.recapitulations.trainType", "foreignField": "_id", "as": "trainType" } },
        { "$lookup": { "from": "drivers", "localField": "items.recapitulations.driver", "foreignField": "_id", "as": "driver" } },
        { "$lookup": { "from": "locations", "localField": "destination", "foreignField": "_id", "as": "destination" } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getRecapitulationsReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN REKAP",
        "template_file": "laprekap.xlsx",
        "location": user.location.name,
        "train_type": "",
        "date": query['recapDate'],
        "recap_driver": null,
        "recap_car": null,
        "report_data": []
    };

    return co(function* () {
        var totalColliQuantity = 0;
        var totalRecappedColli = 0;
        var totalWeight = 0;
        var totalPrice = 0;

        var trainType = yield schemas.trainTypes.findOne({ "_id": ObjectId(viewModels[0].items.recapitulations.trainType) }).exec();
        result['train_type'] = trainType.name;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var driver = yield schemas.drivers.findOne({ _id: ObjectId(viewModel.items.recapitulations.driver) });
            var user = yield schemas.users.findOne({ _id: ObjectId(viewModel.items.recapitulations.user) });
            var paymentType = yield schemas.paymentTypes.findOne({ _id: ObjectId(viewModel.payment.type) });

            if (driver)
                result.recap_driver = driver.name;

            result.recap_car = viewModel.items.recapitulations.vehicleNumber;

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "content": viewModel.items.content,
                "total_coli": viewModel.items.recapitulations.quantity,
                "coli": viewModel.items.colli.quantity,
                "weight": viewModel.items.dimensions.weight,
                "price": viewModel.items.cost.shipping,
                "payment_method": paymentType.name,
                "recap_limas_color": viewModel.items.recapitulations.limasColor,
                "recap_relation_color": viewModel.items.recapitulations.relationColor,
                "transaction_date": viewModel.date,
                "destination_city": viewModel.destination[0].name
            });

            totalColliQuantity += _.parseInt(viewModel.items.colli.quantity);
            totalRecappedColli += _.parseInt(viewModel.items.recapitulations.quantity);
            totalWeight += parseFloat(viewModel.items.dimensions.weight);
            totalPrice += parseFloat(viewModel.items.cost.shipping);
        });

        result['sum_total_coli'] = totalColliQuantity;
        result['sum_coli'] = totalRecappedColli;
        result['sum_weight'] = totalWeight;
        result['sum_price'] = totalPrice;
        return result;
    });
};

Controller.prototype.getDeliveries = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": ObjectId(query['region']) };
    var deliveryParameters = { "items.deliveries.quantity": { "$gt": 0 } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['deliveryCode'])
        deliveryParameters['items.deliveries.deliveryCode'] = new RegExp(query['deliveryCode'], 'i');

    if (query['vehicleNumber'])
        deliveryParameters['items.deliveries.vehicleNumber'] = query['vehicleNumber'];

    if (query['driver'])
        deliveryParameters['items.deliveries.driver'] = ObjectId(query['driver'])

    if (query['deliveryDate'])
        deliveryParameters['items.deliveries.date'] = { "$gte": date.createLower(query['deliveryDate']), "$lte": date.createUpper(query['deliveryDate']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.deliveries" },
        { "$match": deliveryParameters },
        { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
        { "$lookup": { "from": "paymentTypes", "localField": "payment.type", "foreignField": "_id", "as": "paymentType" } },
        { "$lookup": { "from": "drivers", "localField": "items.deliveries.driver", "foreignField": "_id", "as": "driver" } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getDeliveriesReport = function (viewModels, user) {
    var self = this;

    var result = {
        "title": "LAPORAN PENGANTAR BARANG",
        "template_file": "lapdelivery.xlsx",
        "location": user.location.name,
        "user": user.name,
        "date": viewModels[0].items.deliveries.date,
        "delivery_driver": null,
        "delivery_car": null,
        "report_data": []
    };

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var driver = yield schemas.drivers.findOne({ _id: ObjectId(viewModel.items.deliveries.driver) });

            if (driver)
                result.delivery_driver = driver.name;

            result.delivery_car = viewModel.items.deliveries.vehicleNumber;
            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "receiver_address": viewModel.receiver.address,
                "receiver_contact": viewModel.receiver.contact,
                "content": viewModel.items.content,
                "total_coli": viewModel.items.colli.quantity,
                "coli": viewModel.items.deliveries.quantity,
                "price": viewModel.items.cost.shipping,
                "payment_method": viewModel.paymentType[0].name
            });
        });

        return result;
    });
};

Controller.prototype.getReturns = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": ObjectId(query['region']), "returned": true };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['returnDate'])
        parameters['returnInfo.created.date'] = { "$gte": date.createLower(query['returnDate']), "$lte": date.createUpper(query['returnDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender destination').skip(skip).limit(limit).exec();
};

Controller.prototype.getReturnsReport = function (viewModels, user) {
    var self = this;
    var result = {
        "title": "LAPORAN RETUR",
        "template_file": "lapretur.xlsx",
        "location": user.location.name,
        "destination": viewModels[0].destination.name,
        "user": user.name,
        "date": viewModels[0].returnInfo.modified.date,
        "report_data": []
    };

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {

            var deliveries = _.filter(viewModel.items.deliveries, function (delivery) {
                return delivery.quantity > 0;
            });

            var drivers = [];
            var vehicleNumbers = [];
            var deliveryDates = [];

            yield* _co.coEach(deliveries, function* (delivery) {
                var driver = yield schemas.drivers.findOne({ _id: ObjectId(delivery.driver) });

                if (drive)
                    drivers.push(driver.name);

                vehicleNumbers.push(delivery.vehicleNumber);
                deliveryDates.push(delivery.data);
            });

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "price": viewModel.cost.total,
                "limas_color": viewModel.returnInfo.limasColor,
                "relation_color": viewModel.returnInfo.relationColor,
                "partner_no": viewModel.returnInfo.relationCode,
                "delivery_driver": drivers.length > 0 ? drivers.join() : " ",
                "delivery_car_no": vehicleNumbers.length > 0 ? vehicleNumbers.join() : " ",
                "delivery_date": deliveryDates.length > 0 ? deliveryDates.join() : " ",
                "retur_signature": viewModel.returnInfo.signed ? 'v' : 'x',
                "retur_stamp": viewModel.returnInfo.stamped ? 'v' : 'x',
                "retur_received_by": viewModel.returnInfo.concernedPerson,
                "retur_porter_receipt": viewModel.returnInfo.receipt ? 'v' : 'x'
            });
        });

        return result;
    });
};

Controller.prototype.getUnconfirmed = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "returned": true, "confirmed": false };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['returnDate'])
        parameters['returnInfo.created.date'] = { "$gte": date.createLower(query['returnDate']), "$lte": date.createUpper(query['returnDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": 1 }).populate('sender').populate('destination').skip(skip).limit(limit).exec();
};

Controller.prototype.getUnconfirmedReport = function (viewModels, user) {
    var self = this;
    var result = {
        "title": "LAPORAN SURAT JALAN BELUM KEMBALI",
        "template_file": "lapbelumkembali.xlsx",
        "location": user.location.name,
        "user": user.name,
        "report_data": []
    };

    return co(function* () {

        var region = yield schemas.regions.findOne({ "_id": ObjectId(viewModels[0].destination.region) }).exec();
        result['destination'] = region.name;

        yield* _co.coEach(viewModels, function* (viewModel) {
            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "transaction_date": viewModel.date,
                "receiver": viewModel.receiver.name,
                "destination_city": viewModel.destination.name
            });
        });

        return result;
    });
};

Controller.prototype.getDeliveryList = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": 1 }).populate('sender destination regions.destination payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getDeliveryListReport = function (viewModels, user) {
    var self = this;

    var result = {
        "title": "LAPORAN DAFTAR KIRIM",
        "template_file": "lapdaftarkirim.xlsx",
        "location": user.location.name,
        "user": user.name,
        "date": new Date(),
        "report_data": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');
            var contents = _.map(viewModel.items, "content");

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join() : " ",
                "total_coli": totalColli,
                "total_weight": totalWeight,
                "price": viewModel.cost.total,
                "payment_method": viewModel.payment.type.name,
                "destination_region": viewModel.regions.destination.name,
                "transaction_date": viewModel.date,
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sum_total_coli'] = sumTotalColli;
        result['sum_total_weight'] = sumTotalWeight;
        result['sum_price'] = sumPrice;

        return result;
    });
};

Controller.prototype.getCommisions = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender destination regions.destination payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getCommisionsReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN KOMISI",
        "template_file": "lapkomisi.xlsx",
        "location": user.location.name,
        "user": user.name,
        "start_date": query['from'],
        "end_date": query['to'],
        "report_data": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        var region = yield schemas.regions.findOne({ "_id": ObjectId(viewModels[0].destination.region) }).exec();
        result['destination'] = region.name;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');
            var totalAdditionalCost = _.sumBy(viewModel.items, 'cost.additional');
            var contents = _.map(viewModel.items, "content");

            var priceWithoutPph = viewModel.cost.total;
            if (viewModel.cost.pph === 0.02)
                priceWithoutPph -= (data.cost.total * 0.02);

            else if (viewModel.cost.pph === 0.98)
                priceWithoutPph *= 0.98;

            result.report_data.push({
                "transaction_date": viewModel.date,
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join() : " ",
                "total_coli": totalColli,
                "total_weight": totalWeight,
                "cost": priceWithoutPph,
                "price": viewModel.cost.total,
                "bea_tambahan": totalAdditionalCost,
                "pph": viewModel.cost.pph,
                "bea_kuli": viewModel.cost.worker
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sum_total_coli'] = sumTotalColli;
        result['sum_total_weight'] = sumTotalWeight;
        result['sum_price'] = sumPrice;

        return result;
    });
};

module.exports = new Controller();