import './css/CarouselHome.css';
import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import {Link, useNavigate} from 'react-router-dom';
import Calendar from 'react-calendar';
import './css/App.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import PreviewPomodoro from './previewPomodoro';
import PreviewNote from './previewNote';
import { initialEvents } from './Events2';
import { initialActivities } from './Activities';

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

    const hasEventOnDate = (date) => {
        return initialEvents.some(event => event.date === date.toLocaleDateString('en-CA'));
    };

    const hasActivityOnDate = (date) => {
        return initialActivities.some(activity => activity.deadline === date.toLocaleDateString('en-CA'));
    };

  // Personalizing the tile content
    const tileContent = ({ date, view }) => {
        if (view === 'month' && hasEventOnDate(date)) {
            return <span className="event-indicator" style={{ backgroundColor: 'blue', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
        }
        if (view === 'month' && hasActivityOnDate(date)) {
            return <span className="event-indicator" style={{ backgroundColor: '#f72585', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
        }
    };

    

    let content;
    switch (caseShow) {
        case "1":
            content = (
                <div className='inCard'>
                    <Calendar  tileContent={tileContent}/>
                    <div className="divBtn">
                        <Link to="/events" onClick={handleLinkClick('/events')}>
                        <button className="btn" style={{ color: 'blue' }}>Manage Events</button>
                        </Link>
                        <Link to="/activities" onClick={handleLinkClick('/activities')}>
                            <button className="btn" style={{ color: '#f72585' }}>Manage Activities</button>
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
                    <button className="btn">Start</button>
                </div>
            );
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
