import './css/CarouselHome.css';
import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import { marked } from 'marked';
import Calendar from 'react-calendar';
import noteImage from './media/note.png';
import './css/App.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import {Link, useNavigate} from 'react-router-dom';
import PreviewPomodoro from './previewPomodoro';
import { initialEvents } from './Events';
import { initialActivities } from './Activities';
import { initialNotes } from './Notes';

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
                content = (
                    <div className="inCard">
                        <div className="notes-section">
                            <h2>Your Notes:</h2>
                            <div className="scrollable-list">
                                {initialNotes.length > 0 ? (
                                    initialNotes.map((note, index) => (
                                        <div key={index} className="card mb-3"> {/* Bootstrap card */}
                                            <div className="card-body">
                                                <h5 className="card-title">{note.title}</h5>
                                                <small>Author: {note.author}</small><br />
                                                <small>
                                                    Access: {note.access.type === 'public' 
                                                        ? 'Public' 
                                                        : note.access.type === 'private' 
                                                        ? 'Private' 
                                                        : `Shared with: ${note.access.allowedUsers.join(', ')}`}
                                                </small>
                                                {/* Render note content or todo list */}
                                                {note.isTodo ? (
                                                    <p className="card-text">
                                                    <ul>
                                                    {/* Render the tasks if the note contains a todo list */}
                                                    {note.tasks && note.tasks.length > 0 ? (
                                                        note.tasks.map((task, taskIndex) => (
                                                        <li key={taskIndex}>
                                                            <input
                                                            type="checkbox"
                                                            checked={task.completed}
                                                            readOnly
                                                            />
                                                            {task.text}
                                                        </li>
                                                        ))
                                                    ) : (
                                                        <p>No tasks available</p>
                                                    )}
                                                    </ul>
                                                    </p>
                                                ) : (
                                                    <p className="card-text">
                                                        {/* Limiting note content to 200 characters, showing markdown */}
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: note.content.length > 200 
                                                                    ? marked(note.content.substring(0, 200) + "...")
                                                                    : marked(note.content)
                                                            }}
                                                        />
                                                    </p>
                                                )}
                                                {/* Using d-flex and justify-content-between for proper alignment */}
                                                <div className="d-flex justify-content-between mt-3">
                                                    <small className="text-muted">Category: {note.category}</small><br />
                                                    <small className="text-muted">Created on: {new Date(note.createDate).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>
                                        <h2>No notes yet!</h2>
                                        <img src={noteImage} alt="Note illustration" className="note-image" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="divBtn">
                            <Link to="/notes" onClick={handleLinkClick('/notes')}>
                                <button className="btn btn-primary">Manage Notes</button> {/* Bootstrap button */}
                            </Link>
                        </div>
                    </div>
                );
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
