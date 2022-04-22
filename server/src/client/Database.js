const { Logger } = require('../util/');
const { MongoClient } = require('mongodb');

/**
 * A dedicated class to locally wrap the mongodb wrapper
 *
 * @class MongoDB
 */
class MongoDB {

    constructor(client, config) {

        if (!client) throw new Error('Missing reference to client!');
        if (!config) throw new Error('No config file provided!');
        if (config && (!config.database || !config.host)) throw new Error('Invalid config provided!');

        this.config = config;
        this.client = null; // Mongo Client
        this.parent = client; // Parent client
        this.db = null;

        this.logger = new Logger(this);
        this.logger._debug = this.parent._debug;

        const { API_DB_USERNAME, API_DB_PASSWORD } = process.env;
        this._auth = API_DB_USERNAME ? `${API_DB_USERNAME}:${API_DB_PASSWORD}@` : '';

    }

    URI(database) {
        return `mongodb://${this._auth}${this.config.host}/${database}?authSource=${database}`;
    }

    async init() {

        this.logger.info('Initializing database connection.');

        try {
            const client = new MongoClient(this.URI(this.config.database), { useNewUrlParser: true });
            this.client = await client.connect();
            this.db = await this.client.db(this.config.database);
            this.logger.info('Database connected.');

        } catch (err) {

            this.logger.error('Database connection failed!\n' + err);

        }

        return this;

    }

    /**
     * Find and return the first match
     *
     * @param {String} db The collection in which the data is to be updated
     * @param {Object} query The filter that is used to find the data
     * @returns {Array} An array containing the corresponding objects for the query
     * @memberof Database
     */
    async find(db, query) {

        this.logger.debug(`Incoming find query for ${db} with parameters ${JSON.stringify(query)}`);

        const cursor = await this.db.collection(db).find(query);
        return cursor.toArray();

    }

    /**
     * Find and return the first match
     *
     * @param {String} db The collection in which the data is to be updated
     * @param {Object} query The filter that is used to find the data
     * @returns {Object} An object containing the queried data
     * @memberof Database
     */
    findOne(db, query) {

        this.logger.debug(`Incoming findOne query for ${db} with parameters ${JSON.stringify(query)}`);
        return new Promise((resolve, reject) => {

            this.db.collection(db).findOne(query, async (error, item) => {

                if (error) return reject(error);
                return resolve(item);

            });

        });

    }

    /**
     * Update any and all filter matches.
     * DEPRECATED!
     *
     * @param {String} db The collection in which the data is to be updated
     * @param {Object} filter The filter that is used to find the data
     * @param {Object} data The updated data
     * @returns {WriteResult} Object containing the followint counts: Matched, Upserted, Modified
     * @memberof Database
     */
    update(db, filter, data) {

        this.logger.debug(`Incoming update query for '${db}' with parameters\n${JSON.stringify(filter)}\nand data\n${JSON.stringify(data)}`);
        this.logger.warn('Database.update() is deprecated!');
        return new Promise((resolve, reject) => {

            this.db.collection(db).update(filter, data, async (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            });

        });

    }

    /**
     * Update the first filter match.
     *
     * @param {String} db The collection in which the data is to be updated
     * @param {Object} filter The filter that is used to find the data
     * @param {Object} data The updated data
     * @returns {WriteResult} Object containing the followint counts: Matched, Upserted, Modified
     * @memberof Database
     */
    updateOne(db, filter, data, upsert = false) {

        this.logger.debug(`Incoming updateOne query for ${db} with parameters ${JSON.stringify(filter)}`);
        return new Promise((resolve, reject) => {

            this.db.collection(db).updateOne(filter, { $set: data }, { upsert }, async (error, result) => {

                if (error) return reject(error);

                //return resolve(result)
                const { matchedCount, upsertedCount, modifiedCount } = result;
                return resolve({ matched: matchedCount, upserted: upsertedCount, modified: modifiedCount });

            });

        });

    }

    /**
     * Push data to an array
     *
     * @param {string} db The collection to query
     * @param {object} filter The filter to find the document to update
     * @param {object} data The data to be pushed
     * @param {boolean} [upsert=false]
     * @returns
     * @memberof Database
     */
    push(db, filter, data, upsert = false) {

        this.logger.debug(`Incoming push query for ${db}, with upsert ${upsert} and with parameters ${JSON.stringify(filter)} and data ${JSON.stringify(data)}`);
        return new Promise((resolve, reject) => {

            this.db.collection(db).updateOne(filter, { $push: data }, { upsert }, async (error, result) => {

                if (error) return reject(error);
                return resolve(result);

            });

        });

    }

    /**
     * Find a random element from a database
     *
     * @param {string} db The collection to query
     * @param {object} [filter={}] The filtering object to narrow down the sample pool
     * @param {number} [amount=1] Amount of items to return
     * @returns {object}
     * @memberof Database
     */
    random(db, filter = {}, amount = 1) {

        this.logger.debug(`Incoming random query for ${db} with parameters ${JSON.stringify(filter)} and amount ${amount}`);
        if (amount > 100) amount = 100;

        return new Promise((resolve, reject) => {

            this.db.collection(db).aggregate([{ $match: filter }, { $sample: { size: amount } }], (err, item) => {

                if (err) return reject(err);
                resolve(item);

            });

        });

    }

    stats(options = {}) {

        return new Promise((resolve, reject) => {

            if (!this.db) return reject(new Error('Database not initialised'));

            this.db.stats(options, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });

        });

    }

}

module.exports = MongoDB;