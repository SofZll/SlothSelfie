import React, { useState } from "react";
import { useSwipeable } from 'react-swipeable';
import { config } from "react-spring";
import Carousel from "react-spring-3d-carousel";
import { v4 as uuidv4 } from 'uuid';

import CardCarosel from '../components/CardCarosel';

//TODO: sistemare bottoni, import e icone 
import './css/CarouselHome.css';

import iconCalendar from './media/calendar.svg';
import iconNotes from './media/notes.svg';
import iconTomato from './media/tomato.svg';
import iconProjects from './media/projects.svg'; 
import iconArrowLeft from './media/arrowLeft.svg';
import iconArrowRight from './media/arrowRight.svg';
import iconSetting from './media/setting.svg';


const CarouselHome = (props) => {

  const [goToSlide, setGoToSlide] = useState(0);

  const cards = useState(
    {
      key: uuidv4(),
      content: ( <CardCarosel title='Calendar' caseShow='1' /> )
    },
    {
      key: uuidv4(),
      content: ( <CardCarosel title='Notes' caseShow='2' /> )
    },
    {
      key: uuidv4(),
      content: ( <CardCarosel title='Pomodoro' caseShow='3' /> )
    },
    {
      key: uuidv4(),
      content: ( <CardCarosel title='Projects' caseShow='4' /> )
    }
  );

  const handlePrev = () => {
    setGoToSlide((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setGoToSlide((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleGoToSlide = (index) => {
    setGoToSlide(index);
  };

  const handleSetUp = () => {
    props.setSetUp(!props.setUp);
  };


  return (
    <div className="carousel-div" {...handlers}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="divBtn divBtn4icon">
          <button onClick={() => handleGoToSlide(0)} className={`btn btn-preview  ${goToSlide === 0 ? 'active' : ''}`}>
            <img src={iconCalendar} alt="icon" className="icon-up"/>
          </button>
          <button onClick={() => handleGoToSlide(1)} className={`btn btn-preview  ${goToSlide === 1 ? 'active' : ''}`}>
            <img src={iconNotes} alt="icon" className="icon-up"/>
          </button>
          <button onClick={() => handleGoToSlide(2)} className={`btn btn-preview  ${goToSlide === 2 ? 'active' : ''}`}>
            <img src={iconTomato} alt="icon" className="icon-up"/>
          </button>
          <button onClick={() => handleGoToSlide(3)} className={`btn btn-preview  ${goToSlide === 3 ? 'active' : ''}`}>
            <img src={iconProjects} alt="icon" className="icon-up"/>
          </button>
      </div>

      <Carousel
        slides={cards}
        goToSlide={goToSlide}
        offsetRadius={2}
        showNavigation={false}
        animationConfig={config.gentle}
      />
      <div className="divBtn">
        <button onClick={handlePrev} className="btn btn-arrows">
          <img src={iconArrowLeft} alt="icon" className="icon"/>
        </button>
        <button onClick={handleSetUp} className="btn btn-arrows">
          <img src={iconSetting} alt="icon" className="icon"/>
        </button>
        <button onClick={handleNext} className="btn btn-arrows">
          <img src={iconArrowRight} alt="icon" className="icon"/>
        </button>
      </div>
        
    </div>
    
  );
}
export default CarouselHome;
