import React, { useEffect, useRef, useState } from 'react';
import '../css/Media.css';

const ClipEntry = ({ name, filename, uploader, thumbnail, duration, clickHandler }) => {
    
    const _uploader = `${ uploader.tag } (${ uploader.id })`;

    return (
        <div className='clip-listing' onClick={clickHandler}>
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
            <img className='thumbnail' alt='Thumbnail' src={`/api/thumbnails/${thumbnail}`}/>
        </div>
    );

};

const VideoPlayer = ({ refF, video }) => {
    
    const { filename, name } = video;
    const source = `/api/clips/${filename}`;

    return (
        <div ref={refF} className='video-popup'>
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

    document.addEventListener('mousedown', (event) => {
        if(ref.current && !ref.current.contains(event.target)) setVideo(null);
    });

    useEffect(() => {

        (async () => {
            const response = await fetch(`/api/clips`);
            if (response.status !== 200) return console.error('Failed to get clip index');
            updateIndex(await response.json());
        })();

    }, []);

    let i = 0;
    return (
        <div className='media-page'>
            {index.map(entry => <ClipEntry clickHandler={() => setVideo(entry)} key={i++} {...entry} />)}
            {video ? <VideoPlayer refF={ref} video={video} />:''}
        </div>
    );

};

export default Media;