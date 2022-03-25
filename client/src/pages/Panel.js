import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import '../css/Panel.css';
import Dropdown from "../Structures/Dropdown";
import Popup from "../Structures/Popup";
import ClickDetector from "../util/ClickOutside";

const thumbnailBase = '/api/thumbnails/';
const ClipEntry = ({ name, filename, thumbnail, duration, deleteHandler }) => {


    return (
        <div className='clip-listing shadow' >
            <div className='flex-container'>
                <div title={name} id='title' className='listing-element'>
                    <p><strong>Title</strong><br /> {name}</p>
                </div>
                <div title={filename} id='filename' className='listing-element'>
                    <p> <strong>Filename</strong><br /> {filename}</p>
                </div>
                <div title={duration} id='duration' className='listing-element'>
                    <p> <strong>Length</strong><br /> {duration}</p>
                </div>
                <div id='delete-btn' className='listing-element'>
                    <button className='delete-btn clickable' onClick={deleteHandler}>
                        DELETE
                    </button>
                </div>
            </div>
            <img className='thumbnail shadow' alt='Thumbnail' src={`${thumbnailBase}${thumbnail}`} />
        </div>
    );

};

const User = ({user}) => {

    const { permissions } = user;
    const perms = Object.entries(permissions)
        .map(([name, value]) => { return { name, value }; });
    
    const [clips, updateClips] = useState([]);
    
    useEffect(() => {
        
        (async () => {
            const response = await fetch(`/api/users/${user.id}/clips`);
            const clips = await response.json();
            updateClips(clips);
            console.log(clips);
        })();

    }, []);
    
    const onUpdate = (event) => {
        const perm = event.target.name;
        const value = event.target.checked;
        permissions[perm] = value;
    };

    const [popup, togglePopup] = useState(false);

    const onClick = () => {
        togglePopup(!popup);
    };

    const deleteClip = async (clip) => {
        console.log(clip);
        const result = await fetch(`/api/clips/${clip.filename}`, {
            method: 'DELETE'
        });
        if (result.status !== 200) console.error('Clip delete failed');
        clips.splice(clips.indexOf(clip), 1);
        updateClips([...clips]);
    };

    return (
        <div className='user flex-container shadow'>
            <div id='usertag' className=''>
                {user.tag} ({user.id})
            </div>

            <div className=''>
                <Dropdown onUpdate={onUpdate} items={perms} name='Permissions' />
            </div>

            <div>
                <ClickDetector callback={() => {
                    togglePopup(false);
                }}>
                    <span className='clickable' onClick={onClick} >Manage Uploads</span>
                    <Popup toggle={popup}>
                        {clips.map(clip => <ClipEntry deleteHandler={() => deleteClip(clip)} key={clip.filename} {...clip} />)}
                    </Popup>
                </ClickDetector>
            </div>

            <div className=''>
                <button className='delete-btn clickable'>
                    DELETE
                </button>
            </div>
        </div>
    );

};

// const ClipManager = () => {
    
//     return (
//         <div>
            
//         </div>
//     );

// };

const Panel = () => {

    const [users, setUsers] = useState([]);

    useEffect(() => {

        (async () => {
            const response = await fetch('/api/users');
            if (response.status !== 200) return;
            const users = await response.json();
            setUsers(users);
        })();
        
    }, []);
    
    return (
        <div className='panel'>

            <Helmet>
                <title>Panel</title>
            </Helmet>

            <div className='userlist'>
                {users.length ? users.map(user => <User key={user.id} user={user} />) : 'No users'}
            </div>

            {/* <ClipManager /> */}
            
            <div className='bottom'>
                <button onClick={() => { console.log(users); }}>
                    save
                </button>
            </div>

        </div>
    );

};

export default Panel;