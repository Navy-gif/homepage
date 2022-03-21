/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Login.css';
import { useLoginContext } from '../Structures/UserContext';
import { login } from '../util/Util';

const LoginPage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [, updateUser] = useLoginContext();
    const from = location.state?.from?.pathname || '/';

    const _login = async () => {

        await login();
        //window.location.replace(`${proto}://${options.domain}/api/login`);
        updateUser();
        navigate(from, {replace: true});

    };

    return (
        <div className='login'>
            
            <p>
                Woah! You found the """secret""" page. ;)
            </p>

            <p>
                You probably want to click that button. Can't really blame you, curiosity and all that.
            </p>

            <p>
                Unfortunately for you it won't really do much for you. Or will it?
            </p>

            <p>
                No, really, it won't do anything for you.
            </p>

            <p>
                or... does it...?
            </p>

            <p>
                Only one way to find out, I guess...
            </p>

            <button onClick={_login}>Login</button>
        </div>
    );

};

export default LoginPage;