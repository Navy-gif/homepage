const { Logger } = require('../../util');

class Endpoint {

    static logger = null;

    constructor(client, { path, name, middleware, subpaths }) {

        this.logger = new Logger(this);//new Logger({ name: 'Endpoint', debug: client._debug });
        this.logger.info(`Creating ${name} endpoint`);
        this.client = client;
        this.path = path;
        this.name = name;
        this.middleware = middleware || []; // stuff like auth, logging etc that depend on the path
        this.subpaths = subpaths || [];
        this.methods = [];

        this.initialised = false;

    }

    init() {

        // const methods = Object.keys(this.methods);
        // for (const method of methods) {
        //     const middleware = this.methods[method];
        //     this.client.app[method](this.path, ...middleware);
        // }

        for (const [method, cb, middleware = []] of this.methods) {
            this.client.app[method](this.path, ...this.middleware, ...middleware, cb);
        }

        for (const [sub, method, cb, middleware = []] of this.subpaths) {
            this.client.app[method](this.path + sub, ...this.middleware, ...middleware, cb);
        }

        this.initialised = true;

    }

}

module.exports = Endpoint;