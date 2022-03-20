const BaseCommand = require('./Base.js');
// import APIShard from '../APIShard.js';
const Shard = require('../Shard.js');

module.exports = class StartCommmand extends BaseCommand {

    constructor (parent) {

        super(parent, {
            name: 'Start',
            description: 'Start n amount of new shards',
            flags: [],
            args: [{
                name: 'amount',
                description: 'The amount of shards to start',
                type: 'Integer'
            }]
        });

    }

    async execute (args) {

        const amt = parseInt(args.shift());
        if (isNaN(amt)) this.error(`Invalid amount, expected Integer value`);
        const highestShardId = this.parent.shards.size ? Math.max(...this.parent.shards.map((shard) => shard.id)) : -1;
        
        for (let id = highestShardId+1; id < highestShardId + amt + 1; id++) {
            this.parent.logger.info(`Spawning new shard [id:${id}]`);
            const shard = new Shard(this.parent, id, this.parent.env);
            this.parent.shards.set(id, shard);
            await shard.spawn();
        }

        this.parent.logger.info(`Spawned ${amt} new shards`);

    }

};