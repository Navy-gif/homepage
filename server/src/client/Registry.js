const fs = require('fs');
const path = require('path');

class Registry {

    constructor(client) {

        this.endpoints = new Map();
        this.client = client;
        this.path = path.resolve(__dirname);

    }

    get print() {
        const out = [];
        this.endpoints.forEach((ep) => out.push(`\t${ep.path} ${ep.initialised ? '' : 'NOT INITIALISED!'}`));
        return `Registry print:\n${out.join('\n')}`;
    }

    async init() {

        const dirPath = path.join(this.path, 'endpoints');
        //const { info, warn } = this.client.manager;
        const { client, endpoints } = this;

        return (async function read(pth) {

            const dir = fs.readdirSync(pth, { withFileTypes: true });

            for (let file of dir) {

                if (file.isDirectory()) await read(path.join(pth, file.name));
                else {
                    //info(`Loading endpoint ${file.name}`);
                    file = path.join(pth, file.name);
                    let endpoint = require(file);//await import(`file://${file}`);
                    if (!endpoint) {
                        // warn(`Issue requiring ${file}`);
                        continue;
                    }

                    endpoint = new endpoint(client);
                    endpoints.set(endpoint.name, endpoint);

                }

            }

        }(dirPath));

    }

}

module.exports = Registry;