import React, { useState, useEffect } from 'react';
import "./css/App.css";
import "./css/Pomodoro.css";
import iconYellowTomato from './media/yellowTomato.svg';
import iconRedTomato from './media/redTomato.svg';
import { Link, useNavigate } from 'react-router-dom';


const PreviewPomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(30*60);
  const [isStudioTime, setIsStudioTime] = useState(true);
  const [playTomato, setPlayTomato] = useState(false);
  const [stringPrintTime, setStringPrintTime] = useState('30:00');
  const [cicles, setCicles] = useState(5);
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

  useEffect(() => {
    if (playTomato && cicles > 0) {
      if (timeLeft === 0) {
      
        if (isStudioTime) {
          setTimeLeft(5*60);
        } else {
          setTimeLeft(30*60);
          setCicles(cicles - 1);
        }
        if (cicles === 0) {
          setTimeLeft(0);
          setPlayTomato(false);
        }
        setIsStudioTime(!isStudioTime);
        setStringPrintTime(stringTime(timeLeft));

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
    if (cicles === 0) {
      setTimeLeft(30*60);
      setCicles(5);
      setStringPrintTime(stringTime(timeLeft));
    }
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
            <button  onClick={tomatoPlay} className="btn">{playTomato ? (cicles === 0 ? "Reset" : "Stop") : "Play"}</button>
          <Link to="/pomodoro" onClick={handleLinkClick('/pomodoro')}>
            <button className="btn">Start</button>
          </Link>
        </div>
    </div>
  );
};

export default PreviewPomodoro;