import React, { useState, useEffect } from "react";
import iconCross from './media/crossDark.svg';
import './css/setting.css';

function PreviewSetUp(props) {

    const handleSetUp = () => {
        props.setSetUp(!props.setUp);
    };


    return (
        <div className="settings">
            <div className="card-settings">
                <button className="btn-cross" onClick={handleSetUp}>
                    <img src={iconCross} alt="cross" className="icon-cross" />
                </button>
            </div>
        </div>
    );
}

export default PreviewSetUp;
