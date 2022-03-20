// import BaseCommand from "./Base.js";
const BaseCommand = require('./Base.js');

module.exports = class DebugCommand extends BaseCommand {

    constructor (parent) {

        super(parent, {
            name: 'Debug',
            description: 'Toggle debug mode',
            flags: [
                {
                    name: 'shard',
                    aliases: [ 's' ],
                    type: 'Integer',
                    unique: false,
                    description: 'Specifies the shard ID on which to act upon'
                }
            ]
        });

    }

    async execute (args, flags) {

        const shardIds = new Set(flags.filter((flag) => flag.name === 'shard').map((flag) => flag.value));
        const shards = this.parent.shards.filter((shard) => shardIds.has(shard.id));
        const toggle = args.shift()?.toLowerCase();
        if (!toggle || ![ 'on', 'off' ].includes(toggle)) this.error(`Must supply a toggle value ex. debug on`);
        
        if (shards.size) shards.forEach((shard) => shard.send({ _toggleDebug: true }));
        else if (!shards.size && flags.length) this.error(`Invalid shard IDs supplied ${[ ...shardIds ].join(', ')}`);
        else this.parent._debug = true;

        this.logger.info(`Toggled debug mode on for ${shards.size ? `shard(s) [${shards.map((shard) => shard.id).join(', ')}]` : 'manager'}`);

    }

};