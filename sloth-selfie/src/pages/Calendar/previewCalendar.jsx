import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';

import '../../styles/Previews.css';
import '../../styles/App.css';

import { AuthContext } from '../../contexts/AuthContext';
import { useCalendar } from "../../contexts/CalendarContext";

import { apiService } from '../../services/apiService';


const PreviewCalendar = ({ viewType }) => {
    const { activities, setActivities, events, setEvents } = useCalendar();
    const { user } = React.useContext(AuthContext);

    const navigate = useNavigate();
    const [todayActivities, setTodayActivities] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);


    const fetchEvents = async () => {
        const response = await apiService('/events', 'GET');
        if (response.success) setEvents(response.events);
    }

    const fetchActivities = async () => {
        const response = await apiService('/activities', 'GET');
        if (response.success) setActivities(response.activities.filter(activity => activity.deadline !== null && activity.deadline !== undefined && !activity.completed));
    }

    const fetchTasks = async () => {
        const response = await apiService('/tasks', 'GET');
        if (response.success) setTasks(response.tasks.filter(task => task.deadline !== null && task.deadline !== undefined && !task.completed));
    }

    // animation page
    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    useEffect(() => {
        if (user) {
            fetchEvents();
            fetchActivities();
            fetchTasks();
        }
    } , [ user ]);

    // Get today's events
    useEffect(() => {
        if (events.length > 0) {
            const today = new Date(); // TODO: TIME MACHINE DATE  
            const formattedToday = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
        
            const todayFilteredEvents = events.filter(ev => {
                const eventDate = new Date(ev.startDate).toISOString().split('T')[0]; // "YYYY-MM-DD"
                return eventDate === formattedToday;
            });
        
            setTodayEvents(todayFilteredEvents);
        }
    }, [events]);


const getUpcomingItems = (items, dateKey, setItems) => {
    if (items.length === 0) return;

    const today = new Date(); // TIME MACHINE DATE
    today.setHours(0, 0, 0, 0); // Compare only the days

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7); // Limit to 7 days from today

    const upcoming = items.filter(item => {
        const itemDate = new Date(item[dateKey]);
        return itemDate >= today && itemDate <= nextWeek;
    });

    const overdue = items.filter(item => {
        const itemDate = new Date(item[dateKey]);
        return itemDate < today; // Overdue items
    });

    // Order items by deadline
    upcoming.sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));
    overdue.sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));

    setItems([...overdue, ...upcoming]);
};

// Get upcoming week's activities and tasks
useEffect(() => {
    getUpcomingItems(activities, 'deadline', setTodayActivities);
}, [activities]);

useEffect(() => {
    getUpcomingItems(tasks, 'deadline', setTodayTasks);
}, [tasks]);

    // Check if there is an event, an activity or a task on the date
    const getEventOrActivityOnDate = (date, items, dateKey) => {
        const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        return items.find(item => {
            const itemDate = new Date(item[dateKey]).toLocaleDateString('en-CA');
            return itemDate === formattedDate;
        });
    };

    // Adding a dot to the date if there is an event, project event, activity or a task on that date
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const eventFound = getEventOrActivityOnDate(date, events, 'startDate');
            const activityFound = getEventOrActivityOnDate(date, activities, 'deadline');
            const taskFound = getEventOrActivityOnDate(date, tasks, 'deadline');

            return (
                <>
                    {eventFound && (
                        <span className={`event-indicator ${eventFound.isInProject ? 'event-dot-orange' : 'event-dot-blue'}`}></span>
                    )}
                    {activityFound && <span className="event-indicator event-dot-aqua"></span>}
                    {taskFound && <span className="event-indicator event-dot-lightgreen"></span>}
                </>
            );
        }
    };

    const getEventBorderClass = (event) => {
        if (event.isInProject) return "event-border-orange";
        return "event-border-blue";
    };

    const renderCalendar = () => {
        switch (viewType) {
            case "calendar":
                return <Calendar tileContent={tileContent} />;
            case "events":
                return (
                    <div className="scrollable-list EventShow">
                        {todayEvents.length > 0 ? (
                            todayEvents.map((event) => {
                                const startDate = new Date(event.startDate);
                                const endDate = new Date(event.endDate);
                                const formattedStartDate = startDate.toLocaleString();
                                const formattedEndDate = endDate.toLocaleString();
    
                                return (
                                    <div key={event._id} className={`event-card ${getEventBorderClass(event)}`}>
                                        <b>{event.title}</b>
                                        <p>{formattedStartDate} - {formattedEndDate}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="div-postit">
                                 <h2>No events today!</h2>
                            </div>
                        )}
                    </div>
                );
            case "activities":
                return (
                    <div className="scrollable-list ActivityShow">
                        {todayActivities.length > 0 ? (
                            todayActivities.map((activity) => {
                                const activityDate = new Date(activity.deadline);
                                const isOverdue = activityDate < new Date().setHours(0, 0, 0, 0); // check if overdue
                                return (
                                    <div key={activity._id} className={`event-card ${isOverdue ? "event-border-red" : "event-border-aqua"}`}>
                                        <b>{activity.title}</b>
                                        <p>Due: {activityDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="div-postit">
                                <h2>No activities deadlines this week!</h2>
                            </div>
                        )}
                    </div>
                );
            case "tasks":
                return (
                    <div className="scrollable-list TaskShow">
                        {todayTasks.length > 0 ? (
                            todayTasks.map((task) => {
                                const taskDate = new Date(task.deadline);
                                const isOverdue = taskDate < new Date().setHours(0, 0, 0, 0); // check if overdue
                                return (
                                    <div key={task._id} className={`event-card ${isOverdue ? "event-border-red" : "event-border-lightgreen"}`}>
                                        <b>{task.title}</b>
                                        <p>Due: {taskDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="div-postit">
                                <h2>No tasks deadlines this week!</h2>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (

        <div className="inCard">
            {renderCalendar()}
            <div className="divBtn">
                <Link to="/calendar" onClick={handleLinkClick('/calendar')}>
                    <button className="btn btn-main blue" >Manage Calendar</button>
                </Link>
            </div>
        </div>
    );
    
};

export default PreviewCalendar;
