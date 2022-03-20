/* eslint-disable max-classes-per-file */
module.exports = class BaseCommand {

    constructor (parent, options) {
        
        this.parent = parent;

        if (!options.name) throw new Error('Missing command name');
        this.name = options.name;
        this.aliases = [];

        this.description = options.description || 'N/A';
        this.flags = options.flags || [];
        this.args = options.args || [];

        this.logger = parent.logger;

    }

    findFlag (flag) {

        flag = flag.toLowerCase();
        return this.flags.find((f) => [ f.name, ...f.aliases ].includes(flag));

    }

    execute () {
        throw new Error(`Command ${this.name} has not implemented execute`);
    }

    get help() {
        let str = `Command ${this.name.toUpperCase()}: ${this.description}\n\nSyntax: ${this.name} [--FLAGS] [ARGS]`;
        if (this.flags.length) str += `\n\tFLAGS:\n${this.flags.map((flag) => {
            return `\t--${flag.name} ${flag.aliases?.length ? `[-${flag.aliases.join(', -')}]` : ''}: ${flag.description}\n\t\tTYPE: ${flag.type}`;
        }).join('\n\n')}`;
        if (this.args.length) str += `\n\n\tARGS:${this.args.map((arg) => {
            return `\t${arg.name} ${arg.aliases?.length ? `[-${arg.aliases.join(', -')}]` : ``}: ${arg.description}\n\t\tTYPE ${arg.type}`;
        })}`;
        return str; 
    }

    error (reason) {
        throw new class CommandError extends Error { }(reason);
    }

};