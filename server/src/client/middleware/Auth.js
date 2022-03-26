const msg = { message: 'Must be authenticated for this endpoint' };

const CheckSession = (req, res, next) => {
    res.set('Access-Control-Allow-Credentials', true);
    if (req.isAuthenticated()) return next();
    return res.status(401).json(msg);
};

const CheckSessionOrToken = async (req, res, next) => {

    res.set('Access-Control-Allow-Credentials', true);
    if (req.isAuthenticated()) return next();

    const token = req.get('Authorization') || null;
    const user = token ? await req.client.users.checkToken(token) : null;
    if (user) {
        req.user = user;
        return next();
    }

    return res.status(401).json(msg);

};

const CheckToken = async (req, res, next) => {
    const token = req.get('Authorization') || null;
    const result = token ? await req.client.users.checkToken(token) : false;
    if (result) return next();
    return res.status(401).json(msg);
};

module.exports = { CheckSession, CheckSessionOrToken, CheckToken };