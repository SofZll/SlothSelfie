import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchData } from "./CalendarUtils";
import Calendar from 'react-calendar';
import './styles/Previews.css';
import './styles/App.css';

//TODO: FARE IL FETCH DEI TASK NELLE VARIE VIEWS

const PreviewCalendar = ({ viewType, userLogged}) => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [event, setEvent] = useState([]);
    const [todayActivities, setTodayActivities] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    // animation page
    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    // Function to handle login/logout state
    useEffect(() => {
            if (userLogged) {
                setIsUserLoggedIn(true);
            } else {
                setIsUserLoggedIn(false);
                setActivities([]); // Reset activities if the user is logged out
                setEvent([]); // Reset events if the user is logged out
            }
        }, [userLogged]);

    useEffect(() => {
        fetchData('activities', setActivities);
        fetchData('events', setEvent);
    } , [ isUserLoggedIn ]);

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

    // Get upcoming week's activities
    useEffect(() => {
        if (activities.length > 0) {
            const today = new Date(); // TIME MACHINE DATE
            today.setHours(0, 0, 0, 0); //we compare days only
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7); //limit to 7 days from today

            const upcomingActivities = activities.filter(act => {
                const activityDate = new Date(act.deadline);
                return activityDate >= today && activityDate <= nextWeek;
            });

            const overdueActivities = activities.filter(act => {
                const activityDate = new Date(act.deadline);
                return activityDate < today; // overdue activities
            });

            // Order activities by deadline
            upcomingActivities.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            overdueActivities.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

            setTodayActivities([...overdueActivities, ...upcomingActivities]);
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
                        <span className={`event-indicator ${eventFound.isInProject ? 'event-dot-orange' : 'event-dot-blue'}`}></span>
                    )}
                    {activityFound && <span className="event-indicator event-dot-aqua"></span>}
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
                            todayEvents.map((event) => (
                                <div key={event._id} className={`event-card ${getEventBorderClass(event)}`}>
                                    <b>{event.title}</b>
                                    <p>Time: {event.time}</p>
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
                    <div className="scrollable-list ActivityShow">
                        {todayActivities.length > 0 ? (
                            todayActivities.map((activity) => {
                                const activityDate = new Date(activity.deadline);
                                const isOverdue = activityDate < new Date().setHours(0, 0, 0, 0); // Verifica se è scaduta
                                return (
                                    <div key={activity._id} className={`event-card ${isOverdue ? "event-border-red" : "event-border-aqua"}`}>
                                        <b>{activity.title}</b>
                                        <p>Due: {activityDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            })
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
