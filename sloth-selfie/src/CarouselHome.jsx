import Carousel from "react-spring-3d-carousel";
import './css/CarouselHome.css';
import { useState, useEffect } from "react";
import { config } from "react-spring";
import { useSwipeable } from 'react-swipeable';
import iconCalendar from './media/calendar.svg';
import iconNotes from './media/notes.svg';
import iconTomato from './media/tomato.svg';
import iconProjects from './media/projects.svg'; 
import iconArrowLeft from './media/arrowLeft.svg';
import iconArrowRight from './media/arrowRight.svg';
import iconSetting from './media/setting.svg';

export default function CarroussSel(props) {

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const table = props.cards.map((element, index) => {
    return { ...element, onClick: () => setGoToSlide(index) };
  });

  const [offsetRadius, setOffsetRadius] = useState(2);
  const [showArrows, setShowArrows] = useState(false);
  const [goToSlide, setGoToSlide] = useState(0);
  const [cards] = useState(table);

  useEffect(() => {
    setOffsetRadius(props.offset);
    setShowArrows(props.showArrows);
  }, [props.offset, props.showArrows]);

  const handlePrev = () => {
    setGoToSlide((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setGoToSlide((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

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
        offsetRadius={offsetRadius}
        showNavigation={showArrows}
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
