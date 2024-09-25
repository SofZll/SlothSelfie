import React, { useState, useEffect } from 'react';
import "./css/App.css";

const PreviewPomodoro = ({ start }) => {
  const [timeLeft, setTimeLeft] = useState(start);
  let playTomato = false;
  

  const handelCountDown = (time) => {
    setTimeLeft(time);
  };

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // Cleanup del timer quando il componente si smonta o il tempo cambia
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div className='container'>
      <div className='circle'>
        <h1 className='count'>{timeLeft}</h1>
      </div>
    </div>
  );
};