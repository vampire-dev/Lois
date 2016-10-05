  var mongoose = require('mongoose');
var date = require('../utils/date');
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

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['invoiceNumber'])
        parameters['invoice.all'] = new RegExp(query['invoiceNumber'], 'i');

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).skip(skip).limit(limit).populate('sender destination payment.type').lean().exec();
};

Controller.prototype.getList = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location'])};

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
                yield schemas.invoices.update(
                    { "number": viewModel.fromInvoice },
                    {
                        $pull: { "shippings": shipping._id },
                        $set: { "modified.user": user._id }
                    }
                );
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
        var sumTotalPpn = 0;

        yield* _co.coEach(invoice.shippings, function* (shippingId) {
            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(shippingId) }).populate('destination').exec();
            var totalWeight = _.sumBy(shipping.items, 'dimensions.weight');
            var totalColli = _.sumBy(shipping.items, 'colli.quantity');

            result.report_data.push({
                "number": shipping.number,
                "transaction_date": shipping.date ? shipping.date: " ",
                "spb_no": shipping.spbNumber,
                "destination_city": shipping.destination.name,
                "total_coli": totalColli,
                "total_weight": totalWeight,
                "bea_kuli": shipping.cost.worker,
                "partner_fee": shipping.cost.expedition,
                "price": shipping.cost.total,
                "ppn": shipping.cost.ppn * shipping.cost.total
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumWorkerCost += shipping.cost.worker;
            sumExpeditionCost += shipping.cost.expedition;
            sumTotalCost += shipping.cost.total;
            sumTotalPpn += shipping.cost.ppn * shipping.cost.total;
        });

        var terbilang = self.getTerbilang(sumTotalCost);
        result['sum_total_coli'] = sumTotalColli;
        result['sum_total_weight'] = sumTotalWeight;
        result['sum_bea_kuli'] = sumWorkerCost;
        result['sum_partner_fee'] = sumExpeditionCost;
        result['sum_ppn'] = sumTotalPpn;
        result['sum_price'] = sumTotalCost;
        result['terbilang_client'] = self.getTerbilang(sumTotalCost);
        result['terbilang_all'] = self.getTerbilang(sumTotalCost);
        result['terbilang_partner'] = self.getTerbilang(sumExpeditionCost);
        
        return result;
    });
};

Controller.prototype.getTerbilang = function (ammount) {
    var num = parseFloat(ammount).toFixed(2);
    var rev = num.toString().replace(/\.[0-9]+/, '').split('').reverse();

    if (num.toString().search(/\./) >= 0)
        var revDecimal = num.toString().replace(/[0-9]+\./, '').split('').reverse();

    var result = '';
    var thousands = '';

    // handle decimal
    if (revDecimal) {
        for (var i = 0; i < revDecimal.length; i++)
            result = toWords(revDecimal, i, true) + result;
        result = 'koma ' + result;
    }

    // handle non-decimal
    for (var i = 0; i < rev.length; i++) {
        if (i == 3) {
            thousands = 'ribu ';
        } else if (i == 6) {
            thousands = 'juta ';
        } else if (i == 9) {
            thousands = 'miliar ';
        } else if (i == 12) {
            thousands = 'triliun ';
        } else if (i == 15) {
            thousands = 'billiun ';
        }

        if (rev[i] != '0') {
            if ((i % 3) == 0) {
                if (rev[i + 1] == '1') {
                    result = toWords(rev, i) + 'belas ' + thousands + result;
                    i++;
                } else {
                    result = toWords(rev, i) + thousands + result;
                }
                thousands = '';
            } else if ((i % 3) == 2) {
                result = toWords(rev, i) + 'ratus ' + thousands + result;
                thousands = '';
            } else if ((i % 3) == 1) {
                result = toWords(rev, i) + 'puluh ' + thousands + result;
                thousands = '';
            }
        }
    }

    return result + " rupiah";

    function toWords(arr, index, decimal) {
        var number = arr[index];
        switch (number) {
            case '.':
                if (decimal)
                    return 'koma ';
            case '0':
                if (decimal)
                    return 'nol ';
                return '';
            case '1':
                if (!decimal && (index == 1 || index == 2 || arr[index + 1] == '1' || (index % 3) == 1 || (index % 3) == 2))
                    return 'se';
                return 'satu ';
            case '2':
                return 'dua ';
            case '3':
                return 'tiga ';
            case '4':
                return 'empat ';
            case '5':
                return 'lima ';
            case '6':
                return 'enam ';
            case '7':
                return 'tujuh ';
            case '8':
                return 'delapan ';
            case '9':
                return 'sembilan ';
        }
    }
};

Controller.prototype.updateInvoice = function (viewModel) {
    return co(function* () {
        yield schemas.invoices.update(
            { "_id": viewModel.invoiceId },
            {
                "$set": {
                    "to": viewModel.to,
                    "location": viewModel.location
                }
            }
        );
    });
};

module.exports = new Controller();