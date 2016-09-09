var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {}

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "confirmed": true };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['invoiceNumber'])
        parameters['invoice.client'] = new RegExp(query['invoiceNumber'], 'i');

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).skip(skip).limit(limit).populate('sender destination payment.type').lean().exec();
};

Controller.prototype.getList = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['invoiceNumber'])
        parameters['number'] = new RegExp(query['invoiceNumber'], 'i');

    if (query['fromInvoice'] && query['toInvoice'])
        parameters['modified.date'] = { "$gte": date.createLower(query['fromInvoice']), "$lte": date.createUpper(query['toInvoice']) };

    return schemas.invoices.find(parameters)
        .populate('shippings.shipping').sort({ "inc": - 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

Controller.prototype.create = function (viewModels, user) {
    var self = this;
    var currentDate = new Date();

    return co(function* () {
        var latestInvoice = yield schemas.invoices.findOne({ "inputLocation": ObjectId(user.location._id) }).sort({ "inc": -1 }).exec();
        var inc = 1;

        if (latestInvoice)
            inc = latestInvoice.inc + 1;

        var invoice = {
            "number": inc + "/LSAN/KW/" + currentDate.getFullYear(),
            "inc": inc,
            "to": viewModels[0].to,
            "location": viewModels[0].location,
            "type": viewModels[0].type,
            "shippings": [],
            "inputLocation": user.location._id,
            "created": {
                "date": new Date(),
                "user": user._id
            },
            "modified": {
                "date": new Date(),
                "user": user._id
            },
        };

        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield schemas.shippings.findOne({ _id: viewModel.shippingId });

            if (!shipping)
                return;

            if ((invoice.type === 'Klien' || invoice.type === 'Partner') && shipping.invoice.all !== null)
                return;

            else if (invoice.type === 'Semua' && (shipping.invoice.client !== null || shipping.invoice.partner !== null))
                return;

            invoice.shippings.push(viewModel.shippingId);

            if (invoice.type == 'Semua')
                shipping.invoice.all = invoice.number;
            else if (invoice.type == 'Klien')
                shipping.invoice.client = invoice.number;
            else if (invoice.type == 'Partner')
                shipping.invoice.partner = invoice.number;

            yield shipping.save();
        });

        return new schemas.invoices(invoice).save();
    });
};

Controller.prototype.change = function (viewModels, user) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield schemas.shippings.findOne({ "_id": ObjectId(viewModel.shippingId) }).exec();

            if (!shipping)
                return;

            if (shipping.invoice.client !== null || shipping.invoice.partner !== null)
                return;

            var toInvoice = yield schemas.invoices.findOne({ "number": viewModel.toInvoice }).exec();
            
            if (!toInvoice)
                return;

            if (toInvoice.type !== 'Semua')
                return;

            var fromInvoice = yield schemas.invoices.findOne({ "number": viewModel.fromInvoice }).exec();

            if (fromInvoice) {
                var shippings = _.remove(fromInvoice.shippings, function (invoiceShipping) {
                    return invoiceShipping.toString() === shipping._id.toString();
                });

                fromInvoice.shippings = shippings;
                fromInvoice.modified.user = user._id;
                yield fromInvoice.save();
            }

            shipping.invoice.all = toInvoice.number;

            toInvoice.shippings.push(shipping._id);
            toInvoice.modified.user = user._id;

            yield toInvoice.save();
            yield shipping.save();
        });
    }); 
};

Controller.prototype.getInvoiceReport = function (invoice, user) {
    var self = this;

    var result = {
        "title": "LAPORAN TAGIHAN",
        "template_file": "laptagihan.xlsx",
        "location": user.location.name,
        "invoice_no": invoice.number,
        "invoice_date": invoice.modified.date,
        "user": user.name,
        "tertagih": invoice.to,
        "tertagih_location": invoice.location,
        "report_data": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumWorkerCost = 0;
        var sumExpeditionCost = 0;
        var sumTotalCost = 0;

        yield* _co.coEach(invoice.shippings, function* (shippingId) {
            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(shippingId) }).populate('destination').exec();
            var totalWeight = _.sumBy(shipping.items, 'dimensions.weight');
            var totalColli = _.sumBy(shipping.items, 'colli.quantity');

            result.report_data.push({
                "transaction_date": shipping.modified.date,
                "spb_no": shipping.spbNumber,
                "destination_city": shipping.destination.name,
                "total_coli": totalColli,
                "total_weight": totalWeight,
                "bea_kuli": shipping.cost.worker,
                "partner_fee": shipping.cost.expedition,
                "price": shipping.cost.total
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumWorkerCost += shipping.cost.worker;
            sumExpeditionCost += shipping.cost.expedition;
            sumTotalCost += shipping.cost.total;
        });

        var terbilang = self.getTerbilang(sumTotalCost);
        result['sum_total_coli'] = sumTotalColli;
        result['sum_total_weight'] = sumTotalWeight;
        result['sum_bea_kuli'] = sumWorkerCost;
        result['sum_partner_fee'] = sumExpeditionCost;
        result['sum_price'] = sumTotalCost
        result['terbilang'] = self.getTerbilang(sumTotalCost);
        return result;
    });
};

Controller.prototype.getTerbilang = function (amount) {
    amount = String(amount);
    var numbers = new Array('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
    var words = new Array('', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan');
    var level = new Array('', 'Ribu', 'Juta', 'Milyar', 'Triliun');
    var sentence = '';

    if (amount.length > 15) {
        sentence = "Diluar Batas";
        return sentence;
    }

    for (i = 1; i <= amount.length; i++)
        numbers[i] = amount.substr(-(i), 1);

    i = 1;
    j = 0;
    sentence = "";

    while (i <= amount.length) {
        subSentence = "";
        word1 = "";
        word2 = "";
        word3 = "";

        if (numbers[i + 2] != "0") {
            if (numbers[i + 2] == "1") {
                word1 = "Seratus";
            } else {
                word1 = words[numbers[i + 2]] + " Ratus";
            }
        }

        if (numbers[i + 1] != "0") {
            if (numbers[i + 1] == "1") {
                if (numbers[i] == "0") {
                    word2 = "Sepuluh";
                } else if (numbers[i] == "1") {
                    word2 = "Sebelas";
                } else {
                    word2 = words[numbers[i]] + " Belas";
                }
            } else {
                word2 = words[numbers[i + 1]] + " Puluh";
            }
        }

        if (numbers[i] != "0") {
            if (numbers[i + 1] != "1") {
                word3 = words[numbers[i]];
            }
        }

        if ((numbers[i] != "0") || (numbers[i + 1] != "0") || (numbers[i + 2] != "0")) {
            subSentence = word1 + " " + word2 + " " + word3 + " " + level[j] + " ";
        }

        sentence = subSentence + sentence;
        i = i + 3;
        j = j + 1;
    }

    if ((numbers[5] == "0") && (numbers[6] == "0")) {
        sentence = sentence.replace("Satu Ribu", "Seribu");
    }

    return sentence + "Rupiah";
};


module.exports = new Controller();