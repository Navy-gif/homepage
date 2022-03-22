import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../css/Media.css';

const thumbnailBase = '/api/thumbnails/';

const ClipEntry = ({ name, filename, uploader, thumbnail, duration, clickHandler }) => {
    
    const _uploader = `${ uploader.tag } (${ uploader.id })`;

    return (
        <div className='clip-listing shadow' onClick={clickHandler}>
            <div className='flex-container'>
                <div title={name} id='title' className='listing-element'>
                    <p><strong>Title</strong>: {name}</p>
                </div>
                <div title={_uploader} id='uploader' className='listing-element'>
                    <p> <strong>Uploader</strong>: {_uploader }</p>
                </div>
                <div title={filename} id='filename' className='listing-element'>
                    <p> <strong>Filename</strong>: {filename}</p>
                </div>
                <div title={duration} id='duration' className='listing-element'>
                    <p> <strong>Length</strong>: {duration}</p>
                </div>
            </div>
            <img className='thumbnail shadow' alt='Thumbnail' src={`${thumbnailBase}${thumbnail}`}/>
        </div>
    );

};

const VideoPlayer = ({ refF, video }) => {
    
    const { filename, name, thumbnail } = video;
    const source = `/api/clips/${filename}`;

    return (
        <div ref={refF} className='video-popup shadow'>

            <Helmet>
                <meta property='og:url' content={window.location.href} />
                <meta property='og:image' content={`${window.location.origin}${thumbnailBase}${thumbnail}`} />
                <meta property='og:video:type' content='text/html' />
                <meta property='og:video:url' content={`${window.location.origin}${source}`} />
                <meta property='og:type' content='video.other' />
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
    const ref = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    document.addEventListener('mousedown', (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setVideo(null);
            navigate('/media');
        }
    });

    useEffect(() => {

        (async () => {
            const response = await fetch(`/api/clips`);
            if (response.status !== 200) return console.error('Failed to get clip index');
            const data = await response.json();
            updateIndex(data);
            if (location.hash) {
                const video = data.find(vid => `#${vid.name.toLowerCase()}` === location.hash.toLowerCase());
                if (video) setVideo(video);
            }
        })();

    }, []);

    const clickHandler = (video) => {
        setVideo(video);
        navigate(`#${video.name}`);
    };

    let i = 0;
    return (
        <div className='media-page'>
            {index.map(entry => <ClipEntry clickHandler={() => clickHandler(entry)} key={i++} {...entry} />)}
            {video ? <VideoPlayer refF={ref} video={video} />:''}
        </div>
    );

};

export default Media;