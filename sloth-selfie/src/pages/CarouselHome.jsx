import React, { useState, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { config } from 'react-spring';
import Carousel from 'react-spring-3d-carousel';

import CardCarosel from '../components/CardCarosel';

import { Calendar1, NotebookPen, Presentation, MoveLeft, MoveRight, Settings } from 'lucide-react';
import iconTomato from '../assets/icons/tomato.svg';
import { useNavigate } from 'react-router-dom';

const CarouselHome = (props) => {

  const [goToSlide, setGoToSlide] = useState(0);
  const navigate = useNavigate();

  const cards = useMemo(() => [
    {
      key: 1,
      content: (<CardCarosel title='Calendar' settingKey='calendar'  />)
    },
    {
      key: 2,
      content: (<CardCarosel title='Notes' settingKey='notes' />)
    },
    {
      key: 3,
      content: (<CardCarosel title='Pomodoro' settingKey='pomodoro' />)
    },
    {
      key: 4,
      content: (<CardCarosel title='Projects' settingKey='projects' />)
    }
  ], []);

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
    props.setSetUp(true);
    navigate('/home/settings');
  };


  return (
    <div className='d-flex w-100 carousel-div justify-content-start align-items-center'
      {...handlers} style={{ touchAction: 'pan-y' }}>

      <div className='d-none d-md-flex justify-content-center divBtn4icon'>
          <button onClick={() => handleGoToSlide(0)} className={`btn-preview  ${goToSlide === 0 ? 'active' : ''}`} alt='calendar'>
            <Calendar1 size={36} color='#ffffff' strokeWidth={1.75} />
          </button>
          <button onClick={() => handleGoToSlide(1)} className={`btn-preview  ${goToSlide === 1 ? 'active' : ''}`} alt='notes'>
            <NotebookPen size={36} color='#ffffff' strokeWidth={1.75} />
          </button>
          <button onClick={() => handleGoToSlide(2)} className={`btn-preview  ${goToSlide === 2 ? 'active' : ''}`} alt='pomodoro'>
            <img src={iconTomato} alt='icon' className='icon-up'/>
          </button>
          <button onClick={() => handleGoToSlide(3)} className={`btn-preview  ${goToSlide === 3 ? 'active' : ''}`} alt='projects'>
            <Presentation size={36} color='#ffffff' strokeWidth={1.75} />
          </button>
      </div>

      <Carousel
        slides={cards}
        goToSlide={goToSlide}
        offsetRadius={2}
        showNavigation={false}
        animationConfig={config.gentle}
      />
      
      <div className='d-flex justify-content-around'>
        <button onClick={handlePrev} className='btn' alt='previous'>
          <MoveLeft size={36} color='#ffffff' strokeWidth={1.75} />
        </button>
        <button onClick={handleSetUp} className='btn' alt='settings'>
          <Settings size={36} color='#ffffff' strokeWidth={1.75} />
        </button>
        <button onClick={handleNext} className='btn' alt='next'>
          <MoveRight size={36} color='#ffffff' strokeWidth={1.75} />
        </button>
      </div>
        
    </div>
    
  );
}
export default CarouselHome;
