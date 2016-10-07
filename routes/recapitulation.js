var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/RecapitulationController');

router.get('/lois/recapitulation', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'recapitulation/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAll(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'recapitulation/getAllCancel', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAllCancel(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'recapitulation/recap', auth.isAuthenticated, function (req, res) {
    controller.recap(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'recapitulation/cancelRecap', auth.isAuthenticated, function (req, res) {
    controller.cancelRecap(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        console.log(error);
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'recapitulation/updateRecap', auth.isAuthenticated, function (req, res) {
    controller.updateRecap(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        console.log(error);
        return res.status(500).send(error.message);
    });
});

module.exports = router;