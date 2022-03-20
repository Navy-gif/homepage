const { Logger } = require('../util');

class Intercom {

    constructor(client) {
        this.client = client;
        this.cache = new Map();
        this.debug = client._debug;
        this.logger = new Logger(this);

        process.on('message', this.receive.bind(this));
    }

    /**
     * Send IPC packet to the main process
     *
     * @param {Object} [message=null]
     * @return {Promise<Object>} Eventual result of the call 
     * @memberof ClientIPCHandler
     */
    _send(message = null, timeout = 10_000) {

        const { type } = message;
        const shard = this.client._shardId;
        const ID = `${Date.now()}:${type}`;
        if (this.cache.has(ID)) return this.cache.get(ID).promise;
        const obj = {};

        const promise = new Promise((resolve, reject) => {

            setTimeout(() => {
                if (this.cache.has(ID)) this.cache.delete(ID);
                reject(new Error('Request timed out'));
            }, timeout);

            obj.resolve = resolve;
            obj.reject = reject;

            message.id = ID;
            message.shard = shard;
            message._api = true;

            this.logger.debug(`Outgoing message: ${JSON.stringify(message)}`);
            process.send(message);

        });

        obj.promise = promise;
        this.cache.set(ID, obj);
        return promise;

    }

    async send(message) {
        return this._send(message).catch((error) => {
            return { failure: true, error };
        });
    }

    receive(message) {

        this.logger.debug(`Incoming message: ${JSON.stringify(message)}`);
        const promise = this.cache.get(message.id);
        if (!message.failure) promise.resolve(message.data);
        else promise.reject(new Error(message.error));

        this.cache.delete(message.id);

    }

}

module.exports = Intercom;