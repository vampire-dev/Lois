var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/ShippingController');

router.get('/lois/shipping', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'shipping/get', auth.isAuthenticated, function (req, res) {
    controller.get(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'shipping/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAll(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'shipping/save', auth.isAuthenticated, function (req, res) {
    var data = req.body;
    data['inputLocation'] = req.session.user.location._id;
    data['modified']['user'] = req.session.user._id;

    controller.save(data, false).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'shipping/add', auth.isAuthenticated, function (req, res) {
    controller.add(req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'shipping/getDataReport', auth.isAuthenticated, function (req, res) {
    controller.getDataReport(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

module.exports = router;