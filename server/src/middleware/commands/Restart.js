const BaseCommand = require('./Base.js');

module.exports = class RestartCommmand extends BaseCommand {

    constructor (parent) {

        super(parent, {
            name: 'Restart',
            description: 'Restart one or all of the shards',
            flags: [
                {
                    name: 'shard',
                    aliases: [ 's' ],
                    type: 'Integer',
                    unique: false,
                    description: 'Specifies the shard ID on which to act upon'
                },
                {
                    name: 'delay',
                    aliases: [ 'd' ],
                    type: 'Integer',
                    unique: true,
                    description: 'The amount of milliseconds to wait before executing'
                }
            ]
        });

    }
    
    async execute (args, flags) {
        
        const cascade = args.some((arg) => arg.toLowerCase() === 'cascade');
        const shardIds = new Set(flags.filter((flag) => flag.name === 'shard').map((flag) => flag.value));
        const delay = flags.find((flag) => flag.name === 'delay')?.value || 500;
        const shards = shardIds.size ? this.parent.shards.filter((shard) => shardIds.has(shard.id)) : this.parent.shards;
        
        this.parent.logger.info(`Restarting shards ${shards.map((shard) => shard.id).join(', ')}`);

        if (cascade) for (const shard of shards.values()) await shard.respawn(delay);
        else shards.forEach((shard) => shard.respawn(delay));

        this.parent.logger.info(`Restart complete`);

    }

};