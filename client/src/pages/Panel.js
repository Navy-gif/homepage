import React, { useEffect, useState } from "react";
import '../css/Panel.css';

const User = ({user}) => {

    return (
        <div className='user flex-container'>
            {user.tag}
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
        <div className='panel flex-container'>
            {users.length ? users.map(user => <User key={user.id} user={user}/>):'No users'}
        </div>
    );

};

export default Panel;