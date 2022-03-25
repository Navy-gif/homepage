const fileUpload = require('express-fileupload');

const { APIEndpoint } = require('../../interfaces');
const { CheckAuth, Permissions } = require('../../middleware');

class Login extends APIEndpoint {

    constructor(client, opts) {

        super(client, {
            name: 'upload',
            path: '/upload',
            ...opts
        });

        this.methods = [
            ['post', this.upload.bind(this)]
        ];

        this.middleware = [CheckAuth, Permissions('upload'), fileUpload({ limits: { fileSize: 1024*1024*1024, files: 1 } })];

        this.init();

    }

    async upload(req, res) {

        const { body: { name }, files: { file } } = req;
        if (!file) return res.status(400).end();
        
        if (!file.mimetype !== 'video/mp4' || !file.name.endsWith('.mp4')) return res.status(400).send('Invalid type');

        this.logger.info(`${req.user.username}#${req.user.discriminator} is uploading ${name}`);
        try {
            await this.client.clipIndex.add(file, name, req.user);
            res.status(200).end();
        } catch (_) { 
            res.status(500).end();
        }

    }

}

module.exports = Login;