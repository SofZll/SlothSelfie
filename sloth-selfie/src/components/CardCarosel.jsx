import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';

//TODO: modifica gli import
import PreviewPomodoro from '../previewPomodoro';
import PreviewNote from '../previewNote';
import PreviewCalendar from '../previewCalendar';
import PreviewProjects from '../previewProjects';



const CardCarosel = ({ title, caseShow }) => {

    const [show, setShown] = useState(false);

    const props3 = useSpring({
        transform: show ? 'scale(1.03)' : 'scale(1)',
        boxShadow: show
        ? '0 20px 25px rgb(0 0 0 / 25%)'
        : '0 2px 10px rgb(0 0 0 / 8%)'
    });

    return (
        <animated.div
            className='card d-flex flex-column justify-content-evenly align-items-center'
            style={props3}
            onMouseEnter={() => setShown(true)}
            onMouseLeave={() => setShown(false)}
        >
            <h2>{title}</h2>
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