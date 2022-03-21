import React, { useContext, useState } from 'react';
import { getUser } from '../util/Util';

const LoginContext = React.createContext();
const LoginUpdateContext = React.createContext();

export const useLoginContext = () => {
    return [useContext(LoginContext), useContext(LoginUpdateContext)];
};

export const UserContext = ({ children }) => {

    const [user, setLoginState] = useState(getUser());
    const updateLoginState = () => {
        setLoginState(getUser());
    };

    return (
        <LoginContext.Provider value={user}>
            <LoginUpdateContext.Provider value={updateLoginState}>
                {children}
            </LoginUpdateContext.Provider>
        </LoginContext.Provider>
    );

};