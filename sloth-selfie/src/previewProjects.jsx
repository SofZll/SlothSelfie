import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/Previews.css';
import './styles/App.css';

const PreviewProjects= ({ viewType, userLogged }) => {
    const [projects, setProjects] = useState([]);
    const [activities, setActivities] = useState([]);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const navigate = useNavigate();  
    
    // Function to handle login/logout state
    useEffect(() => {
        if (userLogged) {
            setIsUserLoggedIn(true);
        } else {
            setIsUserLoggedIn(false);
            setProjects([]); // Reset projects if the user is logged out
            setActivities([]); // Reset activities if the user is logged out
        }
    }, [userLogged]);


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
        if (isUserLoggedIn) {
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
                            project.owner.username === userLogged.username ||
                            project.members.some((m) => m.username === userLogged.username)
                    );
                    
                    setProjects(userProjects);
                    //now we fill the  activities of the projects
                    fetchProjectActivities(userProjects);
                }
                catch (error) {
                    console.error("Error loading projects:", error);
                }
            };
            
            loadProjects();
        }
    }, [isUserLoggedIn, userLogged]);


    const fetchProjectActivities = async (projects) => {
        try {
            const updatedProjects = await Promise.all(
                projects.map(async (project) => {
                    const response = await fetch(`http://localhost:8000/api/project/${project._id}`);
                    if (!response.ok) {
                        throw new Error("Error fetching project details");
                    }
                    const projectDetails = await response.json();
                    return { ...project, ...projectDetails }; // Merge project details with the original project object
                })
            );
            setProjects(updatedProjects);
        //We order the activities by deadline and limit to 10
        const allActivities = updatedProjects.flatMap((project) =>
            project.phases.flatMap((phase) =>
                [
                    ...phase.activities.map(activity => ({ ...activity, projectTitle: project.title })),
                    ...phase.subphases.flatMap((subphase) =>
                        subphase.activities.map(activity => ({ ...activity, projectTitle: project.title }))
                    )
                ]
            )
        )
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) // Order activities by deadline
        .slice(0, 10); // Limit to 10 activities

        setActivities(allActivities);
    } catch (error) {
        console.error("Error fetching project activities:", error);
    }
};


    const renderProjects = () => {
        if (projects.length === 0) {
            return (
                <div className="scrollable-list">
                    <div className="div-postit">
                        <h2>No projects available.</h2>
                    </div>
                </div>
            );
        }
        switch (viewType) {
            case "list":
                default:
                return (
                    <div className="scrollable-list">
                        {projects.map((project, index) => (
                            <div key={project._id} className={`event-card event-border-aqua`}>
                            <strong>{project.title}</strong> - Owner: {project.owner.username}, Members: {project.members.map(m => m.username).join(", ")}
                        </div>
                            ))}
                    </div>
                );

            case "recentDeadlines":
                return (
                    <div className="scrollable-list">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <div key={index} className="event-card event-border-orange">
                                    <strong>{activity.title}</strong> (Project: {activity.projectTitle}) - Due: {new Date(activity.deadline).toLocaleDateString()} - Members: {activity.sharedWith.map(m => m.username).join(", ")}
                                </div>
                            ))
                        ) : (
                            <div className="div-postit">
                                <h2>No upcoming deadlines.</h2>
                            </div>
                        )}
                    </div>
                );
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