var mysql = require('mysql-promise')();
var mongoose = require('mongoose');
var config = require('./common').config();
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
    this.regionModel = require('./models/region');
    this.locationModel = require('./models/location');
    this.paymentTypeModel = require('./models/paymentType');
    this.itemTypeModel = require('./models/itemType');
    this.packingTypeModel = require('./models/packingType');
    this.trainTypeModel = require('./models/trainType');
    this.clientModel = require('./models/client');
    this.tariffModel = require('./models/tariff');
    this.shippingModel = require('./models/shipping');
};

Migration.prototype.regions = function () {
    var query = 'SELECT * FROM regional';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var entity = new self.regionModel({ "number": row.id, "name": row.name });
                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.locations = function () {
    var query = 'SELECT * FROM kota';
    var self = this;

    mysql.query(query).spread(function (rows) {
        co(function* () {
            try {
                console.log('Mysql data --> ', row);
                var region = yield self.regionModel.findOne({ "number": row.regional });
                var entity = new self.locationModel({ "number": row.id, "name": row.name, "prefix": null, "region": region._id });
                yield entity.save();
                console.log('MongoDB data --> ', entity);
            }
            catch (error) {
                console.log(error);
            }
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.paymentTypes = function () {
    var query = 'SELECT * FROM payment_type';
    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var entity = new self.paymentTypeModel({ "number": row.id, "name": row.name });
                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.itemTypes = function () {
    var query = 'SELECT * FROM jenis_barang';
    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var entity = new self.itemTypeModel({ "number": row.id, "name": row.name });
                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.packingTypes = function () {
    var query = 'SELECT * FROM bungkus_barang';
    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var entity = new self.packingTypeModel({ "number": row.id, "name": row.name });
                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.trainTypes = function () {
    var query = 'SELECT * FROM jenis_kereta';
    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var entity = new self.trainTypeModel({ "number": row.id, "name": row.name });
                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.clients = function () {
    var query = 'SELECT * FROM clients WHERE lok_input IS NOT NULL AND lok_input <> ""';
    console.log('Fetching clients, please wait');

    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var location = yield self.locationModel.findOne({ "name": row.lok_input });

                    var entity = new self.clientModel({
                        "number": row.id,
                        "name": row.name == '' ? ' ' : row.name,
                        "address1": row.address,
                        "address2": row.location,
                        "contact": row.telp,
                        "quota": row.kuota,
                        "location": location._id
                    });

                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.tariffs = function () {
    var query = 'SELECT * FROM harga';
    mysql.query(query).spread(function (rows) {
        co(function* () {
            yield* _co.coEach(rows, function* (row) {
                try {
                    console.log('Mysql data --> ', row);
                    var client = yield self.clientModel.findOne({ "number": row.idclient });
                    var location = yield self.locationModel.findOne({ "number": row.idkotatujuan });

                    var entity = new self.tariffModel({
                        "client": client._id === 0 ? null : client._id,
                        "destination": location._id,
                        "minimum": row.hargaminimum,
                        "prices": [row.Harga, 0, 0]
                    });

                    yield entity.save();
                    console.log('MongoDB data --> ', entity);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }).catch(function (mysqlError) {
        console.log(mysqlError.message);
    });
};

Migration.prototype.shippings = function () {

}

var migration = new Migration();

migration.regions();
migration.locations();
