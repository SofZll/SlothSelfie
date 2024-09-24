import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';

function EventsFunction() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [showCalendar] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date()); // default day: today
  const [showFilterCalendar, setShowFilterCalendar] = useState(false);

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

  const handleFilterDateChange = (selectedDate) => {
    setFilterDate(selectedDate); // updates the filter date
    setShowFilterCalendar(false); //hide the calendar after selecting a date
  };

   const toggleFilterCalendar = () => {
    setShowFilterCalendar(!showFilterCalendar); // hides/shows the calendar
  };

  const eventsForSelectedDate = events.filter(event => event.date === filterDate.toLocaleDateString('en-CA'));

  useEffect(() => {
    //setting the date to the current date as a filter at the start
    const today = new Date();
    setFilterDate(today);
  }, []);

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
         {showCalendar && (
          <Calendar onChange={handleDateChange} />
        )}
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

      <h2>Your Events for {filterDate.toLocaleDateString('en-CA')}:</h2>
      <div className="events-container">
        {eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map((event, index) => (
            <div key={index} className="event-card">
              <h3>{event.title}</h3>
              <p>{event.date} at {event.time}</p>
              <p>Duration: {event.duration} hours</p>
            </div>
          ))
        ) : (
          <p>No events for this day.</p>
        )}
      </div>
      <h2>Filter by Date:</h2>
      <input
        type="text"
        placeholder="Select Date to Filter"
        value={filterDate.toLocaleDateString('en-CA')}
        onClick={toggleFilterCalendar} // show calendar when clicked
        readOnly
      />
      {showFilterCalendar && (
        <Calendar onChange={handleFilterDateChange} />
      )}
    </div>
  );
}

export default EventsFunction;