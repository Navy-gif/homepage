const moment = require('moment');
const humaniseDuration = require('humanize-duration');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { Util: DiscordUtil } = require('discord.js');

const Constants = {
    QuotePairs: {
        '"': '"', //regular double
        "'": "'", //regular single
        "‘": "’", //smart single
        "“": "”" //smart double
    }
};

const StartQuotes = Object.keys(Constants.QuotePairs);
const QuoteMarks = StartQuotes + Object.values(Constants.QuotePairs);

const humaniser = humaniseDuration.humanizer({
    language: 'short',
    languages: {
        short: {
            y: () => "y",
            mo: () => "mo",
            w: () => "w",
            d: () => "d",
            h: () => "h",
            m: () => "m",
            s: () => "s",
            ms: () => "ms"
        }
    }
});

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

class Util {

    constructor() {
        throw new Error("Class may not be instantiated.");
    }

    /**
     * Capitalise the first letter of the string
     * @param {string} str The string to capitalise
     * @returns {string} The capitalised string
     */
    static capitalise(str) {
        const first = str[0].toUpperCase();
        return `${first}${str.substring(1)}`;
    }

    static paginate(items, page = 1, pageLength = 10) {
        const maxPage = Math.ceil(items.length / pageLength);
        if (page < 1) page = 1;
        if (page > maxPage) page = maxPage;
        const startIndex = (page - 1) * pageLength;
        return {
            items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
            page,
            maxPage,
            pageLength
        };
    }

    static downloadAsBuffer(source) {
        return new Promise((resolve, reject) => {
            fetch(source).then((res) => {
                if (res.ok) resolve(res.buffer());
                else reject(res.statusText);
            });
        });
    }

    /**
     * Read directory recursively and return all file paths
     * @static
     * @param {string} directory Full path to target directory
     * @param {boolean} [ignoreDotfiles=true]
     * @return {string[]} Array with the paths to the files within the directory 
     * @memberof Util
     */
    static readdirRecursive(directory, ignoreDotfiles = true) {

        const result = [];

        (function read(directory) {
            const files = fs.readdirSync(directory);
            for (const file of files) {
                if (file.startsWith('.') && ignoreDotfiles) continue;
                const filePath = path.join(directory, file);

                if (fs.statSync(filePath).isDirectory()) {
                    read(filePath);
                } else {
                    result.push(filePath);
                }
            }
        }(directory));

        return result;

    }

    static wait(ms) {
        return this.delayFor(ms);
    }

