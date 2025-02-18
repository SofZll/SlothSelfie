import './css/CarouselHome.css';
import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import {Link, useNavigate} from 'react-router-dom';
import './css/App.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import PreviewPomodoro from './previewPomodoro';
import PreviewNote from './previewNote';
import PreviewCalendar from './previewCalendar';
import PreviewProjects from './previewProjects';

function Card({ title, caseShow }) {
    const [show, setShown] = useState(false);
    const navigate = useNavigate();

    // animation page
    const handleLinkClick = (path) => (event) => {
        event.preventDefault();
        document.body.classList.add('zoom-in');
        setTimeout(() => {
            navigate(path);
            document.body.classList.remove('zoom-in');
        }, 300);
    };

    const props3 = useSpring({
    transform: show ? "scale(1.03)" : "scale(1)",
    boxShadow: show
      ? "0 20px 25px rgb(0 0 0 / 25%)"
      : "0 2px 10px rgb(0 0 0 / 8%)"
    });

   
    let content;
    switch (caseShow) {
        case "1":
            content = <PreviewCalendar />;
            break;
            case "2":
                content = <PreviewNote />;
                break;
        case "3":
            content = <PreviewPomodoro />;
            break;
        case "4":
            content = <PreviewProjects/>;
            break;
        default:
            break;
    }

    return (
        <animated.div
        className="card"
        style={props3}
        onMouseEnter={() => setShown(true)}
        onMouseLeave={() => setShown(false)}
        >
        <h2>{title}</h2>
        {content}
        
        </animated.div>
    );
    }

    export default Card;
