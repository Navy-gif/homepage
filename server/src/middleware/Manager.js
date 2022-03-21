const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');
const { inspect } = require('util');
const { Collection } = require('discord.js');

const Logger = require('./Logger.js');
const Parser = require('./Parser.js');
const Shard = require('./Shard.js');

class Manager extends EventEmitter {

    constructor(opts) {

        super();

        this._options = opts;
        this._built = false;

        this.readyAt = null;

        this.logger = new Logger(this, opts.logger);
        this.parser = new Parser(this);


        this.parser.registerFlag('help', {
            type: 'Boolean',
            valueOptional: true
        });
        this.parser.loadCommands('./commands');


        this.key = path.join(__dirname, '../../host.key.pem');
        this.cert = path.join(__dirname, '../../host.crt.pem');
        if (!fs.existsSync(this.key) || !fs.existsSync(this.cert)) this.logger.warn('Missing key and/or cert file! Any connections will be unsecured.');

        this.path = path.resolve(__dirname, '../client', 'ServerClient.js');
        this.shards = new Collection();

        process.on('warning', (warn) => {
            this.logger.warn(warn.stack);
        });

        process.on('error', (error) => {
            this.logger.error(error.stack);
        });

        process.on('uncaughtException', (ex) => {
            this.logger.warn(ex.stack);
        });

        process.stdin.on('connect', () => {
            this.logger.info(`Terminal connected to stdin`);
        });

        process.stdin.on('end', () => {
            this.logger.info(`Terminal connection ended`);
        });

        process.stdin.on('data', (data) => {
            const raw = data.toString('utf-8');
            const words = raw.split(' ').map((word) => word.trim());
            this._handleStdin(words);
        });

        this.on('message', this._handleMessage.bind(this));

        this.init();

    }

    async init() {

        this.logger.info('Initialising API manager');
        const { shardCount } = this._options;
        this.logger.info(`Spawning ${shardCount} shards`);
        const promises = [];

        for (let i = 0; i < shardCount; i++) {
            const shard = new Shard(this, i, {
                env: this.env
            });
            this.shards.set(i, shard);
            this.emit('shardCreate', shard);
            shard.once('ready', () => this.logger.status(`Shard ${shard.id} is ready`));
            promises.push(shard.spawn());
        }

        await Promise.all(promises).catch((err) => {
            this.logger.error(`API Shard died while booting:\n${err.stack}`);
            // eslint-disable-next-line no-process-exit
            process.exit();
        });

        this._built = true;
        this.readyAt = Date.now();
        this.logger.info('API built');
        this.emit('built');

    }

    _handleMessage(shard, message) {

        if (message._logger) return this.logger._handleMessage(shard, message);
        this.logger.debug(`Incoming IPC message from API shard ${shard.id}:\n${inspect(message)}`);

    }

    async _handleStdin(args) {

        args = args.filter((arg) => arg.length);
        if (!args.length) return;
        this.logger.debug(inspect(args));

        const { command, flags, ...rest } = this.parser.parseCommand(args);
        // this.info(inspect(rest));
        ({ leftOver: args } = rest);

        if (!command) return this.logger.warn(`${args[0]} is not a valid command`);

        if (flags.some((flag) => flag.name === 'help' && flag.value)) return this.logger.info(`\nCOMMAND HELP\n${command.help}`);

        try {
            await command.execute(args, flags);
        } catch (err) {
            if (err.constructor.name === 'CommandError') return this.logger.error(err);
            this.logger.error(err.stack);
        }

    }

    get env() {
        const opts = this._options;
        const { env } = process;
        return {
            NODE_ENV: env.NODE_ENV,
            API_DB: env.API_DB,
            API_DB_URL: env.API_DB_URL,
            API_SESSION_STORE: env.API_SESSION_STORE,
            API_SESSION_COLLECTION: env.API_SESSION_COLLECTION,
            HTTP_PORT: opts.http.port,
            API_SECRET: env.API_SECRET,
            // DASHBOARD: opts.dasboardUrl,
            AUTH_CALLBACK: opts.discord.callback,
            DISCORD_SECRET: env.DISCORD_SECRET,
            DISCORD_ID: env.DISCORD_ID,
            DISCORD_SCOPE: opts.discord.scope,
            DOMAIN: opts.domain,
            DEBUG: opts.debug
        };
    }

}

module.exports = Manager;