    static delayFor(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    static escapeMarkdown(text, options) {
        if (typeof text !== 'string') return text;
        return DiscordUtil.escapeMarkdown(text, options);
    }

    /**
     * Markdown formatting characters
     */
    static get formattingPatterns() {
        return [
            ['\\*{1,3}([^*]*)\\*{1,3}', '$1'],
            ['_{1,3}([^_]*)_{1,3}', '$1'],
            ['`{1,3}([^`]*)`{1,3}', '$1'],
            ['~~([^~])~~', '$1']
        ];
    }

    /**
     * Strips markdown from given text
     * @static
     * @param {string} content
     * @returns {string}
     */
    static removeMarkdown(content) {
        if (!content) throw new Error('Missing content');
        this.formattingPatterns.forEach(([pattern, replacer]) => {
            content = content.replace(new RegExp(pattern, 'gu'), replacer);
        });
        return content.trim();
    }

    /**
     * Sanitise user given regex; escapes unauthorised characters
     * @static
     * @param {string} input
     * @param {string[]} [allowed=['?', '\\', '(', ')', '|']]
     * @return {string} The sanitised expression
     * @memberof Util
     */
    static sanitiseRegex(input, allowed = ['?', '\\', '(', ')', '|']) {
        if (!input) throw new Error('Missing input');
        const reg = new RegExp(`[${this.regChars.filter((char) => !allowed.includes(char)).join('')}]`, 'gu');
        return input.replace(reg, '\\$&');
    }

    /**
     * RegEx characters
     */
    static get regChars() {
        return ['.', '+', '*', '?', '\\[', '\\]', '^', '$', '(', ')', '{', '}', '|', '\\\\', '-'];
    }

    /**
     * Escape RegEx characters, prefix them with a backslash
     * @param {string} string String representation of the regular expression
     * @returns {string} Sanitised RegEx string
     */
    static escapeRegex(string) {
        if (typeof string !== 'string') {
            throw new Error("Invalid type sent to escapeRegex.");
        }

        return string
            .replace(/[|\\{}()[\]^$+*?.]/gu, '\\$&')
            .replace(/-/gu, '\\x2d');
    }

    /* By Qwerasd#5202 */
    // I'm not entirely sure how this works, except for the fact that it loops through each CHARACTER and tries to match quotes together.
    // Supposedly quicker than regex, and I'd agree with that statement. Big, messy, but quick. Also lets you know if the grouped word(s) was a quote or not, which is useful for non-spaced quotes e.g. "Test" vs. "Test Test"
    static parseQuotes(string) {
        if (!string) return [];

        let quoted = false,
            wordStart = true,
            startQuote = '',
            endQuote = false,
            isQuote = false,
            word = '';

        const words = [],
            chars = string.split('');

        chars.forEach((char) => {
            if ((/\s/u).test(char)) {
                if (endQuote) {
                    quoted = false;
                    endQuote = false;
                    isQuote = true;
                }
                if (quoted) {
                    word += char;
                } else if (word !== '') {
                    words.push([word, isQuote]);
                    isQuote = false;
                    startQuote = '';
                    word = '';
                    wordStart = true;
                }
            } else if (QuoteMarks.includes(char)) {
                if (endQuote) {
                    word += endQuote;
                    endQuote = false;
                }
                if (quoted) {
                    if (char === Constants.QuotePairs[startQuote]) {
                        endQuote = char;
                    } else {
                        word += char;
                    }
                } else if (wordStart && StartQuotes.includes(char)) {
                    quoted = true;
                    startQuote = char;
                } else {
                    word += char;
                }
            } else {
                if (endQuote) {
                    word += endQuote;
                    endQuote = false;
                }
                word += char;
                wordStart = false;
            }
        });

        if (endQuote) {
            words.push([word, true]);
        } else {
            word.split(/\s/u).forEach((subWord, i) => {
                if (i === 0) {
                    words.push([startQuote + subWord, false]);
                } else {
                    words.push([subWord, false]);
                }
            });
        }

        return words;

    }

    /**
     * Make seconds human readable
     * @static
     * @param {Number} seconds
     * @param {boolean} [relative=false] Whether to append "ago"
     * @return {String} Humanised format
     * @memberof Util
     */
    static humanise(seconds, relative = false) {
        return humaniser(seconds * 1000, { largest: 2 }) + (relative ? ' ago' : '');
    }

    /**
     * Convert seconds to a human readable string representation
     * @param {int} seconds
     * @returns {string}
     */
    static duration(seconds) {
        const { plural } = this;
        let s = 0,
            m = 0,
            h = 0,
            d = 0,
            w = 0;
        s = Math.floor(seconds);
        m = Math.floor(s / 60);
        s %= 60;
        h = Math.floor(m / 60);
        m %= 60;
        d = Math.floor(h / 24);
        h %= 24;
        w = Math.floor(d / 7);
        d %= 7;
        return `${w ? `${w} ${plural(w, 'week')} ` : ''}`
            + `${d ? `${d} ${plural(d, 'day')} ` : ''}`
            + `${h ? `${h} ${plural(h, 'hour')} ` : ''}`
            + `${m ? `${m} ${plural(m, 'minute')} ` : ''}`
            + `${s ? `${s} ${plural(s, 'second')} ` : ''}`.trim();
    }

    static plural(amt, word) {
        if (amt === 1) return word;
        return `${word}s`;
    }

    static get date() {
        return moment().format("YYYY-MM-DD HH:mm:ss");
    }

    static makePlainError(err) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack
        };
    }

    static mergeDefault(def, given) {
        if (!given) return def;
        for (const key in def) {
            if (!has(given, key) || given[key] === undefined) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = Util.mergeDefault(def[key], given[key]);
            }
        }
        return given;
    }

    //Shard Managing
    static fetchRecommendedShards(token, guildsPerShard = 1000) {
        if (!token) throw new Error("[util] Token missing.");
        return fetch("https://discord.com/api/v7/gateway/bot", {
            method: 'GET',
            headers: { Authorization: `Bot ${token.replace(/^Bot\s*/iu, '')}` }
        }).then((res) => {
            if (res.ok) return res.json();
            throw res;
        })
            .then((data) => data.shards * (1000 / guildsPerShard));
    }

}

module.exports = Util;