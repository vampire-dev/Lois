var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/InvoiceController');

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
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getList(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'invoice/create', auth.isAuthenticated, function (req, res) {
    controller.create(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'invoice/change', auth.isAuthenticated, function (req, res) {
    controller.change(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'invoice/getInvoiceReport', auth.isAuthenticated, function (req, res) {
    controller.getInvoiceReport(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'invoice/updateInvoice', auth.isAuthenticated, function (req, res) {
    controller.updateInvoice(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

module.exports = router;
