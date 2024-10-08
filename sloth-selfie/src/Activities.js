import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './css/App.css';
import './css/Activities.css';

function ActivitiesFunction(){
    // Dummy data for activities
    const [activities, setActivities] = useState([
        { id: 1, title: 'Study Math', deadline: '2024-10-12' },
        { id: 2, title: 'Write Report', deadline: '2024-10-15' }
    ]);

    // change style page onload document
    useEffect(() => {
        const header = document.querySelector('.App-header');
        const h1 = document.querySelector('h1');
        if (header) header.classList.add('light-background');
        else console.error('Header not found');
        if (h1) h1.classList.add('dark-h1');

        document.body.classList.add('light-background');

        return () => {
        if (header) header.classList.remove('light-background');
        if (h1) h1.classList.remove('dark-h1');
        document.body.classList.remove('light-background');
        };
    }, []);
    

    return (
        <div className="activities-page">
            <h2>Activities</h2>
            <h2>Your Activities:</h2>
            <div className="activities-layout">
                <div className="calendar-container">
                    <BigCalendar
                        localizer={momentLocalizer(moment)}
                        events={[]}
                        startAccessor="start"
                        endAccessor="end"
                        titleAccessor="title"
                        style={{ height: 500 }}
                    />
                </div>
                <div className="activities-list">
                    <h2>List of your Activities:</h2>
                    <div className="activities-container">
                        {activities.map(activity => (
                            <div className="activity-card" key={activity.id}>
                                <h2>{activity.title}</h2>
                                <p>Due: {activity.deadline}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivitiesFunction;