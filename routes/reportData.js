var router = require('express').Router();
var config = require('../common').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/reportData');

router.get('/lois/report', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'reportData/getRecapitulations', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getRecapitulations(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getRecapitulationsReport', auth.isAuthenticated, function (req, res) {

    controller.getRecapitulationsReport(req.body, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getDeliveries', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['region'] = req.session.user.location.region;

    controller.getDeliveries(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getDeliveriesReport', auth.isAuthenticated, function (req, res) {

    controller.getDeliveriesReport(req.body, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;