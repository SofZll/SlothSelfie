import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import Calendar from 'react-calendar';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sloth Selfie</h1>
        <Carousel showThumbs={false} showStatus={false} infiniteLoop={true}>
          <div class="carousel-slide">
            <h2>Calendar</h2>
            <Calendar />
          </div>
          <div class="carousel-slide">
            <h2>Other Stuff 1</h2>
            <p>Content for other stuff 1</p>
          </div>
          <div class="carousel-slide">
            <h2>Other Stuff 2</h2>
            <p>Content for other stuff 2</p>
          </div>
        </Carousel>
      </header>
    </div>
  );
}

export default App;
