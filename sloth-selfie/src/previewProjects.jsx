import React from "react";

const PreviewProjects = () => {
    // function to navigate to the projects page, we use window.location.href to navigate without using react-router (pure JS)
    const manageProjects = () => {
        window.location.href = "/projects.html";
    };

    return (
        <div className="inCard">
            <p>Preview of all your projects!</p>
            <button className="btn btn-main blue" onClick={manageProjects}>Manage Projects</button>
        </div>
    );
};

export default PreviewProjects;