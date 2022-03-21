const { APIEndpoint } = require('../../interfaces');
const fs = require('fs');
const path = require('path');

class Clips extends APIEndpoint {

    constructor(client, opts) {

        super(client, {
            name: 'thumbnails',
            path: '/thumbnails/:name',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.mediaDir = path.join(this.client.baseDirectory, 'thumbnails');

        this.init();

    }

    async get(req, res) {

        const { params: { name } } = req;
        const files = fs.readdirSync(this.mediaDir);
        if (!files.some((file) => file === name)) return res.status(404).send('Not found');
        res.status(200).sendFile(name, {
            root: this.mediaDir
        });

    }

}

module.exports = Clips;