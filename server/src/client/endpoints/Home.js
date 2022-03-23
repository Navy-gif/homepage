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
        const { path } = req;
        if ((/\/media\/.+/u).test(path)) {

            const title = decodeURI(path.replace('/media/', ''));
            const clip = this.client.clipIndex.getByTitle(title);
            const baseUrl = `https://${this.client.domain}`;
            const clientUrl = `${baseUrl}${path}`;
            const thumbnailUrl = `${baseUrl}/thumbnails/${clip.thumbnail}`;
            const clipUrl = `${baseUrl}/clips/${clip.filename}`;

            console.log(this.index);
            const html = this.index.
                // replace(`<title>Corgi Corner</title>`, clip.name).
                replace(/{{META_author}}/ug, clip.uploader.tag).
                replace(/{{META_url}}/ug, clientUrl).
                replace(/{{META_thumbnail}}/ug, thumbnailUrl).
                replace(/{{META_srcUrl}}/ug, clipUrl);
            console.log(html);
            return res.send(html);
        }

        // res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        //const home = path.resolve(this.client.baseDirectory, '../client/build/index.html');
        res.sendFile(this.indexPath);

    }

}

module.exports = Home;