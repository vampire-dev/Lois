var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/ReportDataController');

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
    var query = JSON.parse(req.query['query']);
    controller.getRecapitulationsReport(req.body, query, req.session.user).then(function (result) {
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
    var query = JSON.parse(req.query['query']);
    controller.getDeliveriesReport(req.body, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});
router.get(config.api + 'reportData/getReturns', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['region'] = req.session.user.location.region;

    controller.getReturns(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getReturnsReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getReturnsReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getUnconfirmed', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getUnconfirmed(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getUnconfirmedReport', auth.isAuthenticated, function (req, res) {
    controller.getUnconfirmedReport(req.body, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getPaid', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getPaid(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getPaidReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getPaidReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});


router.get(config.api + 'reportData/getUnpaid', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getUnpaid(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getUnpaidReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getUnpaidReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getDeliveryList', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;
    query['locationRegion'] = req.session.user.location.region;

    controller.getDeliveryList(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getDeliveryListReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getDeliveryListReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getCommisions', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;
    query['locationRegion'] = req.session.user.location.region;

    controller.getCommisions(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getCommisionsReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getCommisionsReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getPayOff', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getPayOff(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getPayOffReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getPayOffReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'reportData/getPartner', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getPartner(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'reportData/getPartnerReport', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    controller.getPartnerReport(req.body, query, req.session.user).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;