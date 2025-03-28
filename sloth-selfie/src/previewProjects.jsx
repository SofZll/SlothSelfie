import React, { useState, useEffect } from "react";

const PreviewProjects= ({ viewType, userLogged }) => {
    const [projects, setProjects] = useState([]);
    const user = userLogged;
    console.log(user);
    
    //TODO SPOSTA LA FETCH IN UN ALTRO FILE ES projectsUtils.js
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/projects");
                if (!response.ok) {
                    throw new Error("Error fetching projects");
                }
                
                const projects = await response.json();
                console.log("Fetched projects:", projects);
                // Filter projects based on the logged-in user
                const userProjects = projects.filter(
                    (project) =>
                        project.owner.username === user.username ||
                        project.members.some((m) => m.username === user.username)
                );
                
                setProjects(userProjects);
            }
            catch (error) {
                console.error("Error loading projects:", error);
            }
        };
        
        loadProjects();
    }, []);

     // function to navigate to the projects page, we use window.location.href to navigate without using react-router (pure JS)
    const manageProjects = () => {
        window.location.href = "/projects.html";
    };
    
//TODO AGGIUSTA
    const renderProjects = () => {
        switch (viewType) {
            case "list":
                return (
                    <ul>
                        {projects.map((project, index) => (
                            <li key={index}>
                                <strong>{project.title}</strong>
                            </li>
                        ))}
                    </ul>
                );

            case "recentDeadlines":
                return (
                    <ul>
                        {projects
                            .filter((project) => project.deadline)
                            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                            .slice(0, 3)
                            .map((project, index) => (
                                <li key={index}>
                                    <strong>{project.title}</strong> - Due: {new Date(project.deadline).toLocaleDateString()}
                                </li>
                            ))}
                    </ul>
                );

            default:
                return <p>No projects available.</p>;
        }
    };

    return (
        <div className="inCard">
            {renderProjects()}
            <button className="btn btn-main blue" onClick={manageProjects}>Manage Projects</button>
        </div>
    );
};

export default PreviewProjects;