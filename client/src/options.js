export default {
    get domain() { return process.env.NODE_ENV === 'production' ? 'corgi.wtf' : 'localhost:4000'; }
};