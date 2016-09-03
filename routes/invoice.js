var router = require('express').Router();
var config = require('../common').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/invoice');

router.get('/lois/invoice', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'invoice/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAll(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'invoice/getList', auth.isAuthenticated, function (req, res) {
    controller.getList(JSON.parse(req.query['query'])).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'invoice/create', auth.isAuthenticated, function (req, res) {
    controller.create(req.body).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

module.exports = router;
