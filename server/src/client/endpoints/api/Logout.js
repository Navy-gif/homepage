const { APIEndpoint } = require('../../interfaces');

class Logout extends APIEndpoint {

    constructor(client, opts) {

        super(client, {
            name: 'logout',
            path: '/logout',
            ...opts
        });

        this.methods = [
            ['post', this.post.bind(this)]
        ];

        this.middleware = [];

        this.init();

    }

    post(req, res) {
        this.logger.info(`Logging out ${req.user.username}`);
        req.logout();
        req.session.destroy();
        res.status(200)
            .set('Access-Control-Allow-Credentials', true)
            .clearCookie('connect.sid')
            .json({
                message: 'OK'
            });
    }

}

module.exports = Logout;