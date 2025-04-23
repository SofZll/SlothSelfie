import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Previews.css';

import { apiService } from '../../services/apiService';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { AnimationPencil } from './AnimationPencil';
import { AuthContext } from '../../contexts/AuthContext';


const PreviewPomodoro = ({ viewType }) => {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);

  const [pomodoroList, setPomodoroList] = useState([]);
  const [allPomodoros, setAllPomodoros] = useState([]);

  const {
    pomodoro,
    play,
    setPlay,
    increasePomodoroTime,
    resetPomodoro,
    animation
  } = usePomodoro();

  useEffect(() => {
    let timer;
    if (play && !pomodoro.finished) {
      timer = setInterval(() => {
        increasePomodoroTime();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [play, pomodoro]);

  // animation page
  const handleLinkClick = (path) => (event) => {
    event.preventDefault();
    document.body.classList.add('zoom-in');
    setTimeout(() => {
        navigate(path);
        document.body.classList.remove('zoom-in');
    }, 300);
  };

  // Function to handle login/logout state
    useEffect(() => {
      if (user) {
          fetchPomodoroListToDo();
          fetchAllPomodoros();
      }
    }, [user]);

  // Function to fetch pomodoro ToDo list from the backend
  const fetchPomodoroListToDo = async () => {
    try {
        const response = await apiService('/pomodori/todo', 'GET', null, { credentials: 'include' });
        if (response.success) {
            setPomodoroList(response.pomodori); // Set the pomodoro list from the backend
        }
    } catch (error) {
        console.error('Error fetching pomodoro list:', error);
    }
  } 

  // Function to fetch all pomodoros from the backend
  const fetchAllPomodoros = async () => {
    try {
        const response = await apiService('/pomodori', 'GET', null, { credentials: 'include' });
        console.log('Response from backend:', response); // Log the response for debugging
        if (response.success) {
            setAllPomodoros(response.pomodori); // Set the pomodoro list from the backend
        }
    } catch (error) {
        console.error('Error fetching pomodoro list:', error);
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

// Render per QuickStart, Last Pomodoro, Pomodoros List
const renderPomodoroPreview = () => {
  switch (viewType) {
    case 'quickStart':
    return (
      <div className="containerPreview">

        <div className="timer-display">
          You still have {formatTime(pomodoro.timeLeft)} minutes {pomodoro.isStudyTime ? 'to study' : 'in your break'}
        </div>

        <div className="divBtn">
          <button
            onClick={() => {
              if (pomodoro.finished) resetPomodoro();
              else setPlay(!play);
            }}
            className="btn btn-main blue"
          >
            {play ? (pomodoro.finished ? "Reset timer" : "Stop timer") : (pomodoro.started ? "Resume" : "Quick start")}
          </button>
          <Link to="/pomodoro" onClick={() => handleLinkClick('/pomodoro')}>
            <button className="btn btn-main blue">Set Pomodoro</button>
          </Link>
        </div>

        <AnimationPencil
          isStudyTime={pomodoro.isStudyTime}
          timeLeft={pomodoro.timeLeft}
          animation={animation}
        />
      </div>
    );
      case 'list':
        // Verify if the pomodoroList has elements
        if (pomodoroList.length > 0) {
          return (
            <div className="containerPreview">
              <div className="scrollable-list">
                {pomodoroList.map((pomodoro, index) => (
                  <div key={index} className={`event-card event-border-yellow`} ><b>Pomodoro</b> cycles: {pomodoro.cycles} - studyTime: {pomodoro.studyTime} - breakTime: {pomodoro.breakTime}</div>
                ))}
              </div>
              <Link to="/pomodoro" onClick={() => handleLinkClick('/pomodoro')}>
                <button className="btn btn-main blue">Set Pomodoro</button>
              </Link>
            </div>
          );
        } else {
          return (
            <div className="scrollable-list">
              <div className="div-postit">
                <h2>No pomodoros yet!</h2>
              </div>
          </div>
          );
        }
        case 'latest':
          default:
          // Verify if the lastPomodoro is there
          if (allPomodoros.length > 0) {
            const lastPomodoro = allPomodoros[allPomodoros.length - 1];
            return (
              <div className="containerPreview">
                <div className={`event-card event-border-yellow`} ><b>Pomodoro</b> cycles: {lastPomodoro.cycles} - studyTime: {lastPomodoro.studyTime} - breakTime: {lastPomodoro.breakTime}</div>
                <Link to="/pomodoro" onClick={() => handleLinkClick('/pomodoro')}>
                  <button className="btn btn-main blue">Set Pomodoro</button>
                </Link>
              </div>
            );
          } else {
            return (
              <div className="scrollable-list">
              <div className="div-postit">
                <h2>No pomodoros yet!</h2>
              </div>
            </div>
            );
          }
  }
};

  // Render the Pomodoro preview based on the viewType prop
return <>{renderPomodoroPreview()}</>;

};

export default PreviewPomodoro;