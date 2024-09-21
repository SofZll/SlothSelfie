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

function Card({ title, caseShow }) {
    const [show, setShown] = useState(false);

    const props3 = useSpring({
    transform: show ? "scale(1.03)" : "scale(1)",
    boxShadow: show
      ? "0 20px 25px rgb(0 0 0 / 25%)"
      : "0 2px 10px rgb(0 0 0 / 8%)"
    });

    let content;
    let btn_card;
    switch (caseShow) {
        case "1":
            content = <Calendar />;
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
