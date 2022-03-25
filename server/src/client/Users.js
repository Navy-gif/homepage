const { EventEmitter } = require('events');
// eslint-disable-next-line no-unused-vars
const MongoDB = require('./Database');

class Users extends EventEmitter {


    /**
     * Creates an instance of Users.
     * @param {*} client
     * @param {MongoDB} database
     * @memberof Users
     */
    constructor(client, { database, collection }) {

        super();

        this.client = client;
        this.database = database;
        this.collection = collection;

    }

    async getOrCreate(user) {
        
        const id = user.id || user;
        this.emit('debug', `User perms query for ${id}`);
        const userPartial = await this.database.findOne(this.collection, { id });
        user = { ...this.defaultPermissions, ...userPartial, ...user };
        user.tag = `${user.username}#${user.discriminator}`;
        this.emit('debug', `Result for ${id}: ${JSON.stringify(userPartial)}`);
        if (userPartial) return user;

        user.permissions = this.defaultPermissions;
        await this.database.updateOne(this.collection, { id }, { id, tag: user.tag, permissions: this.defaultPermissions }, true);
        this.emit('userCreate', user);
        return user;

    }

    getAll() {
        
        return this.database.find(this.collection, {});

    }

    get defaultPermissions() {
        return {
            admin: false,
            upload: false
        };
    }

}

module.exports = Users;