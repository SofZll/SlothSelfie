import React, { useState } from 'react';
import Calendar from 'react-calendar';

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
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <strong>{event.title}</strong> on {event.date} at {event.time}, Duration: {event.duration} hours
          </li>
        ))}
      </ul>

      <h2>Calendar</h2>
      <Calendar />
    </div>
  );
}

export default EventsFunction;