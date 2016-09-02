var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./common').config();
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'sdfe34234fdff234fsdf', saveUninitialized: true, resave: true }));

app.listen(config.port, function (err) {
    mongoose.connect(config.dsn);

    mongoose.connection.on('connect', function (err) {
        console.log('Database is running');
    });

    console.log('Server is running on port ' + config.port);
});