const Permissions = (perm) => {
    
    return (req, res, next) => {
        const { user: { permissions } } = req;
        if (permissions[perm]) return next();
        res.status(401).end();
    };


};

module.exports = Permissions;