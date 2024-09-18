import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import Calendar from 'react-calendar';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import PomodoroFunction from './Pomodoro';
import animatedHourglass from './Hourglass.gif';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sloth Selfie</h1>
          <Routes>
            <Route
              path="/"
              element={
                <Carousel showThumbs={false} showStatus={false} infiniteLoop={true}>
                  <div className="carousel-slide">
                    <h2>Calendar</h2>
                    <Calendar />
                  </div>
                  <div className="carousel-slide">
                    <h2>Other Stuff 1</h2>
                    <p>Content for other stuff 1</p>
                  </div>
                  <div className="carousel-slide">
                    {/* Preview of the Pomodoro timer */}
                    <h2>Pomodoro</h2>
                    <div className="pomodoro-timer">
                      <img src={animatedHourglass} alt="Hourglass" className="hourglass"/><br/>
                      <p>Start your study session!</p><br/>
                      <Link to="/pomodoro">
                        <button>Start</button>
                      </Link>
                    </div>
                  </div>
                </Carousel>
              }
            />
            <Route path="/pomodoro" element={<PomodoroFunction />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
