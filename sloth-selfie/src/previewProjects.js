import React from "react";
import { Link } from "react-router-dom";

const PreviewProjects = () => {
    return (
        <div className='inCard'>
            <p>Preview of all your projects!</p>
            <Link to="/projects">
                <button className="btn btn-main">Manage Projects</button>
            </Link>
        </div>
    );
};

export default PreviewProjects;