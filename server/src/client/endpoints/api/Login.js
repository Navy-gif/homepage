const { APIEndpoint } = require('../../interfaces');

class Login extends APIEndpoint {
    
    constructor(client, opts) {

        super(client, {
            name: 'login',
            path: '/login',
            ...opts
        });

        this.methods = [
            ['get', this.get.bind(this)]
        ];

        this.subpaths = [
            ['/fail', 'get', this.fail.bind(this)]
        ];

        this.middleware = [this.alreadyLoggedIn.bind(this), this.client.passport.authenticate('discord', { failureRedirect: '/login/fail' })];

        this.init();

    }

    get(req, res) {
        // if (!['132777808362471424'].includes(req.user.id)) {
        //     this.logger.info(`${req.user.username}#${req.user.discriminator} (${req.user.id}) attempted login, denying`);
        //     req.session.destroy();
        //     return res.status(401).send('<script>window.close();</script>');
        // }
        res.status(200).send('<script>window.close();</script>');
    }

    // get(req, res) {
    //     if (!['132777808362471424'].includes(req.user.id)) {
    //         req.session.destroy();
    //         res.status(401).send('Unauthorised');
    //     }
    //     res.status(200).redirect(`/panel`);
    // }

    alreadyLoggedIn(req, res, next) {

        // User is already logged in
        this.logger.debug(`Checking login: ${req.user}`);
        if (req.user) {
            return res.redirect(`${this.client.domain}/panel`);
        }
        next();

    }

    fail(req, res) {
        this.logger.warn(`Attempted login from ${req.ip}`);
        res.status(200).send('<script>window.close();</script>');
    }

}

module.exports = Login;