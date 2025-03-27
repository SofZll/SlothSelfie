import React, { useState, useEffect, useContext } from 'react';
import { useSpring, animated } from 'react-spring';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import { CustomizationContext } from '../contexts/PreviewContext';

//TODO: modifica gli import
import PreviewPomodoro from '../previewPomodoro';
import PreviewNote from '../previewNote';
import PreviewCalendar from '../previewCalendar';
import PreviewProjects from '../previewProjects';


const CardCarosel = ({ title, settingKey }) => {
    const { customizations } = useContext(CustomizationContext);
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
        showCalendar: "Calendar View",
        showEventsList: "Events List",
        showActivitiesList: "Activities List",
        listOfNotes: "Notes List",
        lastNote: "Last Note",
        listOfPomodoros: "Pomodoros",
        lastPomodoro: "Last Pomodoro",
        listOfProjects: "Projects",
        recentProjectsDeadlines: "Upcoming Deadlines"
    };

    //Get the personalized title
    const currentTitle = titleMap[customizations[settingKey]] || title;

    console.log("Rendering CardCarosel - Title:", title, "Setting Key:", settingKey, "Customization Value:", customizations[settingKey]);
    
    return (
        <animated.div
            className='card d-flex flex-column justify-content-evenly align-items-center'
            style={props3}
            onMouseEnter={() => setShown(true)}
            onMouseLeave={() => setShown(false)}
        >   
            <h2>{title}</h2>
            <h2>{currentTitle}</h2>
            {/*
            {customizations[settingKey] === 'showCalendar' && <PreviewCalendar />}
            {customizations[settingKey] === 'listOfNotes' && <PreviewNote />}
            {customizations[settingKey] === 'listOfPomodoros' && <PreviewPomodoro />}
            {customizations[settingKey] === 'listOfProjects' && <PreviewProjects />}
            */}
            {/*
            {caseShow == 1 && <PreviewCalendar />}
            {caseShow == 2 && <PreviewNote />}
            {caseShow == 3 && <PreviewPomodoro />}
            {caseShow == 4 && <PreviewProjects />}
            */}
        </animated.div>
    );
}
export default CardCarosel;