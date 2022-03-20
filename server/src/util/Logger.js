/* eslint-disable max-len */
const chalk = require('chalk');
const { inspect } = require('util');

class Logger {

    constructor(client) {

        this.client = client;
        this.name = (client.name || client.constructor.name).toUpperCase();

    }

    async transport(message = 'N/A', opts = {}) {
        if (typeof message !== 'string') message = inspect(message);
        message = `${chalk.bold(`[${this.name.substring(0, 6)}]`)} ${message}`;

        process.send({ _logger: true, message, ...opts });
        //return this.client.intercom.send('logger', { message, ...opts });
    }

    warn(message, opts = {}) {
        this.transport(message, { ...opts, type: 'warn' });
    }

    error(message, opts = {}) {
        this.transport(message, { ...opts, type: 'error' });
    }

    debug(message, opts = {}) {
        this.transport(message, { ...opts, type: 'debug' });
    }

    info(message, opts = {}) {
        this.transport(message, { ...opts, type: 'info' });
    }

    status(message, opts = {}) {
        this.transport(message, { ...opts, type: 'status' });
    }


}

module.exports = Logger;