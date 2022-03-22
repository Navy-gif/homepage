const { APIEndpoint } = require('../../interfaces');
const { CheckAuth } = require('../../middleware');

class User extends APIEndpoint {

    constructor(client, opts) {

        super(client, {
            name: 'user',
            path: '/user',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.middleware = [CheckAuth];

        this.init();

    }

    get(req, res) {
        // this.logger.debug(`Get user? ${req.user}`);
        if (req.user) res.status(200).json(req.user);
        else res.status(401).end();
    }

}

module.exports = User;