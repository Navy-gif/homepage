import React, { useState } from "react";
import { useLoginContext } from "../Structures/UserContext";
import '../css/Profile.css';

const Token = ({ user }) => {
    
    const [token, updateToken] = useState(user?.token);
    console.log(user);

    const generateToken = async ({target: button}) => {

        button.disabled = true;
        const response = await fetch(`/api/user/token`, {
            credentials: 'include'
        });

        button.disabled = true;

        if (response.status !== 200) return;

        const { token } = await response.json();
        updateToken(token);

    };

    return (
        <div >
            
            <p>
                The upload token lets you send files directly to the <code>/api/upload</code> endpoint.<br />
                The token needs to be under the <code>Authorization</code> header.
            </p>

            <div className='token'>
                {!token ?
                    <span><button onClick={generateToken}>Generate token</button> </span> :
                    <span><p>{token}</p> <button onClick={generateToken}>Regenerate token</button></span>
                }
            </div>

        </div>
    );

};

const Profile = () => {

    const [user] = useLoginContext();
    
    return (
        <div className='profile'>
            
            <Token user={user} />

        </div>
    );

};

export default Profile;