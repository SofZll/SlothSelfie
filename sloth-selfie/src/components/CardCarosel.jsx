import React, { useState, useEffect, useContext } from 'react';
import { useSpring, animated } from 'react-spring';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import { CustomizationContext } from '../contexts/PreviewContext';
import {UserContext} from '../contexts/UserContext';

import PreviewPomodoro from '../previewPomodoro';
import PreviewNote from '../previewNote';
import PreviewCalendar from '../previewCalendar';
import PreviewProjects from '../previewProjects';


const CardCarosel = ({ title, settingKey }) => {
    const { customizations } = useContext(CustomizationContext);
    const { user } = useContext(UserContext);
    console.log("CardCarosel state:", customizations);
    const [show, setShown] = useState(false);

    const props3 = useSpring({
        transform: show ? 'scale(1.03)' : 'scale(1)',
        boxShadow: show
        ? '0 20px 25px rgb(0 0 0 / 25%)'
        : '0 2px 10px rgb(0 0 0 / 8%)'
    });

    useEffect(() => {
        console.log("Customization state changed:", customizations);
    }, [customizations]);

     //Map the setting key to the personalized title
     const titleMap = {
        showEventsList: "Today's Events List",
        showActivitiesList: "This week's Activities List",
        listOfNotes: "Notes List",
        lastNote: "Most recent Note",
        quickStart: "Quick Start",
        listOfPomodoros: "Pomodoros List",
        lastPomodoro: "Last Pomodoro",
        listOfProjects: "Projects List",
        recentProjectsDeadlines: "Upcoming Deadlines"
    };

    //Get the personalized title
    const currentTitle = titleMap[customizations[settingKey]] || title;

    //Function to render the content based on the setting key
    const renderContent = () => {
        switch (customizations[settingKey]) {
            case 'showCalendar':
                return <PreviewCalendar viewType="calendar" userLogged={user} />;
            case 'showEventsList':
                return <PreviewCalendar viewType="events" userLogged={user} />;
            case 'showActivitiesList':
                return <PreviewCalendar viewType="activities" userLogged={user} />;
            case 'listOfNotes':
                return <PreviewNote viewType="list" userLogged={user} />;
            case 'lastNote':
                return <PreviewNote viewType="latest" userLogged={user} />;
            case 'quickStart':
                return <PreviewPomodoro viewType="quickStart" userLogged={user} />;
            case 'listOfPomodoros':
                return <PreviewPomodoro viewType="list" userLogged={user} />;
            case 'lastPomodoro':
                return <PreviewPomodoro viewType="latest" userLogged={user} />;
            case 'listOfProjects':
                return <PreviewProjects viewType="list" userLogged={user}/>;
            case 'recentProjectsDeadlines':
                return <PreviewProjects viewType="recentDeadlines" userLogged={user}/>;
            default:
                return null;
        }
    };

        // Rendering the legend when in 'calendar' view
        const renderLegend = () => (
            <div className="legend">
                <div className="legend-item">
                    <span className="event-dot-blue"></span>
                    <span>Event</span>
                </div>
                <div className="legend-item">
                    <span className="event-dot-orange"></span>
                    <span>Project Event</span>
                </div>
                <div className="legend-item">
                    <span className="event-dot-aqua"></span>
                    <span>Activity</span>
                </div>
            </div>
        );
    
    return (
        <animated.div
            className='card d-flex flex-column justify-content-evenly align-items-center'
            style={props3}
            onMouseEnter={() => setShown(true)}
            onMouseLeave={() => setShown(false)}
        >   
            <h2>{title}</h2>
            {customizations[settingKey] === 'showCalendar' ? (
                    renderLegend()
            ) : (
                <>
                    <p>{currentTitle}</p>
                </>
            )}
            
            {/* Render the content */}
            {renderContent()}
        </animated.div>
    );
}
export default CardCarosel;