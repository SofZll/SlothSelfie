import React, {useEffect, useState} from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import EventsFunction from './Events';
import ActivitiesFunction from './Activities';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import Login from './Login';
import Card from "./cardCarosel";
import Carousel from "./CarouselHome";
import { v4 as uuidv4 } from "uuid";
import { StyleContext, StyleProvider } from './StyleContext';
import Menu from './Menu';
import ProfileFunction from './Profile';
import { use } from 'marked';

function App() {
  const username = 'user';
  /*
  const [username, setUsername] = useState('example');
  
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('api/username');
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, []);

  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  */

  const openFullscreen = () => {
    const elem = document.documentElement; // L'intero documento sarà a schermo intero
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari e Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
  };

  const isMobile = () => {
    return window.matchMedia('(max-width: 768px)').matches; // Soglia di 768px per modalità cellulare
  };

  let cards = [
    {
      key: uuidv4(),
      content: (
        <Card title="Calendar" caseShow="1"/>
      )
    },
    {
      key: uuidv4(),
      content: (
        <Card title="Notes" caseShow="2"/>
      )
    },
    {
      key: uuidv4(),
      content: (
        <Card title="Pomodoro" caseShow="3"/>
      )
    },
    {
      key: uuidv4(),
      content: (
        <Card title="Projects" caseShow="4"/>
      )
    }
  ];

  useEffect(() => {
    if (isMobile()) {
      // Chiediamo all'utente di entrare in fullscreen
      window.addEventListener('click', openFullscreen);
      
      // Cleanup dell'event listener quando il componente viene smontato
      return () => {
        window.removeEventListener('click', openFullscreen);
      }
    };
  }, [])

  return (
    <Router>
      <StyleProvider>
        <div className="App">
          <header className="App-header">
            <div className="header-content">
              <Menu username={username}/>
              <div className="title">
                <h1>Sloth Selfie</h1>
              </div>
              <StyleContext.Consumer>
                {({ icon }) => <img src={icon} className="App-logo" alt="logo" />}
              </StyleContext.Consumer>
            </div>
          </header>
          <div className="App-body">
            <Routes>
              {/*<Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/home" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              /> */}
              <Route path="/" /*path="home"*/
                element={ 
                /*isAuthenticated ? (*/ 
                (<Carousel
                    cards={cards}
                    className="carousel_structure"
                    height="85vh"
                    width="60vw"
                    margin="0"
                    offset={2}
                    showArrows={false}
                  />)
                /*) : (
                  <Navigate to="/login" />
                ) */
                }
              />
              <Route path="/profile" element={<ProfileFunction />} />
              <Route path="/pomodoro" element={<PomodoroFunction />} />
              <Route path="/notes" element={<NotesFunction />} />
              <Route path="/events" element={<EventsFunction />} />
              <Route path="/activities" element={<ActivitiesFunction />} />
            </Routes>
          </div>
        </div>
        <div class="landscape-warning">
          Coglion* ruota il telefono &#129324;
        </div>
      </StyleProvider>
    </Router>
  ); 
}

export default App;
