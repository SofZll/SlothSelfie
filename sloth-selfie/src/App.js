import iconHome from './media/Sloth.svg';
import React, {useState} from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import EventsFunction from './Events';
import ActivitiesFunction from './Activities';
import PomodoroFunction from './Pomodoro';
import NotesFunction from './Notes';
import Form from './Login';
import Card from "./cardCarosel";
import Carousel from "./CarouselHome";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formType, setFormType] = useState('login');

  const handleLogin = (status) => {
    console.log("Login status:", status);
    setIsAuthenticated(status);
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

  console.log("isAuthenticated:", isAuthenticated);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="title">
            <h1>Sloth Selfie</h1>
            <img src={iconHome} className="App-logo" alt="logo" />
          </div>
        </header>
        <Routes>
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
          <Route path="/login" element={<Form formType={formType} setFormType={setFormType} onLogin={handleLogin} />} />
          <Route path="/home"
            element={ 
            isAuthenticated ? (
            <Carousel
                cards={cards}
                className="carousel_structure"
                height="70vh"
                width="60vw"
                margin="0"
                offset={2}
                showArrows={false}
              />
            ) : (
              <Navigate to="/login" />
            )
            }
          />
          <Route path="/pomodoro" element={<PomodoroFunction />} />
          <Route path="/notes" element={<NotesFunction />} />
          <Route path="/events" element={<EventsFunction />} />
          <Route path="/activities" element={<ActivitiesFunction />} />
        </Routes>
      </div>
    </Router>
  ); 
}

export default App;
