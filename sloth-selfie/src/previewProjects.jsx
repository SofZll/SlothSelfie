import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/Previews.css';
import './styles/App.css';

import GanttChartView from './components/GanttChartView';

import { AuthContext } from './contexts/AuthContext';
import { useCalendar } from "./contexts/CalendarContext";
import { apiService } from './services/apiService';

//TODO CAMBIARE PATH DEL FETCH SUL SERVER

const PreviewProjects= ({ viewType }) => {
    const { user } = React.useContext(AuthContext);
    const { activities, setActivities } = useCalendar();

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null); // State to store the selected project
    const navigate = useNavigate();  

    // function to navigate to the projects page
    const manageProjects = (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate('/projects');
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    const fetchProjectActivities = async (p) => {

        const updatedProjects = await Promise.all(
            p.map(async (pr) => {
                const response = await apiService(`/project/${pr._id}`, 'GET');
                if (response.success) return { ...pr, ...response.project };
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
    };

    const fetchProjects = async () => {
        const response = await apiService('/projects', 'GET');
        if (response.success) {
            setProjects(response.projects);
            fetchProjectActivities(response.projects);
        }
    }

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    // Function to choose a project for the Gantt chart
    const chooseProject = () => {
        return (
            <div className="project-selection">
                <h2>Select a project for the Gantt chart</h2>
                <ul className="project-list">
                    {projects.map((project) => (
                        <li key={project._id} onClick={() => setSelectedProject(project)}>
                            {project.title}
                        </li>
                    ))}
                </ul>
            </div>
        );
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
                            <div key={project._id} className={`event-card event-border-orange`}>
                            <strong>{project.title}</strong> - Owner: {project.owner.username}, Members: {project.members.map(m => m.username).join(", ")}
                        </div>
                            ))}
                    </div>
                );

            case "recentDeadlines":
                return (
                    <div className="scrollable-list">
                        {activities.length > 0 ? (
                           activities.map((activity, index) => {
                            const deadlineDate = new Date(activity.deadline);
                            const today = new Date();   //TODO: TIMEMACHINE DATE
                            today.setHours(0, 0, 0, 0); // reset time, we compare only the date
        
                            // Check if the activity is overdue
                            const isOverdue = deadlineDate < today;
                            const borderColorClass = isOverdue ? "event-border-red" : "event-border-aqua";
        
                            return (
                                <div key={index} className={`event-card ${borderColorClass}`}>
                                    <strong>{activity.title}</strong> 
                                    (Project: {activity.projectTitle}) - Due: {deadlineDate.toLocaleDateString()} 
                                    - Members: {activity.sharedWith.map(m => m.username).join(", ")}
                                </div>
                            );
                        })
                        ) : (
                            <div className="div-postit">
                                <h2>No upcoming deadlines.</h2>
                            </div>
                        )}
                    </div>
                );

            case "ganttChart":
                return (
                    <div className="scrollable-list gantt-box">
                        {selectedProject ? (
                            <div className="event-card event-border-orange gantt-chart-card">
                                <h5>{selectedProject.title}</h5>
                                {/*render the Gantt chart for the selected project */}
                                <GanttChartView projectId={selectedProject._id} />
                            </div>
                        ) : (
                            chooseProject()
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