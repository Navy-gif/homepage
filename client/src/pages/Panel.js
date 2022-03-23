import React, { useEffect, useState } from "react";
import '../css/Panel.css';
import Dropdown from "../Structures/Dropdown";

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

    return (
        <div className='user flex-container shadow'>
            <div className='identity'>
                {user.tag} ({user.id})
            </div>

            <div className='permissions'>
                <Dropdown onUpdate={onUpdate} items={perms} name='Permissions' />
            </div>

            <div className='uploads'>
                Manage Uploads
            </div>

            <div>
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
            {users.length ? users.map(user => <User key={user.id} user={user} />) : 'No users'}
            
            <div>
                <button onClick={() => { console.log(users); }}>
                    save
                </button>
            </div>

        </div>
    );

};

export default Panel;