import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchData } from "./CalendarUtils";
import Calendar from 'react-calendar';
import './styles/Calendar.css';

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

    // Check if there is an event on the date
        const hasEventOnDate = (date) => {
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            return event.some(ev => {
                const eventDate = new Date(ev.date).toISOString().split('T')[0]; // format the date
                return eventDate === formattedDate;
            });
        };
    
        // Check if there is an activity on the date
        const hasActivityOnDate = (date) => {
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            return activities.some(activity => {
                const activityDate = new Date(activity.deadline).toISOString().split('T')[0]; // format the date
                return activityDate === formattedDate;
            });
        };
        
        //TODO: I PUNTINI SONO UN GIORNO AVANTI.. MAGARI CON TIMEMACHINE SI SISTEMA.. ?
        // Adding a dot to the date if there is an event or an activity on that date
        const tileContent = ({ date, view }) => {
            if (view === 'month' && hasEventOnDate(date)) {
                return <span className="event-indicator" style={{ backgroundColor: '#2b59b6', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
            } else if (view === 'month' && hasActivityOnDate(date)) {
                return <span className="event-indicator" style={{ backgroundColor: '#ffA500', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
            }
        };
    
        useEffect(() => {
            fetchData('activities', setActivities);
            fetchData('events', setEvent);
        } , []);

        // Get today's events
        useEffect(() => {
            if (event.length > 0) {
                const today = new Date(); // TIME MACHINE DATE  
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

        const renderContent = () => {
            switch (viewType) {
                case "calendar":
                    return <Calendar tileContent={tileContent} />;
                case "events":
                    return (
                        <div className="scrollableCalendar-list EventShow">
                            {todayEvents.length > 0 ? (
                                todayEvents.map((event) => (
                                    <div key={event._id} className="event-card">
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
                                    <div key={activity._id} className="event-card">
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
                        <button className="btn btn-main" >Manage Calendar</button>
                    </Link>
                </div>
            </div>
        );
    
};

export default PreviewCalendar;
