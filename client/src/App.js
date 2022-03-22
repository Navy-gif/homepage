//import 'dotenv/config'
import './css/App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import React, { useEffect } from 'react';

import Home from './pages/Home';
import Media from './pages/Media';
import LoginPage from './pages/Login';
import Panel from './pages/Panel';
import { clearSession, fetchUser, setSession, logout } from './util/Util';
import { PrivateRoute } from './Routes/Private';
import { useLoginContext } from './Structures/UserContext';
import NotFound from './pages/NotFound';
import Upload from './pages/Upload';

const User = ({user}) => {
    return (
        <div className='flex-container user-controls'>
            <p className='no-margin'> {user.tag} </p>
            <button className='logout-btn' onClick={logout}>Logout</button>
        </div>
    );
};

const Restricted = ({user}) => {
    
    if (!user) return '';
    const { upload, admin } = user.permissions;
    return (
        <div className='flex-container'>
            {admin ? <NavLink className='navlink' to='/panel' >Panel</NavLink> : ''}
            {upload || admin ? <NavLink className='navlink' to='/upload' >Upload</NavLink>: '' }
            <User user={user} />
        </div>
    );

};

function App() {

    const [user, updateSession] = useLoginContext();

    useEffect(() => {
        document.title = `Corgi Corner`;
        fetchUser().then(user => {
            if (user) setSession(user, user.accessToken);
            else clearSession();
            updateSession();
        });
    }, []);

    return (
        <div className="app">

            <BrowserRouter>
            
                <header>
                    <div className='flex-container'>
                        <NavLink className='navlink' to='/'>Home</NavLink>
                        <NavLink className='navlink' to='/media'>Media</NavLink>
                        <Restricted user={user} />
                    </div>
                </header>

                <div className='background'>

                    <div className='foreground'>

                        <Routes>

                            <Route exact path='/' element={<Home />} />
                            {/* <Route path='/media'>
                                <Route path=':name' element={<Media />} />
                                <Route path='' element={<Media />} />
                            </Route> */}
                            <Route path='/media/*' element={<Media />} />
                            <Route exact path='/login' element={<LoginPage />} />
                            <Route path='/upload' element={<PrivateRoute><Upload /></PrivateRoute>} />
                            <Route path='/panel' element={<PrivateRoute><Panel /></PrivateRoute>} />
                            <Route path='*' element={<NotFound />} />

                        </Routes>

                    </div>

                </div>
            
            </BrowserRouter>

        </div>
    );
}

export default App;