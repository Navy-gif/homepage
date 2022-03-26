const { APIEndpoint } = require('../../interfaces');
const { CheckSession, Permissions } = require('../../middleware');

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

        this.subpaths = [
            ['/token', 'get', this.token.bind(this), [Permissions('upload')]]
        ];

        this.middleware = [CheckSession];

        this.init();

    }

    get(req, res) {
        // this.logger.debug(`Get user? ${req.user}`);
        if (req.user) res.status(200).json(req.user);
        else res.status(401).end();
    }

    async token(req, res) {

        const { user } = req;
        this.logger.info(`Generating upload token for ${user.tag}`);
        const token = await this.client.users.generateToken(user, ['upload']);
        res.status(200).json({ token });

    }

}

module.exports = User;