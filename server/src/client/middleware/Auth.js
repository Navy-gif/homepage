const CheckAuth = (req, res, next) => {
    res.set('Access-Control-Allow-Credentials', true);
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ message: 'Must be authenticated for this endpoint' });
};

module.exports = CheckAuth;