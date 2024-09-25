import './css/CarouselHome.css';
import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import Button from "./Button";
import Calendar from 'react-calendar';
import animatedHourglass from './media/Hourglass.gif';
import noteImage from './media/note.png';
import './css/App.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import {Link} from 'react-router-dom';
import previewPomodoro from './previewPomodoro';
import { initialEvents } from './Events';

function Card({ title, caseShow }) {
    const [show, setShown] = useState(false);
    let playTomato = false;

    const props3 = useSpring({
    transform: show ? "scale(1.03)" : "scale(1)",
    boxShadow: show
      ? "0 20px 25px rgb(0 0 0 / 25%)"
      : "0 2px 10px rgb(0 0 0 / 8%)"
    });

     const hasEventOnDate = (date) => {
        return initialEvents.some(event => event.date === date.toLocaleDateString('en-CA'));
    };

  // Personalizing the tile content
    const tileContent = ({ date, view }) => {
        if (view === 'month' && hasEventOnDate(date)) {
            return <span className="event-indicator" style={{ backgroundColor: 'red', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }}></span>;
        }
    };

    const tomatoTime = () => {
        const tomatoButton = document.getElementById('tomatoPlay');
        
        if (!tomatoButton) {
            console.error('Elemento con ID tomatoPlay non trovato');
            return;
        }
    
        if (playTomato) {
            tomatoButton.innerHTML = "Play";
            playTomato = false;
        } else {
            tomatoButton.innerHTML = "Stop";
            playTomato = true;
        }
    }
    

    let content;
    let btn_card;
    switch (caseShow) {
        case "1":
            content = <Calendar 
                        tileContent={tileContent} />;
            break;
        case "2":
            content = (<div className="notes-section">
                <p>Add a note here!</p>
                <img src={noteImage} alt="Note illustration" className="note-image" />
                <br />
                </div>);
            break;
        case "3":
            content = (<div className="pomodoro-timer">
                <img src={animatedHourglass} alt="Hourglass" className="hourglass"/><br/>
                <p>Start your study session!</p><br/>
                </div>);
            break;
        case "4":
            content = <p>Content for other stuff 3</p>;
            break;
    }

    switch (caseShow) {
        case "1":
            btn_card = btn_card = (
                <div className="divBtn">
                    <Link to="/events">
                        <button className="btn">Manage Events</button>
                    </Link>
                    <Link to="/activities">
                        <button className="btn">Manage Activities</button>
                    </Link>
                </div>);
            break;
        case "2":
            btn_card = (
                <div className="divBtn">
                    <Link to="/notes">
                        <button className="btn">Add</button>
                    </Link>
                </div>
            );
            break;
        case "3":
            btn_card = (
                <div className="divBtn">
                    <button id='tomatoPlay' className="btn" onClick={tomatoTime}>Play</button>
                    <Link to="/pomodoro">
                        <button className="btn">Start</button>
                    </Link>
                </div>
            );
            break;
        case "4":
            btn_card = <button className="btn">Start</button>;
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
        {btn_card}
        
        </animated.div>
    );
    }

    export default Card;
