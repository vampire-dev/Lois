var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/NotificationController');

router.get('/lois/notification', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'notification/getAll', auth.isAuthenticated, function (req, res) {
    controller.getAll(JSON.parse(req.query['query'])).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.delete(config.api + 'notification/delete', auth.isAuthenticated, function (req, res) {
    controller.delete(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;