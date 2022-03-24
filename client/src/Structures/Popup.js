import React from "react";
import '../css/Structures.css';

const Popup = ({toggle, children}) => {
    
    if (!toggle) return null;

    return (
        <div className='popup'>
            {children}
        </div>
    );

};

export default Popup;