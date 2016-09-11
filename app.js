var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./configurator').config();
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '1000mb' }));
app.use(session({ secret: 'sdfe34234fdff234fsdf', saveUninitialized: true, resave: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./routes/region'));
app.use(require('./routes/location'));
app.use(require('./routes/paymentType'));
app.use(require('./routes/client'));
app.use(require('./routes/tariff'));
app.use(require('./routes/partner'));
app.use(require('./routes/driver'));
app.use(require('./routes/itemType'));
app.use(require('./routes/packingType'));
app.use(require('./routes/role'));
app.use(require('./routes/user'));
app.use(require('./routes/trainType'));
app.use(require('./routes/menu'));
app.use(require('./routes/report'));
app.use(require('./routes/roleMenu'));
app.use(require('./routes/roleReport'));
app.use(require('./routes/home'));
app.use(require('./routes/shipping'));
app.use(require('./routes/deliveryOrder'));
app.use(require('./routes/recapitulation'));
app.use(require('./routes/delivery'));
app.use(require('./routes/return'));
app.use(require('./routes/payment'));
app.use(require('./routes/invoice'));
app.use(require('./routes/reportData'));
app.use(require('./routes/notification'));
app.use(require('./routes/audit'));

app.get('/', function (req, res) {
    res.redirect('/lois');
});

app.get('/lois', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port, function (err) {
    mongoose.connect(config.dsn);

    mongoose.connection.on('connect', function (err) {
        console.log('Database is running');
    });

    console.log('Server is running on port ' + config.port);
});

module.exports = app;
