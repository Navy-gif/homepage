import React, { useEffect, useState } from "react";
import '../css/Panel.css';
import Dropdown from "../Structures/Dropdown";
import Popup from "../Structures/Popup";

const User = ({user}) => {

    const { permissions } = user;
    const perms = Object.entries(permissions)
        .map(([name, value]) => { return { name, value }; });
    
    const onUpdate = (event) => {
        console.log(permissions);
        const perm = event.target.name;
        const value = event.target.checked;
        permissions[perm] = value;
    };

    const [popup, togglePopup] = useState(false);

    const onClick = () => {
        togglePopup(!popup);
    };

    return (
        <div className='user flex-container shadow'>
            <div id='usertag' className=''>
                {user.tag} ({user.id})
            </div>

            <div className=''>
                <Dropdown onUpdate={onUpdate} items={perms} name='Permissions' />
            </div>

            <div onClick={onClick} className=''>
                <span>Manage Uploads</span>
                <Popup toggle={popup}>
                    Banger
                </Popup>
            </div>

            <div className=''>
                <button className='delete-btn'>
                    DELETE
                </button>
            </div>
        </div>
    );

};

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
            <div className='userlist'>
                {users.length ? users.map(user => <User key={user.id} user={user} />) : 'No users'}
            </div>
            
            <div className='bottom'>
                <button onClick={() => { console.log(users); }}>
                    save
                </button>
            </div>

        </div>
    );

};

export default Panel;