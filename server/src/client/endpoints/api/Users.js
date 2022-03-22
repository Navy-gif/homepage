const { APIEndpoint } = require('../../interfaces');
const { CheckAuth, Permissions } = require('../../middleware');

class Users extends APIEndpoint {

    constructor(client, opts) {

        super(client, {
            name: 'users',
            path: '/users',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.subpaths = [
            ['/:id', 'get', this.user.bind(this)]
        ];

        this.middleware = [CheckAuth, Permissions('admin')];

        this.init();

    }

    async get(req, res) {
        
        try {
            const users = await this.client.users.getAll();
            res.json(users);
        } catch (err) {
            this.logger.error(err.stack || err);
            res.status(500).end();
        }

    }

    async user(req, res) {

    }

}

module.exports = Users;