const { Endpoint } = require('../interfaces');
const path = require('path');
const express = require('express');
const fs = require('fs');

class Home extends Endpoint {

    constructor(client, opts) {

        super(client, {
            name: 'home',
            path: '(/*)?',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        // this.mediaDir = path.join(this.client.baseDirectory, 'media');
        const assets = path.resolve(this.client.baseDirectory, '../client/build/static');
        const manifest = path.resolve(this.client.baseDirectory, '../client/build/manifest.json');
        const favicon = path.resolve(this.client.baseDirectory, '../client/build/favicon.ico');
        const robots = path.resolve(this.client.baseDirectory, '../client/build/robots.txt');
        this.indexPath = path.resolve(this.client.baseDirectory, '../client/build/index.html');
        this.client.app.use('/static', express.static(assets));
        this.client.app.use('/manifest.json', express.static(manifest));
        this.client.app.use('/favicon.ico', express.static(favicon));
        this.client.app.use('/robots.txt', express.static(robots));

        this.index = fs.readFileSync(this.indexPath, { encoding: 'utf-8' });

        this.init();

    }

    async get(req, res) {

        console.log('\n\n\nPATH', req.path, '\n\n\n');
        const { path, hostname, protocol } = req;
        if ((/\/media\/.+/u).test(path)) {

            const title = path.replace('/media/', '');
            const clip = this.client.clipIndex.getByTitle(title);
            const baseUrl = `${protocol}://${hostname}`;
            const clientUrl = `${baseUrl}${path}`;
            const thumbnailUrl = `${baseUrl}/thumbnails/${clip.thumbnail}`;
            const clipUrl = `${baseUrl}/clips/${clip.filename}`;

            const html = this.index.
                replace(`{{author}}`, clip.uploader.tag).
                replace(`{{url}}`, clientUrl).
                replace(`{{thumbnail}}`, thumbnailUrl).
                replace(`{{srcUrl}}`, clipUrl);
            return res.send(html);
        }

        // res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        //const home = path.resolve(this.client.baseDirectory, '../client/build/index.html');
        res.send(this.index);

    }

}

module.exports = Home;