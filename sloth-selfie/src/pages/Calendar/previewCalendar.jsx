import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';

import '../../styles/Previews.css';
import '../../styles/App.css';

import { AuthContext } from '../../contexts/AuthContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';

import { apiService } from '../../services/apiService';


const PreviewCalendar = ({ viewType }) => {
    const { activities, setActivities, events, setEvents } = useCalendar();
    const { user } = useContext(AuthContext);
    const { getVirtualNow } = useContext(TimeMachineContext);
    const now = new Date(getVirtualNow());

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
            const today = new Date(now);
            const formattedToday = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        
            const todayFilteredEvents = events.filter(ev => {
                const eventDate = new Date(ev.startDate).toISOString().split('T')[0]; // 'YYYY-MM-DD'
                return eventDate === formattedToday;
            });
        
            setTodayEvents(todayFilteredEvents);
        }
    }, [events]);


const getUpcomingItems = (items, dateKey, setItems) => {
    if (items.length === 0) return;

    const today = new Date(now);
    today.setHours(0, 0, 0, 0); // Set time to midnight to compare only the date

    const nextWeek = new Date(today);
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
                    {activityFound && <span className='event-indicator event-dot-aqua'></span>}
                    {taskFound && <span className='event-indicator event-dot-lightgreen'></span>}
                </>
            );
        }
    };

    const tileClassName = ({ date }) => {
        const isVirtualNow = date.toDateString() === now.toDateString();
        if (isVirtualNow) {
          return 'highlight-today';
        }
        return '';
    };

    const getEventBorderClass = (event) => {
        if (event.isInProject) return 'event-border-orange';
        return 'event-border-blue';
    };

    const renderCalendar = () => {
        switch (viewType) {
            case 'calendar':
                return <Calendar value={new Date(now)} tileContent={tileContent} tileClassName={tileClassName} />;
            case 'events':
                return (
                    <div className='scrollable-list EventShow'>
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
                            <div className='div-postit'>
                                 <h4>No events today!</h4>
                            </div>
                        )}
                    </div>
                );
            case 'activities':
                return (
                    <div className='scrollable-list ActivityShow'>
                        {todayActivities.length > 0 ? (
                            todayActivities.map((activity) => {
                                const tmpNow = new Date(now);
                                const activityDate = new Date(activity.deadline);
                                const isOverdue = activityDate < tmpNow.setHours(0, 0, 0, 0); // check if overdue
                                return (
                                    <div key={activity._id} className={`event-card ${isOverdue ? 'event-border-red' : 'event-border-aqua'}`}>
                                        <b>{activity.title}</b>
                                        <p>Due: {activityDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className='div-postit'>
                                <h4>No activities deadlines this week!</h4>
                            </div>
                        )}
                    </div>
                );
            case 'tasks':
                return (
                    <div className='scrollable-list TaskShow'>
                        {todayTasks.length > 0 ? (
                            todayTasks.map((task) => {
                                const tmpNow = new Date(now);
                                const taskDate = new Date(task.deadline);
                                const isOverdue = taskDate < tmpNow.setHours(0, 0, 0, 0); // check if overdue
                                return (
                                    <div key={task._id} className={`event-card ${isOverdue ? 'event-border-red' : 'event-border-lightgreen'}`}>
                                        <b>{task.title}</b>
                                        <p>Due: {taskDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className='div-postit'>
                                <h4>No tasks deadlines this week!</h4>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {renderCalendar()}
            <div className='divBtn'>
                <Link to='/calendar' onClick={handleLinkClick('/calendar')}>
                    <button type='button' aria-label='manageCalendar' className='button-clean blue' >Manage Calendar</button>
                </Link>
            </div>
        </>
    );
    
};

export default PreviewCalendar;
