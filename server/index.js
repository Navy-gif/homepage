require('dotenv').config();

const { Manager } = require('./src/middleware');
const config = require('./config.json');

// eslint-disable-next-line no-new
new Manager(config);