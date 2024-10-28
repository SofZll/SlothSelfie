import React, { useState, useEffect } from 'react';
import "./css/App.css";
import "./css/Pomodoro.css";
import iconYellowTomato from './media/yellowTomato.svg';
import iconRedTomato from './media/redTomato.svg';
import { Link, useNavigate } from 'react-router-dom';
import { stringTime, tomatoPlay, passingTime } from './pomodoroUtils';
import { to } from 'react-spring';


const PreviewPomodoro = () => {
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
  });

  const [playTomato, setPlayTomato] = useState(false);
  const [stringPrintTime, setStringPrintTime] = useState(stringTime(dataPomodoro.timeLeft));

  // animation page
  const handleLinkClick = (path) => (event) => {
    event.preventDefault();
    document.body.classList.add('zoom-in');
    setTimeout(() => {
        navigate(path);
        document.body.classList.remove('zoom-in');
    }, 300);
  };


  useEffect(() => { 
    if (playTomato && dataPomodoro.cyclesLeft > 0) {
        const timer = setTimeout(() => {
            passingTime(dataPomodoro, setDataPomodoro, setPlayTomato, setStringPrintTime);
        }, 1000);

        return () => clearTimeout(timer);
    }
}, [dataPomodoro, playTomato]);

  return (
    <div className='container'>
      <p>Start your study session!</p><br/>
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
          <button  onClick={() => tomatoPlay (setDataPomodoro, dataPomodoro, setPlayTomato, playTomato, setStringPrintTime)} className="btn">{playTomato ? 
            (dataPomodoro.done ? "Reset" : "Stop") : (dataPomodoro.notStartedYet ? "Quick start" : "Play")}
          </button>
        <Link to="/pomodoro" onClick={() => handleLinkClick('/pomodoro')}>
          <button className="btn">Start</button>
        </Link>
      </div>
    </div>
  );
};

export default PreviewPomodoro;