var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/LocationController');

router.get(config.api + 'location/get', auth.isAuthenticated, function (req, res) {
    controller.get(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'location/getAll', auth.isAuthenticated, function (req, res) {
    controller.getAll(JSON.parse(req.query['query'])).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'location/save', auth.isAuthenticated, function (req, res) {
    controller.save(req.body).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.delete(config.api + 'location/delete', auth.isAuthenticated, function (req, res) {
    controller.delete(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;