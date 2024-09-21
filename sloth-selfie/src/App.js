import iconHome from './media/Sloth.svg';
import React, {useState} from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Link , Navigate} from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import Calendar from 'react-calendar';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import EventsFunction from './Events';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import animatedHourglass from './media/Hourglass.gif';
import Login from './Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sloth Selfie</h1>
        <img src={iconHome} className="App-logo" alt="logo" />
        <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/home" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/home"
              element={ 
                isAuthenticated ? (
                <Carousel showThumbs={false} showStatus={false} infiniteLoop={true}>
                  <div class="carousel-slide">
                    <h2>Calendar</h2>
                    <Calendar />
                    <Link to="/events">
                      <button className="btn">Manage Events</button>
                    </Link>
                    <Link to="/activities">
                      <button className="btn">Manage Activities</button>
                    </Link>
                  </div>
                  <div class="carousel-slide">
                    <h2>Notes</h2>
                      <div className="notes-section">
                      <p>Add a note here!</p><br/>
                      <Link to="/notes">
                        <button className="btn">Add</button>
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
                        <button className="btn">Start</button>
                      </Link>
                    </div>
                  </div>
                <div class="carousel-slide">
                  <h2>Projects</h2>
                  <p>Content for other stuff 3</p>
                </div>
                </Carousel>
              ) : (
                <Navigate to="/login" />
              )
              }
            />
            <Route path="/pomodoro" element={<PomodoroFunction />} />
            <Route path="/notes" element={<NotesFunction />} />
            <Route path="/events" element={<EventsFunction />} />
          </Routes>
        </header>
      </div>
    </Router>
  ); 
}

export default App;
