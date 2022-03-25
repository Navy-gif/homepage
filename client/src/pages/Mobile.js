import React from "react";

const Mobile = () => {
    console.log(window.screen);
    const { screen } = window;
    const height = screen.height * window.devicePixelRatio;
    const width = screen.width * window.devicePixelRatio;
    return (
        <div>
            {width} X {height} <br/>
            {screen.orientation.type}
        </div>
    );
};

export default Mobile;