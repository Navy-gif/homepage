const { Endpoint } = require('../interfaces');

class Invite extends Endpoint {

    constructor(client, opts) {

        super(client, {
            name: 'invite',
            path: '/invite',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.init();

    }

    async get(req, res) {

        res.redirect('https://discord.gg/arbTys49tu');

    }

}

module.exports = Invite;