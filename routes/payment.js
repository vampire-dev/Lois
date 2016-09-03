var router = require('express').Router();
var config = require('../common').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/payment');

router.get('/lois/payment', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'payment/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAll(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'payment/pay', auth.isAuthenticated, function (req, res) {
    controller.pay(req.body, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;