import React, { useState, useEffect } from 'react';
import "./css/App.css";
import "./css/Pomodoro.css";
import iconYellowTomato from './media/yellowTomato.svg';
import iconRedTomato from './media/redTomato.svg';
import { Link } from 'react-router-dom';


const PreviewPomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25*60);
  const [isStudioTime, setIsStudioTime] = useState(true);
  const [playTomato, setPlayTomato] = useState(false);
  const [stringPrintTime, setStringPrintTime] = useState('25:00');
  

  useEffect(() => {
    if (playTomato) {
      if (timeLeft === 0) {
      
        if (isStudioTime) {
          setTimeLeft(5*60);
        } else {
          setTimeLeft(25*60);
        }
        setIsStudioTime(!isStudioTime);
      } else {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);

        setStringPrintTime(stringTime(timeLeft));

        return () => clearTimeout(timer);
      };
    } else {
      return;
    }
    
  }, [timeLeft, isStudioTime, playTomato]);

  const stringTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }

  const tomatoPlay = () => {
    setPlayTomato(prevPlayTomato => !prevPlayTomato);
  }

  return (
    <div className='container'>
      <p>Start your study session!</p><br/>
      <div className={isStudioTime ? 'containerRed' : 'containerYellow'}>
        <img 
          src={isStudioTime ? iconRedTomato : iconYellowTomato} 
          alt='Tomato' 
          className='tomatoPrew' 
        />
        <h2 className={isStudioTime ? 'counterRed' : 'counterYellow'}>
          {stringPrintTime}
        </h2>
      </div>
      <div className="divBtn">
              <button  onClick={tomatoPlay} className="btn">{playTomato ? "Stop" : "Play"}</button>
          <Link to="/pomodoro">
              <button className="btn">Start</button>
          </Link>
      </div>
    </div>
  );
};

export default PreviewPomodoro;