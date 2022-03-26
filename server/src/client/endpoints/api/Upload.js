const fileUpload = require('express-fileupload');

const { APIEndpoint } = require('../../interfaces');
const { CheckSessionOrToken, Permissions } = require('../../middleware');

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

        this.middleware = [CheckSessionOrToken, Permissions('upload'), fileUpload({ limits: { fileSize: 1024*1024*1024, files: 1 } })];

        this.init();

    }

    async upload(req, res) {

        const { body: { name }, files: { file } } = req;
        if (!file) return res.status(400).send('Missing file?');
        
        if (file.mimetype !== 'video/mp4') {
            return res.status(400).send('Invalid mimetype');
        }
        if (!file.name.endsWith('.mp4')) {
            return res.status(400).send('Invalid format');
        }

        this.logger.info(`${req.user.tag} is uploading ${name}`);
        try {
            const result = await this.client.clipIndex.add(file, name, req.user);
            res.status(200).json({
                url: `${this.client.baseUrl}/media/${name}`,
                thumbnail: `${this.client.baseUrl}/thumbnails/${result.thumbnail}`
            });
        } catch (_) { 
            res.status(500).send('Internal error');
        }

    }

}

module.exports = Login;