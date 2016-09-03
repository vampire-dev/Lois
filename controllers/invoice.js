var mongoose = require('mongoose');
var model = require('../models/shipping');
var invoiceModel = require('../models/invoice');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": objectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['sender'])
        parameters['sender'] = objectId(query['sender']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.find(parameters).sort({"number": -1}).populate('sender').populate('destination').populate('payment.type').lean().exec();
};

Controller.prototype.getList = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['invoiceNumber']) 
        parameters['number'] = new RegExp(query['invoiceNumber'], 'i');

    if (query['fromInvoice'] && query['toInvoice'])
        parameters['date'] = { "$gte": date.createLower(query['fromInvoice']), "$lte": date.createUpper(query['toInvoice']) };

    return invoiceModel.find(parameters)
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
        var latestInvoice = yield invoiceModel.findOne({}).sort({ "inc": -1 }).exec();
        var inc = 1;

        if (latestInvoice)
            inc = latestInvoice.inc + 1;

        var invoice = {
            "number": inc + "/LSAN/KW/" + currentDate.getFullYear(),
            "inc": inc,
            "to": viewModels[0].to,
            "location": viewModels[0].location,
            "type": viewModels[0].type,
            "shippings": []
        };

        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield model.findOne({ _id: viewModel.shippingId });

            if (!shipping)
                return;

            if (shipping.invoice.all !== null)
                return;

            invoice.shippings.push(viewModel.shippingId);

            invoice.type === 'Semua' ? shipping.invoice.all = invoice.number : invoice.type === 'Klien' ?
                shipping.invoice.client = invoice.number :
                shipping.invoice.partner = invoice.number;

            yield shipping.save();
        });

        return new invoiceModel(invoice).save();
    });
};

Controller.prototype.getInvoiceReport = function (invoice, user) {
    var self = this;

    var result = {
        "title": "LAPORAN TAGIHAN",
        "template_file": "laptagihan.xlsx",
        "location": user.location.name,
        "invoice_no": invoice.number,
        "invoice_date": invoice.date,
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
            var shipping = yield model.findOne({ _id: objectId(shippingId) }).populate('destination').exec();
            var totalWeight = _.sumBy(shipping.items, 'dimensions.weight');
            var totalColli = _.sumBy(shipping.items, 'colli.quantity');

            result.report_data.push({
                "transaction_date": shipping.date,
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