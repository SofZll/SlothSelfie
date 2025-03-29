import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const PreviewProjects= ({ viewType, userLogged }) => {
    const [projects, setProjects] = useState([]);
    const user = userLogged;
    console.log(user);
    const navigate = useNavigate();
    
    //TODO SPOSTA LA FETCH IN UN ALTRO FILE ES projectsUtils.js
    //fetch non mantiene la localstorage quando entro in projests e torno in home (o per lo meno non lo fetcha subito, solo scorrendo il carousel)
    //mi fa vedere tutti i progetti (non va il filtro del logged in user)? testalo

    // function to navigate to the projects page, we use window.location.href to navigate without using react-router (pure JS)
    const manageProjects = (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(window.location.href = "/projects.html");
            document.body.classList.remove('zoom-in');
        }, 300);
    };

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
                return (<div className="div-postit">
                            <h2>No projects available.</h2>
                        </div>);
        }
    };

    return (
        <div className="inCard">
            {renderProjects()}
                <div className="divBtn">
                    <button className="btn btn-main blue" onClick={manageProjects}>Manage Projects</button>
                </div>
        </div>
    );
};

export default PreviewProjects;