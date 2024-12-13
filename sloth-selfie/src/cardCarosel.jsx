import './css/CarouselHome.css';
import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import {Link, useNavigate} from 'react-router-dom';
import Calendar from 'react-calendar';
import './css/App.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import PreviewPomodoro from './previewPomodoro';
import PreviewNote from './previewNote';
import { initialEvents } from './Calendar';
import { fetchData } from './CalendarUtils';

function Card({ title, caseShow }) {
    const [show, setShown] = useState(false);
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [event, setEvent] = useState([]);

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

    // Check if there is an event on the date
    const hasEventOnDate = (date) => {
        return event.some(event => event.date === date.toLocaleDateString('en-CA'));
    };

    // Check if there is an activity on the date
    const hasActivityOnDate = (date) => {
        return activities.some(activity => activity.deadline === date.toLocaleDateString('en-CA'));
    };

    // Adding a dot to the date if there is an event or an activity on that date
    const tileContent = ({ date, view }) => {
        if (view === 'month' && hasEventOnDate(date)) {
            return <span className="event-indicator" style={{ backgroundColor: '#2b59b6', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
        } else if (view === 'month' && hasActivityOnDate(date)) {
            return <span className="event-indicator" style={{ backgroundColor: '#f72585', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
        }
    };

    useEffect(() => {
        fetchData('activities', setActivities);
        fetchData('events', setEvent);
    } , []);

    

    let content;
    switch (caseShow) {
        case "1":
            content = (
                <div className='inCard'>
                    <Calendar  tileContent={tileContent}/>
                    <div className="divBtn">
                        <Link to="/calendar" onClick={handleLinkClick('/calendar')}>
                            <button className="btn btn-main" >Manage Calendar</button>
                        </Link>
                    </div>
                </div>
            );
            break;
            case "2":
                content = <PreviewNote />;
                break;
        case "3":
            content = <PreviewPomodoro />;
            break;
        case "4":
            content = (
                <div className='inCard'>
                    <p>Content for other stuff 3</p>
                    <button className="btn btn-main">Start</button>
                </div>
            );
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
