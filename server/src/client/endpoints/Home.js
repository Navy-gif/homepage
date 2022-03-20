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

        this.mediaDir = path.join(this.client.baseDirectory, 'media');
        const assets = path.resolve(this.client.baseDirectory, '../client/build/static');
        const manifest = path.resolve(this.client.baseDirectory, '../client/build/manifest.json');
        this.client.app.use('/static', express.static(assets));
        this.client.app.use('/manifest.json', express.static(manifest));

        this.init();

    }

    async get(req, res) {

        const home = path.resolve(this.client.baseDirectory, '../client/build/index.html');
        res.sendFile(home);

    }

}

module.exports = Home;