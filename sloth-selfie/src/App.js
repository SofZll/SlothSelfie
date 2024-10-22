import React, {useEffect, useState} from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import EventsFunction from './Events2';
import ActivitiesFunction from './Activities';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import Form from './Login';
import Card from "./cardCarosel";
import Carousel from "./CarouselHome";
import { v4 as uuidv4 } from "uuid";
import { StyleContext, StyleProvider } from './StyleContext';
import Menu from './Menu';
import ProfileFunction from './Profile';
import { use } from 'marked';
import TimeMachine from './TimeMachine';
import iconTimeMachine from './media/time-machine.svg';
import { update } from 'react-spring';
import { ActivityProvider } from './ActivityContext';

function App() {
  const [machineOpen, setMachineOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

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
  const [formType, setFormType] = useState('login'); 

  const handleLogin = (status) => {
    console.log("Login status:", status);
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

  const isMobileLandscape = () => {
    const isMobileWidth = window.matchMedia('(max-width: 700px)').matches; // Soglia di 500px per modalità cellulare
    const isLandscapeHeight = window.matchMedia('(max-height: 700px').matches;
    const isLandscapeWidth = window.matchMedia('(max-width: 1000px').matches;
    return isMobileWidth || (isLandscapeHeight && isLandscapeWidth);
  };

  const isMobile = () => {
    return window.matchMedia('(max-width: 700px)').matches;
  };

  let cards = [
    {
      key: uuidv4(),
      content: (
        <Card title="Calendar" caseShow="1" />
      )
    },
    {
      key: uuidv4(),
      content: (
        <Card title="Notes" caseShow="2" />
      )
    },
    {
      key: uuidv4(),
      content: (
        <Card title="Pomodoro" caseShow="3" />
      )
    },
    {
      key: uuidv4(),
      content: (
        <Card title="Projects" caseShow="4" />
      )
    }
  ];

  // Functions to update time machine position based on screen size
  const updatePosition = () => {
    if (isMobile()) {
      const initialX = window.innerWidth * 0.8;
      const initialY = window.innerHeight * 0.8;
      setPosition({ x: initialX, y: initialY });
    } else {
      setPosition({ x: window.innerWidth * 0.9, y: window.innerHeight * 0.03 });
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    }
  }, []);

  

  // Function to show and close the time machine
  const toggleTimeMachine = () => {
    setMachineOpen(prevState => !prevState);
  };

  // Touch events for time machine
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartPosition({ x: touch.clientX, y: touch.clientY });
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    
    // Calculate delta for better performance
    const deltaX = touch.clientX - startPosition.x;
    const deltaY = touch.clientY - startPosition.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setIsDragging(true);

      setPosition(prevPos => ({
        x: prevPos.x + deltaX,
        y: prevPos.y + deltaY,
      }));

      setStartPosition({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) {
      toggleTimeMachine();
    }
  };

  return (
    <Router>
      <StyleProvider>
        <ActivityProvider>
        <div className="App">
          <Menu username={username}/>
          <header className="App-header">
              <div className="title">
                <h1>Sloth Selfie</h1>
              </div>
              <StyleContext.Consumer>
                {({ icon }) => <img src={icon} className="App-logo" alt="logo" />}
              </StyleContext.Consumer>
          </header>
          <div className="App-body">
            <Routes>
              {/*<Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/home" />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route 
                  path="/login" 
                  element={<Form formType={formType} setFormType={setFormType} handleLogin={handleLogin}/>}
                />
                <Route 
                  path="/register" 
                  element={<Form formType="register" setFormType={setFormType}/>}
                />
              /> */}
              <Route path="/" /*path="home"*/
                element={ 
                /*isAuthenticated ? (*/ 
                (<Carousel
                    cards={cards}
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
            {/* time machine */}
            <div
              className="div-time-machine"
              style={{
                left: `${position.x}px` ,
                top: `${position.y}px` ,
              }}
            >
              <button
                className="btn-time-machine"
                onTouchStart={isMobileLandscape() ? handleTouchStart : null}
                onTouchMove={isMobileLandscape() ? handleTouchMove : null}
                onTouchEnd={isMobileLandscape() ? handleTouchEnd : null}
                onClick={!isMobileLandscape() ? toggleTimeMachine : null} // Enable click on desktop
                style={{ touchAction: 'none' }}
              >
                <img src={iconTimeMachine} alt="icon" className="icon" />
              </button>
            </div>
            <TimeMachine isOpen={machineOpen} onClose={() => setMachineOpen(false)} />
          </div>
        </div>
        </ActivityProvider>
      </StyleProvider>
    </Router>
  );
}

export default App;
