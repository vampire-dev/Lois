function Authentication() { }

Authentication.isAuthenticated = function (req, res, next) {
    if (!req.session.user)
        return res.status(401).send('You are not logged in');

    return next();
}

module.exports = Authentication;
