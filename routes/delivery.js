var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/DeliveryController');

router.get('/lois/delivery', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'delivery/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['region'] = req.session.user.location.region;

    controller.getAll(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'delivery/getAllCancel', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['region'] = req.session.user.location.region;

    controller.getAllCancel(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'delivery/delivery', auth.isAuthenticated, function (req, res) {
    controller.delivery(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'delivery/cancelDelivery', auth.isAuthenticated, function (req, res) {
    controller.cancelDelivery(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        console.log(error);
        return res.status(500).send(error.message);
    });
});

module.exports = router;