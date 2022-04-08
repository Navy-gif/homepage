// Endpoint for hosting arbitrary files
const { APIEndpoint } = require('../../interfaces');
const fs = require('fs');
const path = require('path');

class FilesEndpoint extends APIEndpoint {

    constructor(client, opts) {
        super(client, {
            name: 'files',
            path: '/files/:filename',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.init();

    }

    async get(req, res) {

        const { filename } = req.params;
        const _path = path.join(process.cwd(), 'files');
        if (!fs.existsSync(_path)) return res.status(500).send('File serving not set up');

        const files = fs.readdirSync(_path);
        if (!filename || !files.includes(filename)) return res.status(404).end();

        res.sendFile(`${filename}`, { root: _path });

    }

}

module.exports = FilesEndpoint;