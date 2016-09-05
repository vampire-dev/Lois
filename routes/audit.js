var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/AuditController');

router.get('/lois/audit', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'audit/getAll', auth.isAuthenticated, function (req, res) {
    controller.getAll(JSON.parse(req.query['query'])).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'audit/process', auth.isAuthenticated, function (req, res) {
    var ctrl = controller.reject(req.body);

    if (req.body.status == 'approved')
        ctrl = controller.approve(req.body);

    ctrl.then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;