var mysql = require('mysql-promise')();
var mongoose = require('mongoose');
var config = require('./configurator').config();
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');

mongoose.Promise = global.Promise;
mongoose.connect(config.dsn);

mysql.configure({
    "host": config.migrationHost,
    "user": config.migrationUser,
    "password": config.migrationPass,
    "database": config.migrationDb
});

function Migration() {
    this.schemas = require('./models/schemas');
}

Migration.prototype.regions = function () {
    var query = 'select * from regional';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var schema = new self.schemas.regions({ "number": row.id, "name": row.name });
                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.locations = function () {
    var query = "select * from kota";
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var region = yield self.schemas.regions.findOne({ "number": row.regional }).exec();

                    if (!region)
                        return;

                    var schema = new self.schemas.locations({ "number": row.id, "prefix": null, "name": row.name, "region": region._id });
                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    });
};

Migration.prototype.paymentTypes = function () {
    var query = 'select * from payment_type';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var schema = new self.schemas.paymentTypes({ "number": row.id, "name": row.name });
                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.itemTypes = function () {
    var query = 'select * from jenis_barang';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var schema = new self.schemas.itemTypes({ "number": row.id, "name": row.name });
                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.packingTypes = function () {
    var query = 'select * from bungkus_barang';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var schema = new self.schemas.packingTypes({ "number": row.id, "name": row.name });
                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.trainTypes = function () {
    var query = 'select * from jenis_kereta';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var schema = new self.schemas.trainTypes({ "number": row.id, "name": row.name });
                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.clients = function () {
    var query = 'select * from clients where lok_input is not null and lok_input <> ""';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var location = yield self.schemas.locations.findOne({ "name": row.lok_input });

                    var schema = new self.schemas.clients({
                        "number": row.id,
                        "name": row.name == '' ? ' ' : row.name,
                        "address1": row.address,
                        "address2": row.location,
                        "contact": row.telp,
                        "quota": row.kuota,
                        "location": location._id
                    });

                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.tariffs = function () {
    var query = 'select * from harga';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var client = yield self.schemas.clients.findOne({ "number": row.idclient });
                    var location = yield self.schemas.locations.findOne({ "number": row.idkotatujuan });

                    if (!client || !location)
                        return;

                    var schema = new self.schemas.tariffs({
                        "client": client._id === 0 ? null : client._id,
                        "destination": location._id,
                        "minimum": row.hargaminimum,
                        "prices": [row.Harga, 0, 0]
                    });

                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        }).catch(function (error) {
            console.log(error.message);
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
}

Migration.prototype.shippings = function (inputLocation, skip, limit) {
    var query = "select t.*, s.no, c.name as colliCost FROM transaction t LEFT JOIN list_tagihan l ON l.transaction = t.id " +
        "LEFT JOIN surat_tagihan s ON s.id = l.surat_tagihan LEFT JOIN biaya_coli c ON t.biaya_coli = c.id WHERE t.lokasi_input = '"
        + inputLocation + "' LIMIT " + limit + " OFFSET " + skip;

    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    if (row.lokasi_input < 1)
                        return;
                    if (row.sender < 1)
                        return;
                    if (row.kota < 1)
                        return;
                    if (row.jenis_barang < 1)
                        return;

                    var location = yield self.schemas.locations.findOne({ "name": row.lokasi_input }).exec();
                    var sender = yield self.schemas.clients.findOne({ "number": row.sender }).populate('location').exec();
                    var dest = yield self.schemas.locations.findOne({ "number": row.kota }).exec();
  
                    if(!sender)
                        sender = yield self.schemas.clients.findOne({ "name": "Kosong" }).populate('location').exec();

                    if (!dest)
                        dest = yield self.schemas.locations.findOne({ "name": "Kosong" }).exec();

                    var regionDest = yield self.schemas.regions.findOne({ "_id": mongoose.Types.ObjectId(dest.region)  }).exec();
                    var regionSource = yield self.schemas.regions.findOne({ "_id": mongoose.Types.ObjectId(sender.location.region) }).exec();
                    var itemType = yield self.schemas.itemTypes.findOne({ "number": row.jenis_barang }).exec();
                    var paymentType = yield self.schemas.paymentTypes.findOne({ "number": row.payment_type }).exec();
                    var packingType = yield self.schemas.packingTypes.findOne({ "number": row.bungkus_barang }).exec();
                    var trainType = yield self.schemas.trainTypes.findOne({ "number": row.jenis_kereta }).exec();

                    var schema = new self.schemas.shippings({
                        "number": row.id,
                        "spbNumber": row.spb_no,
                        "date": Date.parse(row.date) || 0,
                        "receiver": {
                            "name": row.receiver,
                            "address": row.receiver_address,
                            "contact": null
                        },
                        "sender": sender._id,
                        "destination": dest._id,
                        "regions": {
                            "source": regionSource._id,
                            "destination": regionDest._id
                        },
                        "partner": null,
                        "payment": {
                            "type": paymentType._id,
                            "location": null,
                            "status": row.status_bayar === 2 ? "Terbayar" : "Belum Terbayar",
                            "phases": row.status_bayar === 2 ? [{
                                "transferDate": row.tgl_bayar,
                                "date": row.tgl_bayar,
                                "bank": null,
                                "amount": row.price
                            }] : [],
                            "paid": row.status_bayar === 2 ? row.price : 0
                        },
                        "cost": {
                            "pph": 0.0,
                            "worker": 0,
                            "expedition": row.biaya_ekspedisi,
                            "total": row.price
                        },
                        "notes": {
                            "shipping": row.notes,
                            "partner": null,
                            "po": row.PO
                        },
                        "invoice": {
                            "all": row.no,
                            "client": null,
                            "partner": null
                        },
                        "tariff": 0,
                        "colli": row.coli,
                        "weight": row.weight,
                        "audited": false,
                        "returned": (row.status_transaksi == 5 || row.status_transaksi == 3) ? true : false,
                        "confirmed": row.status_transaksi == 3 ? true : false,
                        "returnInfo": {
                            "accepted": row.status_transaksi >= 3 ? true : false,
                            "created": {
                                "date": Date.parse(row.created_time) || 0,
                                "user": null
                            },
                            "modified": {
                                "date": Date.parse(row.modified_time) || 0,
                                "user": null
                            },
                        },
                        "inputLocation": location._id,
                        "created": {
                            "date": Date.parse(row.created_time) || 0,
                            "user": null
                        },
                        "modified": {
                            "date": Date.parse(row.modified_time) || 0,
                            "user": null
                        },
                        "items": {
                            "itemType": itemType._id,
                            "packingType": packingType._id,
                            "content": row.isi,
                            "dimensions": {
                                "length": row.Panjang,
                                "width": row.Lebar,
                                "height": row.Tinggi,
                                "weight": row.weight
                            },
                            "colli": {
                                "quantity": row.coli,
                                "available": row.status_transaksi == 1 ? row.coli : 0,
                                "delivered": row.status_transaksi >= 4 ? row.coli : 0
                            },
                            "cost": {
                                "colli": row.colliCost,
                                "additional": row.bea_tambahan,
                                "discount": row.diskon,
                                "shipping": row.price
                            },
                            "status": row.status_transaksi <= 1 ? 'Belum Terekap' : row.status_transaksi == 2 ? 'Terekap' : 'Terkirim',
                            "audited": false,
                            "recapitulations": [],
                            "deliveries": []
                        }
                    });

                    if (schema.items[0].status == "Terekap") {
                        schema.items[0].recapitulations.push({
                            "item": schema.items[0]._id,
                            "quantity": row.coli,
                            "available": row.coli,
                            "trainType": trainType._id,
                            "date": Date.parse(row.modified_time) || 0
                        });
                    }
                    else if (schema.items[0].status == "Terkirim") {
                        schema.items[0].recapitulations.push({
                            "item": schema.items[0]._id,
                            "quantity": row.coli,
                            "weight": row.weight,
                            "available": 0,
                            "trainType": trainType._id,
                            "date": Date.parse(row.modified_time) || 0
                        });

                        schema.items[0].deliveries.push({
                            "item": schema.items[0]._id,
                            "recapitulation": schema.items[0].recapitulations[0]._id,
                            "quantity": row.coli,
                            "available": row.coli,
                            "weight": row.weight,
                            "date": Date.parse(row.modified_time) || 0
                        });
                    }

                    yield schema.save();
                    console.log('MongoDB data --> ', schema);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    });
}

Migration.prototype.invoices = function () {
    var query = "select s.no, s.date, t.spb_no, substring_index(substring_index(s.no , '/', 1),' ',1) as inc, c.name as client, s.lokasi as location, 'Semua' as type " +
                "from list_tagihan l left join surat_tagihan s on l.surat_tagihan = s.id left join transaction t on l.transaction = t.id " +
                "left join clients c on s.clients = c.id";

    var currentInc = null;
    var self = this;

    mysql.query(query).spread(function (rows) {
        
        co(function* () {
            var currentInvoice = null;

            yield* _co.coEach(rows, function* (row) {
                try {
                    if (currentInc == null) {
                        currentInc = row.inc;
                        currentInvoice = new self.schemas.invoices({
                            "number": row.no,
                            "date": row.date,
                            "inc": row.inc,
                            "to": row.client,
                            "location": row.location === '' ? " " : row.location,
                            "type": row.type,
                            "shippings": []
                        });

                        console.log(currentInvoice);
                    }

                    if (row.inc !== currentInc) {
                        console.log("different inc");
                        yield currentInvoice.save();
                        currentInc = null;
                    }

                    else {
                        var shipping = yield self.schemas.shippings.findOne({ "spbNumber": row.spb_no }).exec();
                        currentInvoice.shippings.push(shipping._id);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    });
};

var migration = new Migration();

/*migration.regions();
migration.locations();
migration.paymentTypes();
migration.itemTypes();
migration.packingTypes();
migration.trainTypes();
migration.clients();
migration.tariffs();
migration.shippings("Jakarta", 0, 1000);*/
migration.invoices();