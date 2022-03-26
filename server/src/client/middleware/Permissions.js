const Permissions = (perm) => {
    
    return (req, res, next) => {
        const { user: { permissions } } = req;
        if (permissions.admin || permissions[perm]) return next();
        req.client.logger.warn(`${req.user.tag} has insufficient permissions for ${perm}`);
        return res.status(403).send('Insufficient permissions');
    };


};

module.exports = Permissions;