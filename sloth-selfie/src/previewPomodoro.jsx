import React, { useState, useEffect } from 'react';
import "./css/App.css";
import "./css/Pomodoro.css";
import iconYellowTomato from './assets/icons/yellowTomato.svg';
import iconRedTomato from './assets/icons/redTomato.svg';
import { Link, useNavigate } from 'react-router-dom';
import { stringTime, tomatoPlay, passingTime } from './pomodoroUtils';
import './styles/Previews.css';
//import './css/Pomodoro.css'; old css pomodoro

//TODO COLLEGA IL BACKEND

const PreviewPomodoro = ({ viewType, userLogged }) => {
  const navigate = useNavigate();
  const [soundAudio, setSoundAudio] = useState('./media/meow.mp3');

  const [dataPomodoro, setDataPomodoro] = useState({
    timeLeft: 30*60,
    cyclesLeft: 5,
    cycles: 5,
    isStudioTime: true,
    studioTime: 30*60,
    breakTime: 5*60,
    notStartedYet: true,
    done: false,
    studioTimeTotal: 0,
  });

  const [playTomato, setPlayTomato] = useState(false);
  const [stringPrintTime, setStringPrintTime] = useState(stringTime(dataPomodoro.timeLeft));
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  //placeholder for the list of pomodoros
  // This should be replaced with actual data fetching logic
  const pomodoroList = [
    { id: 1, name: 'Pomodoro 1', time: '00:25:00' },
    { id: 2, name: 'Pomodoro 2', time: '00:30:00' },
    { id: 3, name: 'Pomodoro 3', time: '00:20:00' },
    { id: 4, name: 'Pomodoro 4', time: '00:15:00' },
  ];

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
            if (userLogged) {
                setIsUserLoggedIn(true);
            } else {
                setIsUserLoggedIn(false);
                //placeholder for fetching backend data
                setDataPomodoro({
                    timeLeft: 30*60,
                    cyclesLeft: 5,
                    cycles: 5,
                    isStudioTime: true,
                    studioTime: 30*60,
                    breakTime: 5*60,
                    notStartedYet: true,
                    done: false,
                    studioTimeTotal: 0,
                }); // Reset data if the user is logged out
            }
        }, [userLogged]);

  useEffect(() => { 
    if (playTomato && dataPomodoro.cyclesLeft > 0) {
        const timer = setTimeout(() => {
            passingTime(dataPomodoro, setDataPomodoro, setPlayTomato, setStringPrintTime);
        }, 1000);

        return () => clearTimeout(timer);
    }
  }, [dataPomodoro, playTomato]);

  useEffect(() => {
    setStringPrintTime(stringTime(dataPomodoro.timeLeft));
  }, [dataPomodoro.timeLeft]);

  // Render per QuickStart, Last Pomodoro, Pomodoros List
const renderPomodoroPreview = () => {
  switch (viewType) {
    case 'quickStart':
      return (
        <div className="containerPreview">
          <p>Start your study session!</p><br />
          <div className={dataPomodoro.isStudioTime ? 'containerRed' : 'containerYellow'}>
            <img
              src={dataPomodoro.isStudioTime ? iconRedTomato : iconYellowTomato}
              alt='Tomato'
              className='tomatoPrew'
            />
            <h2 className={dataPomodoro.isStudioTime ? 'counterRed' : 'counterYellow'}>
              {stringPrintTime}
            </h2>
          </div>
          <div className="divBtn">
            <button onClick={() => tomatoPlay(setDataPomodoro, dataPomodoro, setPlayTomato, playTomato, setStringPrintTime)} className="btn btn-main blue">
              {playTomato ? (dataPomodoro.done ? "Reset timer" : "Stop timer") : (dataPomodoro.notStartedYet ? "Quick start" : "Play timer")}
            </button>
            <Link to="/pomodoro" onClick={() => handleLinkClick('/pomodoro')}>
              <button className="btn btn-main blue">Set Pomodoro</button>
            </Link>
          </div>
        </div>
      );
      case 'list':
        // Verify if the pomodoroList has elements
        if (pomodoroList.length > 0) {
          return (
            <div className="containerPreview">
              <p>Next Pomodoro sessions:</p><br />
              <div className="scrollable-list">
                {pomodoroList.map((pomodoro, index) => (
                  <div key={index} className={`event-card event-border-yellow`} ><b>Pomodoro</b> {index + 1} - {pomodoro.time}</div>
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
          <div className="scrollable-list"></div>
          // Verify if the lastPomodoro is there
          if (pomodoroList.length > 0) {
            const lastPomodoro = pomodoroList[pomodoroList.length - 1];
            return (
              <div className="containerPreview">
                <p>Last Pomodoro session:</p><br />
                <div className="containerYellow">
                  <img src={iconYellowTomato} alt="Tomato" className="tomatoPrew" />
                  <h2 className="counterYellow">{lastPomodoro.time} </h2> {/* Shows the time of the last pomodoro */}
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
  }
};

  // Render the Pomodoro preview based on the viewType prop
return <>{renderPomodoroPreview()}</>;

};

export default PreviewPomodoro;