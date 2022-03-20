const { Endpoint } = require('../interfaces');
const fs = require('fs');
const path = require('path');

class Clips extends Endpoint {

    constructor(client, opts) {

        super(client, {
            name: 'clips',
            path: '/clips',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.subpaths = [
            ['/:clip', 'get', this.clip.bind(this)]
        ];

        this.mediaDir = path.join(this.client.baseDirectory, 'media');

        this.init();

    }

    async get(req, res) {

        this.logger.debug('GET CLIPS');
        const files = fs.readdirSync(this.mediaDir);
        res.send(files);

    }

    async clip(req, res) {

        const { params: { clip } } = req;
        const files = fs.readdirSync(path.join(this.client.baseDirectory, 'media'));
        if (!files.some((file) => file === clip)) return res.status(404).send('Not found');
        res.status(200).sendFile(clip, {
            root: this.mediaDir
        });

    }

}

module.exports = Clips;