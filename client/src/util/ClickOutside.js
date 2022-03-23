import React, { useEffect, useRef } from "react";

const alerter = (ref, callback) => {
    useEffect(() => {

        const listener = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                return callback();
            }
        };
        
        document.addEventListener('mousedown', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
        };

    }, [ref]);
};

// Component wrapper to enable listening for clicks outside of the given component
const ClickDetector = ({children, callback}) => {

    const wrapperRef = useRef(null);
    alerter(wrapperRef, callback);

    return (
        <div ref={wrapperRef}>
            {children}
        </div>
    );

};

export default ClickDetector;