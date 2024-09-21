import Carousel from "react-spring-3d-carousel";
import { useState, useEffect } from "react";
import { config } from "react-spring";

export default function CarroussSel(props) {
  const table = props.cards.map((element, index) => {
    return { ...element, onClick: () => setGoToSlide(index) };
  });

  const [offsetRadius, setOffsetRadius] = useState(2);
  const [showArrows, setShowArrows] = useState(false);
  const [goToSlide, setGoToSlide] = useState(null);
  const [cards] = useState(table);
  const [vertical, setVertical] = useState(false);
  const [verticalSwipe, setVerticalSwipe] = useState(false);
  const [carouselKey, setCarouselKey] = useState("horizontal");
  const [renderTrigger, setRenderTrigger] = useState(0);
  
  const checkScreenSize = () => {
    console.log("Controllo dimensioni schermo: ", window.innerWidth);
    if (window.innerWidth <= 840) {
      console.log("true ", window.innerWidth);
      setVertical(true);
      setVerticalSwipe(true);
      setCarouselKey("vertical");
      console.log("Vertical:", vertical, "VerticalSwipe:", verticalSwipe, "CarouselKey:", carouselKey);
    } else {
      setVertical(true);
      setVerticalSwipe(true);
      setCarouselKey("vertical");
    }
    setRenderTrigger(prev => prev + 1);
  };

  useEffect(() => {
    setOffsetRadius(props.offset);
    setShowArrows(props.showArrows);
  }, [props.offset, props.showArrows]);

  useEffect(() => {
    checkScreenSize();
    const handleResize = () => checkScreenSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{ width: props.width, height: props.height, margin: props.margin }}
    >
      
      <Carousel
        slides={cards}
        goToSlide={goToSlide}
        offsetRadius={offsetRadius}
        showNavigation={showArrows}
        animationConfig={config.gentle}
        vertical={true}
        verticalSwipe={true}
        key={'vertical'}
        />
    </div>
  );
}
