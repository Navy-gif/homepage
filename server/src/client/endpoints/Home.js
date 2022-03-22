const { Endpoint } = require('../interfaces');
const path = require('path');
const express = require('express');

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
        this.client.app.use('/static', express.static(assets));
        this.client.app.use('/manifest.json', express.static(manifest));
        this.client.app.use('/favicon.ico', express.static(favicon));
        this.client.app.use('/robots.txt', express.static(robots));

        this.init();

    }

    async get(req, res) {

        const home = path.resolve(this.client.baseDirectory, '../client/build/index.html');
        res.sendFile(home);

    }

}

module.exports = Home;