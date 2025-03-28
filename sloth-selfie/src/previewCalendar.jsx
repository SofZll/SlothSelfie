import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchData } from "./CalendarUtils";
import Calendar from 'react-calendar';
import './styles/Calendar.css';
import './styles/App.css';

const PreviewCalendar = ({ viewType }) => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [event, setEvent] = useState([]);
    const [todayActivities, setTodayActivities] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);

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
        fetchData('activities', setActivities);
        fetchData('events', setEvent);
    } , []);

    // Get today's events
    useEffect(() => {
        if (event.length > 0) {
            const today = new Date(); // TODO: TIME MACHINE DATE  
            const formattedToday = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
            const todayFilteredEvents = event.filter(ev => {
                const eventDate = new Date(ev.date).toISOString().split('T')[0]; // "YYYY-MM-DD"
                return eventDate === formattedToday;
            });
    
            setTodayEvents(todayFilteredEvents);
        }
    }, [event]);

    // Get today's activities
    useEffect(() => {
        if (activities.length > 0) {
            const today = new Date(); // TIME MACHINE DATE
            const formattedToday = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
            const todayFilteredActivities = activities.filter(act => {
                const activityDate = new Date(act.deadline).toISOString().split('T')[0]; // "YYYY-MM-DD"
                return activityDate === formattedToday;
            });
    
            setTodayActivities(todayFilteredActivities);
        }
    }, [activities]);

    // Check if there is an event or an activity on the date
    const getEventOrActivityOnDate = (date, items, dateKey) => {
        const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        return items.find(item => {
            const itemDate = new Date(item[dateKey]).toLocaleDateString('en-CA');
            return itemDate === formattedDate;
        });
    };

    // Adding a dot to the date if there is an event, project event, or an activity on that date
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const eventFound = getEventOrActivityOnDate(date, event, 'date');
            const activityFound = getEventOrActivityOnDate(date, activities, 'deadline');

            return (
                <>
                    {eventFound && (
                        <span className={`event-indicator ${eventFound.isInProject ? 'event-dot-aqua' : 'event-dot-blue'}`}></span>
                    )}
                    {activityFound && <span className="event-indicator event-dot-orange"></span>}
                </>
            );
        }
    };

    const getEventBorderClass = (event) => {
        if (event.isInProject) return "event-border-aqua";
        return "event-border-blue";
    };
    
    const getActivityBorderClass = () => "event-border-orange";

    const renderContent = () => {
        switch (viewType) {
            case "calendar":
                return <Calendar tileContent={tileContent} />;
            case "events":
                return (
                    <div className="scrollableCalendar-list EventShow">
                        {todayEvents.length > 0 ? (
                            todayEvents.map((event) => (
                                <div key={event._id} className={`event-card ${getEventBorderClass(event)}`}>
                                    <p>{event.title}</p>
                                    <p>{event.time}</p>
                                </div>
                            ))
                        ) : (
                            <div className="div-postit">
                                 <h2>No events today!</h2>
                            </div>
                        )}
                    </div>
                );
            case "activities":
                return (
                    <div className="scrollableCalendar-list ActivityShow">
                        {todayActivities.length > 0 ? (
                            todayActivities.map((activity) => (
                                <div key={activity._id} className={`event-card ${getActivityBorderClass()}`}>
                                    <p>{activity.title}</p>
                                </div>
                            ))
                        ) : (
                            <div className="div-postit">
                                <h2>No activities deadlines today!</h2>
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
            {renderContent()}
            <div className="divBtn">
                <Link to="/calendar" onClick={handleLinkClick('/calendar')}>
                    <button className="btn btn-main blue" >Manage Calendar</button>
                </Link>
            </div>
        </div>
    );
    
};

export default PreviewCalendar;
