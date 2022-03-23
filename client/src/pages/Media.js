import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../css/Media.css';
import ClickDetector from '../util/ClickOutside';

const thumbnailBase = '/api/thumbnails/';

const ClipEntry = ({ name, filename, uploader, thumbnail, duration, clickHandler }) => {
    
    const _uploader = `${ uploader.tag } (${ uploader.id })`;

    return (
        <div className='clip-listing shadow' onClick={clickHandler}>
            <div className='flex-container'>
                <div title={name} id='title' className='listing-element'>
                    <p><strong>Title</strong>:<br/> {name}</p>
                </div>
                <div title={_uploader} id='uploader' className='listing-element'>
                    <p> <strong>Uploader</strong>:<br /> {_uploader }</p>
                </div>
                <div title={filename} id='filename' className='listing-element'>
                    <p> <strong>Filename</strong>:<br /> {filename}</p>
                </div>
                <div title={duration} id='duration' className='listing-element'>
                    <p> <strong>Length</strong>:<br /> {duration}</p>
                </div>
            </div>
            <img className='thumbnail shadow' alt='Thumbnail' src={`${thumbnailBase}${thumbnail}`}/>
        </div>
    );

};

const VideoPlayer = ({ refF, video }) => {
    
    // eslint-disable-next-line no-unused-vars
    const { filename, name, thumbnail, uploader } = video;
    const source = `/api/clips/${filename}`;

    return (
        <div ref={refF} className='video-popup shadow'>

            <Helmet>
                {/* <title>{name}</title>
                <meta name='author' content={uploader.name} />
                <meta property='og:url' content={window.location.href} />
                <meta property='og:image' content={`${window.location.origin}${thumbnailBase}${thumbnail}`} />
                <meta property='og:video:type' content='text/html' />
                <meta property='og:video:url' content={`${window.location.origin}${source}`} />
                <meta property='og:type' content='video.other' /> */}
            </Helmet>
            
            <div>
                <h1 className='no-margin no-padding'>
                    {name}
                </h1>
            </div>
            <video className='video-player center' controls >
                <source src={source} type='video/mp4' />
            </video>
        </div>
    );

};

const Media = () => {

    const [index, updateIndex] = useState([]);
    const [video, setVideo] = useState();

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        (async () => {
            const response = await fetch(`/api/clips`);
            if (response.status !== 200) return console.error('Failed to get clip index');
            const data = await response.json();
            updateIndex(data);
            
            const [, , videoname] = location.pathname.toLowerCase().split('/');
            if (videoname) {
                const video = data.find(vid => vid.name.toLowerCase() === videoname);
                if (video) setVideo(video);
            }
        })();

    }, []);

    const clickHandler = (video) => {
        setVideo(video);
        //navigate(`#${video.name}`);
        navigate(`/media/${video.name}`);
    };

    const cb = () => {
        setVideo(null);
        navigate('/media');
    };

    let i = 0;
    return (
        <div className='media-page'>

            <Helmet>
                {/* <title>V i d e o s</title> */}
                <meta
                    name="description"
                    content="Page where I upload clips n stuff"
                />
            </Helmet>

            {index.map(entry => <ClipEntry clickHandler={() => clickHandler(entry)} key={i++} {...entry} />)}
            
            {video ? <ClickDetector callback={cb} ><VideoPlayer video={video} /></ClickDetector> : ''}
        
        </div>
    );

};

export default Media;