import React, {useEffect, useState} from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import Calendar from './Calendar';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import Settings from './previewSetUp';
import NotificationFunction from './Notifications';
import Form from './Login';
import Card from "./cardCarosel";
import Carousel from "./CarouselHome";
import { v4 as uuidv4 } from "uuid";
import { StyleContext, StyleProvider } from './StyleContext';
import Menu from './Menu';
import ProfileFunction from './Profile';
import HubFunction from './Hub';
import TimeMachine from './TimeMachine';
import iconTimeMachine from './media/time-machine.svg';
import socket from './socket';
import 'leaflet/dist/leaflet.css';

function App() {
  const [loading, setLoading] = useState(true);

  const [machineOpen, setMachineOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formType, setFormType] = useState('login');

  const [inSettings, setInSettings] = useState(false);

  // Check if the user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
    
      if (response.ok) {
        setIsAuthenticated(true);
        socket.emit('authenticated', true);
      } else setIsAuthenticated(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
    console.log("isAuthenticated: ", isAuthenticated);
  };

  useEffect(() => {
    checkAuth();

    return () => {
      socket.off('authenticated');
    }
  }, []);
  
  const handleLogin = (status) => {
    console.log("Login status:", status);
    setIsAuthenticated(status);
  };

  /*
  // Function to open the app in fullscreen mode
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
  */

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
          { loading ? (
            <div className="loading-page loading-page-light">
              <div className="spinner"></div>
              <p>Loading, please wait...</p>
            </div>
          ) : (
            <div className="App">
              <Menu/>
              <TimeMachine isOpen={machineOpen} onClose={() => setMachineOpen(false)} />
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
                  <Route
                      path="/"
                      element={<Navigate to={checkAuth ? "/home" : "/login"} />}
                  />
                  <Route 
                    path="/login" 
                    element={<Form formType={formType} setFormType={setFormType} handleLogin={handleLogin}/>}
                  />
                  <Route 
                    path="/register" 
                    element={<Form formType="register" setFormType={setFormType}/>}
                  />
                  <Route path="home"
                    element={ 
                    isAuthenticated ? ( 
                      inSettings ? (
                        <Settings
                          setUp={inSettings}
                          setSetUp={setInSettings}
                        />
                      ) : (
                        <Carousel
                            cards={cards}
                            offset={2}
                            showArrows={false}
                            setUp={inSettings}
                            setSetUp={setInSettings}
                        />)
                    ) : (
                      <Navigate to="/login" />
                    )
                    }
                  />
                  <Route path="/profile" element={<ProfileFunction setLoading={setLoading}/>} />
                  <Route path="/notifications" element={<NotificationFunction />} />
                  <Route path="/pomodoro" element={<PomodoroFunction />} />
                  <Route path="/notes" element={<NotesFunction />} />
                  <Route path="/Calendar" element={<Calendar />} />
                  <Route path="/hub" element={<HubFunction />} />
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
              </div>
            </div>
          )}
      </StyleProvider>
    </Router>
  );
}

export default App;
