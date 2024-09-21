import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';

function EventsFunction() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');

  const handleAddEvent = (e) => {
    e.preventDefault();
    const newEvent = { title, date, time, duration };
    setEvents([...events, newEvent]);
    setTitle('');   // Reset input fields
    setDate('');
    setTime('');
    setDuration('');
  };

   // Updates the date field when we select a date from the calendar
   const handleDateChange = (selectedDate) => {
    const formattedDate = selectedDate.toLocaleDateString('en-CA'); // Format as 'YYYY-MM-DD'
    setDate(formattedDate);  
  };
  
  return (
    <div className= "Event">
      <h2>Add Event</h2>
      <form onSubmit={handleAddEvent}>
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
        <input 
          type="time" 
          value={time} 
          onChange={(e) => setTime(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          placeholder="Duration (hours)" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)} 
          min="1" //no negative numbers
          required 
        />
        <button className='btn' type="submit">Add Event</button>
      </form>

      <h2>Your Events</h2>
      <div className="events-container">
        {events.map((event, index) => (
          <div key={index} className="event-card">
            <h3>{event.title}</h3>
            <p>{event.date} at {event.time}</p>
            <p>Duration: {event.duration} hours</p>
          </div>
        ))}
      </div>

      <h2>Calendar</h2>
      <Calendar  onChange={handleDateChange} />
    </div>
  );
}

export default EventsFunction;