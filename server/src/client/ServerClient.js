const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

const http = require('http');
const https = require('https');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { Strategy: DiscordStrategy } = require('@navy.gif/passport-discord');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { Logger } = require('../util');
const Intercom = require('./Intercom');
const Registry = require('./Registry.js');
const ClipIndex = require('./ClipIndex');
const Database = require('./Database.js');
const Users = require('./Users');

class Client extends EventEmitter {

    constructor(opts = {}) {

        super();

        const { env } = process;

        this._options = opts;
        this._debug = env.DEBUG;
        this._mongoOpts = {
            database: env.API_DB,
            url: env.API_DB_URL
        };

        this.ready = false;
        this.shardId = parseInt(env.SHARD_ID);
        this.port = parseInt(env.HTTP_PORT) + this.shardId;
        this.domain = env.NODE_ENV === 'production' ? env.DOMAIN : `localhost`;
        this.proto = env.NODE_ENV === 'production' ? 'https' : 'http';
        this.baseDirectory = path.resolve(__dirname, '../..');
        this.mediaDirectory = path.join(this.baseDirectory, opts.media.videos);

        this.registry = new Registry(this);
        this.database = new Database(this, this._mongoOpts);
        this.intercom = new Intercom(this);
        this.users = new Users(this, {
            database: this.database,
            collection: env.API_USER_COLLECTION
        });
        this.logger = new Logger(this);
        this.clipIndex = new ClipIndex(this, opts);
        this.server = null;

        this.key = null;
        this.cert = null;
        try {
            this.key = fs.readFileSync(env.HTTP_KEY);
            this.cert = fs.readFileSync(env.HTTP_CERT);
        } catch (err) {
            // Do nothing
        }

        this.passport = passport;
        this.app = express();

        this.app.use((req, res, next) => {
            if (!this.ready) return res.status(503).send('Server not ready. Try again in a moment.');
            next();
        });

        // Shouldn't be necessary, everything should come from the same domain: galactic.corgi.wtf
        this.app.use(cors({
            origin: (origin, cb) => {
                if (!origin) return cb(null, true);
                if (['corgi.wtf', 'localhost'].some((x) => origin.includes(x))) {
                    return cb(null, true);
                }
                return cb('Unauthorised origin', false);
            }
        }));

        this.app.use(helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'script-src': ["'self'", "'unsafe-inline'"],
                    'style-src': ["'self'", "'unsafe-inline'"],
                    'img-src': ["'self'", "*.discord.com"],
                    'media-src': ["'self'"],
                    'frame-src': ["'https:'"]
                }
            }
        }));

        this.app.use(session({
            cookie: {
                maxAge: 0.5 * 24 * 60 * 60 * 1000, // 12h
                httpOnly: true,
                secure: false, // Cannot use secure without adding certs for the host machine as well, not just the proxy
                domain: this.domain
            },
            secret: env.API_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: this._mongoOpts.url + env.API_SESSION_STORE,
                collectionName: env.API_SESSION_COLLECTION
            })
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        passport.use(new DiscordStrategy(
            {
                clientID: env.DISCORD_ID,
                clientSecret: env.DISCORD_SECRET,
                callbackURL: `${this.proto}://${this.domain}${env.NODE_ENV === 'production' ? '' : `:${this.port}`}${env.AUTH_CALLBACK}`,
                scope: env.DISCORD_SCOPE.split(','),
                version: 9
            },
            (accessToken, refreshToken, profile, callback) => {
                this.logger.info(`${profile.username} is logging in.`);
                callback(null, profile);
            }
        ));

        passport.serializeUser(async (user, callback) => {
            user = await this.users.getOrCreate(user);
            callback(null, user);
        });

        passport.deserializeUser((user, callback) => {
            callback(null, user);
        });

        this.app.use((req, res, next) => {
            this.logger.debug(`New request to path ${req.path} || Route: ${req.route}`);
            res.once('finish', () => {
                this.logger.debug(`Request to ${req.path} finished`);
                const path = req.route?.path || req.path;
                this.logger.debug(`response done at path ${path} - ${res.statusCode}`);
            });
            // console.log(req.headers)
            // if (req.cookies) console.log(req.cookies);
            // if (req.user) console.log(req.user);
            next();
        });

        this.users.on('userCreate', (user) => {
            this.logger.info(`New user created: ${user.tag}`);
        });

        this.users.on('debug', (msg) => {
            this.logger.debug(msg);
        });


    }

    async init() {

        this.logger.info('Loading endpoints');
        await this.registry.init();
        await this.database.init();
        this.logger.debug(this.registry.print);
        const httpOpts = {
            port: this.port,
            key: this.key,
            cert: this.cert
        };

        if (this.key && this.cert) {
            this.logger.info(`Starting HTTPS server on port ${this.port}`);
            this.server = https.createServer(httpOpts, this.app).listen(this.port);
        } else {
            this.logger.warn(`Missing key and/or cert file, starting HTTP server on port ${this.port}`);
            this.server = http.createServer(httpOpts, this.app).listen(this.port);
        }

        this.ready = true;
        this.logger.info(`API client built in ${process.env.NODE_ENV} environment`);
        process.send({ _ready: true });

    }

}

module.exports = Client;
new Client(require('../../config.json')).init();