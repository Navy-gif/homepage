import { useEffect, useRef, useState } from 'react'
import '../css/Media.css'
const MediaComponent = ({src, width}) => {

    return (
        <div className='media-content'>
            <video controls width={width}>
                <source src={src} type='video/mp4'></source>
            </video>
        </div>
    )

}

const Media = () => {

    const [index, updateIndex] = useState([])
    const mediaPage = useRef(null);

    useEffect(() => {

        (async () => {
            const response = await fetch(`/clips`);
            if (response.status !== 200) return console.error('Failed to get clip index');
            updateIndex([...index, ...await response.json()])
        })()


    }, []);

    return (
        <div className='media-page' ref={mediaPage}>
            {index.map(elem => <MediaComponent
                key={elem}
                width={mediaPage.current.clientWidth-50}
                src={`http://localhost:5000/clips/${elem}`} />)}
        </div>
    )
}

export default Media;