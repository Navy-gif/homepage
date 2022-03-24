const { APIEndpoint } = require('../../interfaces');
const fs = require('fs');
const path = require('path');

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
            ['/:clip', 'get', this.clip.bind(this)]
        ];

        this.mediaDir = path.join(this.client.baseDirectory, 'media');

        this.init();

    }

    async get(req, res) {

        const index = this.client.clipIndex.clips;
        console.log(index);
        res.send(index);

    }

    async clip(req, res) {

        const { params: { clip }, headers: { range } } = req;
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

        // res.status(200).sendFile(clip, {
        //     root: this.mediaDir
        // });

    }

}

module.exports = Clips;