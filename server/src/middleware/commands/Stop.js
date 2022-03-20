const BaseCommand = require('./Base.js');
// import Util from '../../util/Util.js';
const { Util } = require('../../util');

module.exports = class RestartCommmand extends BaseCommand {

    constructor (parent) {

        super(parent, {
            name: 'Stop',
            description: 'Stop specific shards',
            flags: [
                {
                    name: 'shard',
                    aliases: [ 's' ],
                    type: 'Integer',
                    unique: false,
                    description: 'Specifies the shard ID on which to act upon'
                }, {
                    name: 'all',
                    aliases: [ 'a' ],
                    type: 'Boolean',
                    unique: true,
                    description: 'Whether to stop all shards',
                    valueOptional: true
                }, {
                    name: 'delay',
                    aliases: [ 'd' ],
                    type: 'Integer',
                    unique: true,
                    description: 'The amount of seconds to wait before executing'
                }
            ]
        });

    }

    async execute (_args, flags) {

        const shardIds = new Set(flags.filter((flag) => flag.name === 'shard').map((flag) => flag.value));
        const all = flags.find((flag) => flag.name === 'all')?.value || false;
        const delay = flags.find((flag) => flag.name === 'delay')?.value || 0;
        const shards = all ? this.parent.shards : this.parent.shards.filter((shard) => shardIds.has(shard.id));

        if (!shards.size) this.error('Must specify shards to stop with --shard or --all');
        this.parent.logger.info(`Shutting down shard${shards.size > 1 ? 's' : ''} ${shards.map((shard) => shard.id).join(', ')}`);

        if (delay) await Util.wait(delay*1000);
        shards.forEach((shard) => {
            shard.kill();
            this.parent.shards.delete(shard.id);
        });

        this.parent.logger.info(`Stop complete`);

    }

};