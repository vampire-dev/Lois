var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/ReturnController');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/berita_acara/')
    },
    filename: function (req, file, cb) {
        var originalname = file.originalname;
        var extension = originalname.split(".");
        cb(null, Date.now() + '.' + extension[extension.length - 1])
    }
});

var upload = multer({ storage: storage });

router.post(config.api + 'return/uploads', upload.single('file'), function (req, res) {
    res.status(200).send(req.file);
});

router.get('/lois/return', function (req, res) {
    res.redirect('/lois');
});

router.get('/lois/confirm-return', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'return/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['region'] = req.session.user.location.region;

    controller.getAll(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.get(config.api + 'return/getAllConfirm', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAllConfirm(query).then(function (result) {
        res.status(200).send(result);
    }).catch(function (error) {
        res.status(500).send(error.message);
    });
});

router.post(config.api + 'return/return', auth.isAuthenticated, function (req, res) {
    controller.return(req.body, req.session.user).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.post(config.api + 'return/confirm', auth.isAuthenticated, function (req, res) {
    controller.confirm(req.body).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

module.exports = router;