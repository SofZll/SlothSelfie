import Carousel from "react-spring-3d-carousel";
import './css/CarouselHome.css';
import { useState, useEffect } from "react";
import { config } from "react-spring";
import { useSwipeable } from 'react-swipeable';
import TimeMachine from "./TimeMachine";
import iconCalendar from './media/calendar.svg';
import iconNotes from './media/notes.svg';
import iconTomato from './media/tomato.svg';
import iconProjects from './media/projects.svg'; 
import iconArrowLeft from './media/arrowLeft.svg';
import iconArrowRight from './media/arrowRight.svg';
import iconTimeMachine from './media/time-machine.svg';

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
  const [goToSlide, setGoToSlide] = useState(null);
  const [cards] = useState(table);

  // State for time machine
  const [machineOpen, setMachineOpen] = useState(false);

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

  // functions to show and close the time machine
  const showTimeMachine = () => {
    setMachineOpen(true);
  };

  const closeTimeMachine = () => {
    setMachineOpen(false);
  }

  return (
    <div className="carousel-div" {...handlers}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="divBtn divBtn4icon">
          <button onClick={() => handleGoToSlide(0)} className="btn">
            <img src={iconCalendar} alt="icon" className="icon"/>
          </button>
          <button onClick={() => handleGoToSlide(1)} className="btn">
            <img src={iconNotes} alt="icon" className="icon"/>
          </button>
          <button onClick={() => handleGoToSlide(2)} className="btn">
            <img src={iconTomato} alt="icon" className="icon"/>
          </button>
          <button onClick={() => handleGoToSlide(3)} className="btn">
            <img src={iconProjects} alt="icon" className="icon"/>
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
        <button onClick={handlePrev} className="btn">
          <img src={iconArrowLeft} alt="icon" className="icon"/>
        </button>
        {/* time machine */}
        <button onClick={showTimeMachine} className="btn">
          <img src={iconTimeMachine} alt="icon" className="icon"/>
        </button>
        <TimeMachine isOpen={machineOpen} onClose={closeTimeMachine}/>
        <button onClick={handleNext} className="btn">
          <img src={iconArrowRight} alt="icon" className="icon"/>
        </button>
      </div>
        
    </div>
    
  );
}
