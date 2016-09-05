var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/PackingTypeController');

router.get(config.api + 'packingType/get', auth.isAuthenticated, function (req, res) {
    controller.get(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'packingType/getAll', auth.isAuthenticated, function (req, res) {
    controller.getAll(JSON.parse(req.query['query'])).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'packingType/save', auth.isAuthenticated, function (req, res) {
    controller.save(req.body).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.delete(config.api + 'packingType/delete', auth.isAuthenticated, function (req, res) {
    controller.delete(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;