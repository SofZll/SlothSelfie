import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);


function EventsFunction() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [showCalendar] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date()); // default day: today
  const [showFilterCalendar, setShowFilterCalendar] = useState(false);

    // Convert events to the format required by React Big Calendar
    const mappedEvents = events.map((event) => ({
      title: event.title,
      start: new Date(`${event.date}T${event.time}`), // Combine date and time
      end: new Date(new Date(`${event.date}T${event.time}`).getTime() + event.duration * 60 * 60 * 1000), // Add duration in hours
    }));

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

       {/* React Big Calendar to display events */}
       <h2>Your Calendar</h2>
      <BigCalendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}

export default EventsFunction;