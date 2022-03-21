const Endpoint = require('./Endpoint.js');

class APIEndpoint extends Endpoint {

    constructor(client, opts) {

        super(client, {
            ...opts,
            path: `/api${opts.path}`
        });

    }

}

module.exports = APIEndpoint;