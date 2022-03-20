// import { inspect } from 'util';
// import { resolve, join } from 'path';
// import { fileURLToPath } from 'url';
// import { readdirSync } from 'fs';

const { inspect } = require('util');
const { join } = require('path');
const { readdirSync } = require('fs');

class Parser {

    constructor(parent, options = {
        debug: false
    }) {
        this.parent = parent;
        this.args = new Map();
        this.flags = new Map();
        this.commands = new Map();

        this.path = __dirname;

        this._debug = options.debug;

    }

    debug(message) {
        if (typeof message !== 'string') message = inspect(message);
        if (this._debug) this.parent?.debug(message);
    }

    async loadCommands(directory) {

        this.debug(`Loading comamnds`);
        const cmdDirPath = join(this.path, directory);
        const cmdDir = readdirSync(cmdDirPath).filter((entry) => entry.toLowerCase() !== 'base.js');

        for (const file of cmdDir) {
            const cmdPath = join(cmdDirPath, file);
            const Command = require(cmdPath); //await import(`file://${cmdPath}`);
            if (!Command) continue;

            const command = new Command(this.parent);
            this.commands.set(command.name.toLowerCase(), command);
            this.debug(`Command ${command.name} loaded`);
            // for (const arg of command.args) this.registerArgument(arg);
            // for (const flag of command.flags) this.registerFlag(flag);

        }

    }

    findCommand(name) {

        name = name.toLowerCase();
        if (this.commands.has(name)) return this.commands.get(name);

        const commands = this.commands.values();
        for (const command of commands) {
            const { aliases } = command;
            if (aliases.includes(name)) return command;
        }

        return null;

    }

    registerArgument(name, options) {

        if (typeof name !== 'string') {
            options = { ...name };
            name = null;
        }
        if (!name && !options.name) throw new Error('Missing flag name');

        if (!options.type) options.type = 'String';
        if (!options.valueOptional) options.valueOptional = false;

        if (options.type !== 'Boolean' && options.valueOptional) throw new Error('Cannot have optional values for non-boolean types');

        name = name || options.name;
        this.args.set(name, { ...options, name });
        this.debug(`Registering argument: ${name}`);

    }

    registerFlag(name, options) {

        if (typeof name !== 'string') {
            options = { ...name };
            name = null;
        }
        if (!name && !options.name) throw new Error('Missing flag name');

        if (!options.type) options.type = 'String';
        if (!options.valueOptional) options.valueOptional = false;

        if (options.type !== 'Boolean' && options.valueOptional) throw new Error('Cannot have optional values for non-boolean types');

        name = name || options.name;
        this.flags.set(name, { ...options, name });
        this.debug(`Registering flag: ${name}`);

    }

    _findFlag(flag) {

        flag = flag.toLowerCase();
        if (this.flags.has(flag)) return this.flags.get(flag);

        const values = this.flags.values();
        for (const val of values) {
            const { name, alias } = val;
            if ([name, alias].includes(flag)) return val;
        }

        return null;
    }

    parseFlags(args, command) {

        const found = [];

        for (let index = 0; index < args.length;) {

            this.debug('====BEGIN LOOP ITERATION====');
            const match = (/(?:^| )(?<flag>(?:--[a-z0-9]{2,})|(?:-[a-z]))(?:$| )/iu).exec(args[index]); // (?<value>(?:"(?:[^"]*)")|(?:\w)*)?
            this.debug(match);
            if (!match) {
                index++;
                continue;
            }

            const rawFlag = match.groups.flag;
            const flagName = rawFlag.replace(/--?/u, '');
            const _flag = command?.findFlag(flagName) || this._findFlag(flagName);
            this.debug(_flag);
            if (!_flag) {
                index++;
                continue;
            }
            let value = null;
            args.splice(index, 1);

            if (_flag.type === 'String') {
                this.debug('STRING VALUE PARSE');
                value = '';
                let long = false;
                for (let i = index; i < args.length;) {
                    this.debug('STRING VALUE PARSE LOOP BEGIN');
                    const [val] = args.splice(i, 1);
                    this.debug(val);
                    if (val.startsWith('"') || long) {
                        this.debug('long val');
                        value += ` ${val}`;
                        long = true;
                        if (val.endsWith('"')) {
                            value = value.replace(/"/gu, '');
                            break;
                        }
                    } else {
                        this.debug('short val');
                        value = val;
                        break;
                    }
                }
                value = value.trim();
            } else if (_flag.type === 'Integer') {
                this.debug('STRING VALUE PARSE');
                const [val] = args.splice(index, 1);
                this.debug(val);
                value = parseInt(val);
            } else if (_flag.type === 'Boolean') {
                this.debug('STRING VALUE PARSE');
                if (['true', 'false'].includes(args[index]?.toLowerCase())) {
                    const [val] = args.splice(index, 1);
                    this.debug(val);
                    value = val === 'true';
                    // eslint-disable-next-line no-negated-condition
                } else if (!_flag.valueOptional) throw new Error(`Invalid value for Boolean flag ${_flag.name}`);
                else value = true;

            }

            this.debug(`Leftover args: ${inspect(args)}`);
            this.debug(`Flag value: ${_flag.name}: '${value}'`);
            const flag = { ..._flag, value };

            if (flag.unique && found.some((f) => f.name === flag.name)) continue;
            else found.push(flag);

            this.debug('====END LOOP ITERATION====');
        }

        return { flags: found, leftOver: args };

    }

    parseCommand(args = []) {

        const nullResult = { command: null, leftOver: [...args] };
        const cmd = args.shift()?.toLowerCase();
        if (!cmd) return nullResult;

        const command = this.findCommand(cmd);
        if (!command) return nullResult;
        const { flags, ...result } = this.parseFlags(args, command);
        ({ leftOver: args } = result);

        return { command, flags, leftOver: args };

    }

}

module.exports = Parser;