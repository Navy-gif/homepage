const { APIEndpoint } = require('../../interfaces');
const fs = require('fs');
const path = require('path');
const { CheckSession, Permissions } = require('../../middleware');

class Clips extends APIEndpoint {

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
            ['/:clip', 'get', this.clip.bind(this)],
            ['/:clip', 'delete', this.clipDelete.bind(this), [CheckSession, Permissions('admin')]]
        ];

        this.mediaDir = path.join(this.client.baseDirectory, 'media');

        this.init();

    }

    async get(req, res) {

        const index = this.client.clipIndex.clips;
        res.json(index);

    }

    async clip(req, res) {

        const { params: { clip }, headers: { range, ...rest } } = req;
        console.log(rest);

        if (!range) return res.status(200).sendFile(clip, {
            root: this.mediaDir
        });

        const files = fs.readdirSync(path.join(this.client.baseDirectory, 'media'));
        if (!files.some((file) => file === clip)) return res.status(404).send('Not found');

        const videoPath = path.join(this.mediaDir, clip);
        const { size } = fs.statSync(videoPath);
        const chunkSize = 1024 * 1024 * 5;
        const start = parseInt(range.split('=')[1].split('-')[0]);
        const end = Math.min(start + chunkSize, size - 1);
        const length = end - start + 1;

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': length,
            'Content-Type': 'video/mp4'
        };

        const stream = fs.createReadStream(videoPath, { start, end });
        res.status(206).set(headers);
        stream.pipe(res);

    }

    async clipDelete(req, res) {
        const { params: { clip }, user } = req;
        this.logger.info(`${user.tag} is deleting clip ${clip}`);
        if (this.client.clipIndex.delete(clip)) res.status(200).end();
        else res.status(404).end();
    }

}

module.exports = Clips;