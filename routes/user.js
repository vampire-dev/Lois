var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/UserController');

router.get('/lois/login', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'user/get', auth.isAuthenticated, function (req, res) {
    controller.get(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'user/getAll', auth.isAuthenticated, function (req, res) {
    controller.getAll(JSON.parse(req.query['query'])).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'user/logout', auth.isAuthenticated, function (req, res) {
    req.session.destroy(function (err) {
        if (err)
            return res.status(500).send(err.message);

        return res.status(200).send('Ok');
    });
});

router.get(config.api + 'user/getSession', auth.isAuthenticated, function (req, res) {
    return res.status(200).send({
        "name": req.session.user.name,
        "location": req.session.user.location.name,
        "role": req.session.user.role.name,
        "menus": req.session.menus,
        "reports": req.session.reports
    });
});

router.post(config.api + 'user/authenticate', function (req, res) {
    controller.authenticate(req.body.userName, req.body.password).then(function (user) {
        var roleMenuController = require('../controllers/RoleMenuController');
        roleMenuController.getAll({ "role": user.role._id }).then(function (menus) {

            var roleReportController = require('../controllers/RoleReportController');
            roleReportController.getAll({ "role": user.role._id }).then(function (reports) {
                req.session.user = user;
                req.session.menus = menus;
                req.session.reports = reports;
                return res.status(200).send('ok');
            }).catch(function (error) {
                return res.status(500).send(error.message);
            });
        }).catch(function (error) {
            return res.status(500).send(error.message);
        });
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'user/save', auth.isAuthenticated, function (req, res) {
    controller.save(req.body).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.delete(config.api + 'user/delete', auth.isAuthenticated, function (req, res) {
    controller.delete(req.query.id).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

module.exports = router;