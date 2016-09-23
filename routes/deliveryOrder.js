var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/DeliveryOrderController');

router.get('/lois/delivery-order', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'deliveryOrder/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;
    query['locationRegion'] = req.session.user.location.region;

    controller.getAll(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'deliveryOrder/getDataReport', auth.isAuthenticated, function (req, res) {
    var result = controller.getDataReport(req.body);
    return res.status(200).send(result);
});

module.exports = router;
