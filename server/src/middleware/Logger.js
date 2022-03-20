/* eslint-disable max-len */
const chalk = require('chalk');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const { WebhookClient } = require('discord.js');
const os = require('os');
const { username } = os.userInfo();

const { Util } = require('../util');

const Constants = {
    Types: [
        'error',
        'warn',
        'info',
        'debug',
        'status'
    ],
    Colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'magenta',
        status: 'cyanBright'
    }
};

const stripRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gu; //eslint-disable-line no-control-regex

class Logger {

    constructor(manager, options) {

        this.manager = manager;

        this._webhook = new WebhookClient({ url: process.env.ERROR_WEBHOOK_URL });

        this._options = options;

        this._writeStream = this._loadFile();
        this._errorWriteStream = this._loadFile('error');

        this.manager
            .on('shardCreate', (shard) => {
                this.write('debug', "Shard created.", shard);
            });

    }

    write(type = 'info', string = '', shard = null, api = false) {

        type = type.toLowerCase();

        let color = Constants.Colors[type];
        if (!color) color = Constants.Colors.info;

        const header = `${chalk[color](`[${Util.date}][${shard ? `${api ? 'api-s' : 'shard'}${this._shardId(shard)}` : `${api ? 'api-man' : 'manager'}`}]`)}`;

        const maximumCharacters = Math.max(...Constants.Types.map((t) => t.length));
        const spacers = maximumCharacters - type.length;
        const text = `${chalk[color](type)}${" ".repeat(spacers)} ${header} : ${string}`;
        const strippedText = text.replace(stripRegex, '');

        console.log(text); //eslint-disable-line no-console
        if (type === 'error') this.webhook(strippedText);

        const stream = type === 'error' ? '_errorWriteStream' : '_writeStream';
        if (this[stream]) {
            this[stream]
                .write(`\n${strippedText}`);
        }

    }

    webhook(text) {

        const message = text//.replace(new RegExp(process.env.DISCORD_TOKEN, 'gu'), '<redacted>')
            .replace(new RegExp(username, 'gu'), '<redacted>');

        const embed = {
            color: 0xe88388,
            timestamp: new Date(),
            description: `\`\`\`${message}\`\`\``,
        };

        this._webhook.send({ embeds: [embed], username: `ENV: ${process.env.NODE_ENV}` });

    }

    _loadFile(type = null) {
        const filename = `${moment().format('YYYY-MM-DD')}${type ? `-${type}` : ''}`;
        const directory = path.join(process.cwd(), this._options.directory);

        //Ensuring that the log folders exist.
        if (!fs.existsSync(directory)) fs.mkdirSync(directory);

        //Creating the log files.
        const filepath = path.join(directory, `${filename}.log`);

        let filedirectory = null;
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, '');
            filedirectory = filepath;
            this.write('debug', `Creating new${type ? ` ${type} ` : ' '}log file at: ${chalk.bold(`"${filepath}"`)}`);
        } else {
            this.write('debug', `Found existing${type ? ` ${type} ` : ' '}log file, using: ${chalk.bold(`"${filepath}"`)}`);
            filedirectory = filepath;
        }

        if (filedirectory) {
            return fs.createWriteStream(filedirectory, { flags: 'a' }); //Appends to file.
        }

        this.write('error', "Unable to open write stream for log file, proceeding without one.");
        return null;

    }

    //Messages coming from the shards process.send functions.
    _handleMessage(shard, message) {
        this.write(message.type, message.message, shard, message._api);
    }

    _shardId(shard) {
        const { id } = shard;
        return `${id}`.length === 1 ? `0${id}` : `${id}`;
    }

    error(message) {
        this.write('error', message);
    }

    warn(message) {
        this.write('warn', message);
    }

    debug(message) {
        this.write('debug', message);
    }

    info(message) {
        this.write('info', message);
    }

    status(message) {
        this.write('status', message);
    }

}

module.exports = Logger;