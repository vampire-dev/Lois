var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./common').config();
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'sdfe34234fdff234fsdf', saveUninitialized: true, resave: true }));
app.use(require('./routes/region'));
app.use(require('./routes/location'));
app.use(require('./routes/paymentType'));
app.use(require('./routes/client'));
app.use(require('./routes/tariff'));
app.use(require('./routes/partner'));
app.use(require('./routes/driver'));
app.use(require('./routes/packingType'));
app.use(require('./routes/role'));
app.use(require('./routes/user'));
app.use(require('./routes/trainType'));
app.use(require('./routes/menu'));
app.use(require('./routes/report'));
app.use(require('./routes/roleMenu'));
app.use(require('./routes/roleReport'));

app.listen(config.port, function (err) {
    mongoose.connect(config.dsn);

    mongoose.connection.on('connect', function (err) {
        console.log('Database is running');
    });

    console.log('Server is running on port ' + config.port);
});

app.get('/', function (req, res) {
    res.redirect('/lois');
});

app.get('/lois', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/lois/configuration', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});