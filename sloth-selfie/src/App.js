import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import { Carousel } from 'react-responsive-carousel';
import Calendar from 'react-calendar';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');

  const handleAddNote = () => {
    if (noteInput) {
      setNotes([...notes, noteInput]);
      setNoteInput('');
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
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a new note"
              />
              <button onClick={handleAddNote}>Add Note</button>
              <ul>
                {notes.map((note, index) => (
                  <li key={index}>{note}</li>
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
