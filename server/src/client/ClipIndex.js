const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const { Logger } = require('../util');

class ClipIndex extends EventEmitter {

    constructor(client, { media: { videos, thumbnails } }) {
        super();

        this.client = client;
        this.logger = new Logger(this);
        this.baseDirectory = this.client.baseDirectory;
        this.indexDir = `${this.baseDirectory}/clipIndex.json`;
        this.videoDirectory = path.join(this.baseDirectory, videos);
        this.thumbnailDirectory = path.join(this.baseDirectory, thumbnails);

        if (fs.existsSync(this.indexDir)) this.index = require(this.indexDir);
        else this.index = {};

        if (!fs.existsSync(this.videoDirectory)) fs.mkdirSync(this.videoDirectory);
        if (!fs.existsSync(this.thumbnailDirectory)) fs.mkdirSync(this.thumbnailDirectory);

        if (process.platform === 'linux') {
            // Not a particularly flexible way of doing it this way -- 
            // shouldn't even need to do this but for some reason it wouldn't find them with the PATH variable
            ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
            ffmpeg.setFfprobePath('/usr/bin/ffprobe');
        }

        this.syncIndex();

    }

    add(file, name, uploader) {

        return new Promise((resolve, reject) => {
            
            const timestamp = Date.now();
            const filename = `${uploader.id}-${timestamp}-${file.name}`;
            const videoPath = `${this.videoDirectory}/${filename}`;

            file.mv(videoPath, async (err) => {
                if (err) {
                    this.logger.error(err.stack || err);
                    return reject(err);
                }

                const thumbnail = await this._createThumbnail(videoPath);
                const duration = await this._extractDuration(videoPath).catch((err) => this.logger.error(err.stack || err));

                this.index[filename] = {
                    name,
                    timestamp,
                    filename,
                    thumbnail,
                    duration,
                    uploader: {
                        id: uploader.id,
                        tag: `${uploader.username}#${uploader.discriminator}`
                    }
                };

                fs.writeFileSync(this.indexDir, JSON.stringify(this.index));
                this.emit('upload', this.index[filename]);
                
                resolve();

            });

        });

    }

    async syncIndex() {

        const index = Object.values(this.index);
        const clips = fs.readdirSync(this.videoDirectory);
        const thumbnails = fs.readdirSync(this.thumbnailDirectory);

        for (const { filename, thumbnail } of index) {
            const _path = path.join(this.videoDirectory, filename);
            const _thumbnail = path.join(this.thumbnailDirectory, thumbnail);
            if (!fs.existsSync(_path)) {
                if(fs.existsSync(_thumbnail)) fs.unlinkSync(_thumbnail);
                delete this.index[filename];
                continue;
            }

            if (!fs.existsSync(_thumbnail)) {
                const img = await this._createThumbnail(_path);
                this.index[filename].thumbnail = img;
            }

        }

        for (const clip of clips) {
            const _path = path.join(this.videoDirectory, clip);
            if (!this.index[clip]) fs.unlinkSync(_path);
        }

        for (const tb of thumbnails) {
            if (!index.some((entry) => entry.thumbnail === tb)) fs.unlinkSync(path.join(this.thumbnailDirectory, tb));
        }

        fs.writeFileSync(this.indexDir, JSON.stringify(this.index));

    }

    _extractDuration(path) {

        return new Promise((resolve, reject) => {

            ffmpeg.ffprobe(path, (err, metadata) => {
                if (err) {
                    this.logger.error(`Error extracting duration for ${path}`);
                    return reject(err);
                }
                const dur = parseFloat(metadata.format.duration);
                let minutes = Math.floor(dur / 60);
                if(`${minutes}`.length === 1) minutes = `0${minutes}`;
                let seconds = Math.round(dur % 60);
                if (`${seconds}`.length === 1) seconds = `0${seconds}`;
                resolve(`${minutes}:${seconds}`);
            });
        });

    }

    _createThumbnail(path) {

        return new Promise((resolve) => {
            const video = new ffmpeg(path);
        
            let thumbnailPath = null;
            video.once('end', () => {
                this.logger.info(`Generated thumbnail for ${path}`);
                resolve(thumbnailPath);
            });
            video.once('filenames', ([filename]) => {
                thumbnailPath = filename;
            });

            video.takeScreenshots({
                count: 1,
                folder: this.thumbnailDirectory,
                filename: '%b'
            });
        });

    }

    get clips() {
        return Object.values(this.index);
    }

    getByTitle(title) {
        title = title.toLowerCase();
        for (const entry of Object.values(this.index))
            if (entry.name.toLowerCase() === title)
                return entry;
    }

    clipsByUser(id) {
        return Object.values(this.index).filter((entry) => entry.uploader.id === id);
    }

}

module.exports = ClipIndex;