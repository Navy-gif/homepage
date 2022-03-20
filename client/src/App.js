import './css/App.css';
import { BrowserRouter, Routes, Route, NavLink, Redirect } from 'react-router-dom';

import Home from './pages/Home';
import Media from './pages/Media';

function App() {

    return (
        <div className="app">

            <BrowserRouter>
            
                <header>
                    <div className='flex-container'>
                        <NavLink className='navlink' to='/'>Home</NavLink>
                        <NavLink className='navlink' to='/media'>Media</NavLink>
                    </div>
                </header>

                <div className='background'>

                    <div className='foreground'>

                        <Routes>

                            <Route exact path='/' element={<Home />} />
                            <Route exact path='/media' element={<Media />} />

                        </Routes>

                    </div>

                </div>
            
            </BrowserRouter>

        </div>
    );
}

export default App;