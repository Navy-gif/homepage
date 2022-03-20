const BaseCommand = require('./Base.js');

module.exports = class ListCommand extends BaseCommand {
    
    constructor(parent) {

        super(parent, {
            name: 'List',
            description: 'Prints out a list'
        });

    }

    // TODO: Expand listables, currently only lists shards
    // eslint-disable-next-line no-unused-vars
    execute(args, flags) {

        const shards = this.parent.shards.filter((shard) => shard.ready).map((shard) => shard.id);
        if (shards.length) this.parent.info(`Currently running shards: ${shards.join(', ')}`);
        else this.parent.info(`No currently running shards`);

    }

};