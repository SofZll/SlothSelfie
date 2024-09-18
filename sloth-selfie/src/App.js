import logo from './logo.svg';
import React, { useState } from 'react';
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
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleAddNote = () => {
    if (noteTitle && noteContent) {
      setNotes([...notes, { title: noteTitle, content: noteContent }]);
      setNoteTitle('');
      setNoteContent('');
    }
  };

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
          <h2>Notes</h2>
            <div className="notes-section">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title"
              />
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Note Content"
              />
              <button onClick={handleAddNote}>Add Note</button>
              <ul>
                {notes.map((note, index) => (
                   <li key={index}>
                   <h3>{note.title}</h3>
                   <p>{note.content}</p>
                 </li>
                ))}
              </ul>
            </div>
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
