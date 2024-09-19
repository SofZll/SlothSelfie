import iconHome from './media/Sloth.svg';
import React from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import Calendar from 'react-calendar';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import animatedHourglass from './media/Hourglass.gif';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sloth Selfie</h1>
        <img src={iconHome} className="App-logo" alt="logo" />
          <Routes>
            <Route 
              path="/" 
              element={
              <Carousel 
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}
                centerMode={true}
                centerSlidePercentage={50}
                dynamicHeight={true}
              >
                <div className="carousel-slide">
                  <h2>Calendar</h2>
                  <Calendar />
                </div>
                <div className="carousel-slide">
                  <h2>Notes</h2>
                    <div className="notes-section">
                    <p>Add a note here!</p><br/>
                    <Link to="/notes">
                      <button>Add</button>
                    </Link>
                  </div>
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
              <div className="carousel-slide">
                <h2>Projects</h2>
                <p>Content for other stuff 3</p>
              </div>
              </Carousel>
            }
            />
            <Route path="/pomodoro" element={<PomodoroFunction />} />
            <Route path="/notes" element={<NotesFunction />} />
          </Routes>
        </header>
      </div>
    </Router>
  ); 
}

export default App;
