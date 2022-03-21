//import 'dotenv/config'
import './css/App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import React, { useEffect } from 'react';

import Home from './pages/Home';
import Media from './pages/Media';
import LoginPage from './pages/Login';
import Panel from './pages/Panel';
import { clearSession, fetchUser, setSession } from './util/Util';
import { PrivateRoute } from './Routes/Private';
import { useLoginContext } from './Structures/UserContext';

function App() {

    const [user, updateSession] = useLoginContext();

    useEffect(() => {
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
                        {user? <NavLink className='navlink' to='/panel' >Panel</NavLink> : null}
                    </div>
                </header>

                <div className='background'>

                    <div className='foreground'>

                        <Routes>

                            <Route exact path='/' element={<Home />} />
                            <Route exact path='/media' element={<Media />} />
                            <Route exact path='/login' element={<LoginPage />} />
                            <Route
                                path='/panel'
                                element={
                                    <PrivateRoute>
                                        <Panel />
                                    </PrivateRoute>
                                }
                            />

                        </Routes>

                    </div>

                </div>
            
            </BrowserRouter>

        </div>
    );
}

export default App;