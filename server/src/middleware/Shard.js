// import EventEmitter from 'events';
// import childProcess from 'child_process';

// import Util from '../util/Util.js';

const { EventEmitter } = require('events');
const childProcess = require('child_process');

const { Util } = require('../util');

module.exports = class APIShard extends EventEmitter {

    constructor(manager, id, opts = {}) {

        super();

        this.manager = manager;
        this.id = id;

        // TODO: Bind these somewhere
        this.args = opts.args || [];
        this.execArgv = opts.execArgv || [];
        this.env = opts.env || {};

        this._respawn = false; // TODO: Bind to some option later

        this.ready = false;
        this.process = null;

    }

    async spawn(waitForReady = true) {

        if (this.process) throw new Error(`[shard-${this.id}] A process for this shard already exists!`);

        this.process = childProcess.fork(this.manager.path, this.args, {
            env: {
                ...this.env,
                SHARD_ID: this.id
            },
            execArgv: this.execArgv
        })
            .on('message', this._handleMessage.bind(this))
            .on('exit', this._handleExit.bind(this));

        // this.process.send({ _init: true }, err => {
        //     if (err) this.manager.error(err.stack);
        // });

        this.emit('spawn', this.process);
        if (!waitForReady) return this.process;
        await new Promise((resolve, reject) => {
            this.once('ready', resolve);
            this.once('disconnect', () => reject(new Error(`[shard-${this.id}] Shard disconnected while starting.`)));
            this.once('death', () => reject(new Error(`[shard-${this.id}] Shard died while starting.`)));
            setTimeout(() => reject(new Error(`[shard-${this.id}] Shard timed out while starting.`)), 30000);
        });

        return this.process;

    }

    async respawn(delay = 500) {
        this.kill();
        if (delay > 0) await Util.wait(delay);
        return this.spawn();
    }

    kill() {

        if (this.process) {
            this.process.removeAllListeners();
            this.process.kill();
        }

        this._handleExit(false);

    }

    send(message) {
        return new Promise((resolve, reject) => {
            if (this.ready && this.process) {
                this.process.send(message, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else reject(new Error(`[shard-${this.id}] Cannot send message to dead shard.`));
        });
    }

    _handleMessage(message) {
        if (message) {
            if (message._ready) {
                this.ready = true;
                this.emit('ready');
                return;
            } else if (message._disconnect) {
                this.ready = false;
                this.emit('disconnect');
                return;
            } else if (message._reconnecting) {
                this.ready = false;
                this.emit('reconnecting');
                return;
            }
        }

        this.manager.emit('message', this, { _api: true, ...message });

    }

    _handleExit(respawn = this._respawn) {
        this.emit('death', this.process);

        this.ready = false;
        this.process = null;

        if (respawn) this.spawn().catch((err) => this.emit('error', err));

    }

};