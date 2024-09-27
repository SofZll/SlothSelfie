import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const initialEvents = [
  // Puoi aggiungere alcuni eventi di esempio qui 
  // { title: 'Meeting', date: '2024-09-28', time: '14:00', duration: 2 },
  { title: 'Coffee with John', date: '2024-09-30', time: '16:00', duration: 1 },
];

function EventsFunction() {
  const [events, setEvents] = useState(initialEvents);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');//hours
  const [allDay, setAllDay] = useState(false);//days
  const [repeatFrequency, setRepeatFrequency] = useState('none'); // Freqence of repetition
  const [repeatCount, setRepeatCount] = useState(null); // Number of repetitions
  const [repeatEndDate, setRepeatEndDate] = useState(''); // Date of the last repetition
  const [location, setLocation] = useState(''); // Location of the event
  const [filterDate, setFilterDate] = useState(new Date()); // default day: today

  // change style page onload document
  useEffect(() => {
    const header = document.querySelector('.App-header');
    const h1 = document.querySelector('h1');
    if (header) header.classList.add('light-background');
    else console.error('Header not found');
    if (h1) h1.classList.add('dark-h1');

    document.body.classList.add('light-background');

    return () => {
      if (header) header.classList.remove('light-background');
      if (h1) h1.classList.remove('dark-h1');
      document.body.classList.remove('light-background');
    };
  }, []);

  // Convert events to the format required by React Big Calendar
  const mappedEvents = events.map((event) => ({
    title: event.title,
    start: new Date(`${event.date}T${event.time}`), // Combine date and time
    end: new Date(new Date(`${event.date}T${event.time}`).getTime() + event.duration * 60 * 60 * 1000), // Add duration in hours
  }));

  const handleAddEvent = (e) => {
    e.preventDefault();
    const newEvent = { title, date, time, duration, allDay, repeatFrequency, repeatEndDate, location };

    // If we have a repeat frequency, generate repeated events
    if (repeatFrequency !== 'none') {
      const repeatedEvents = generateRepeatedEvents(newEvent);
      setEvents([...events, ...repeatedEvents]);
    } else {
      setEvents([...events, newEvent]);
    }

    // Reset input fields
    setEvents([...events, newEvent]);
    setTitle('');
    setDate('');
    setTime('');
    setDuration('');
    setAllDay(false);
    setRepeatFrequency('none');
    setRepeatEndDate('');
    setLocation('');
  };

    // Function to generate repeated events
    const generateRepeatedEvents = (event) => {
      const repeatedEvents = [];
      let currentDate = new Date(event.date);
      const endDate = new Date(event.repeatEndDate);
  
      while (currentDate <= endDate) {
        repeatedEvents.push({ ...event, date: currentDate.toISOString().split('T')[0] });
      
        // Incrementa la data basata sulla frequenza
        if (event.repeatFrequency === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (event.repeatFrequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (event.repeatFrequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (event.repeatFrequency === 'yearly') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }
  
      return repeatedEvents;
    };
  

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
        <label>
          <input type="checkbox"
          checked={allDay} 
          onChange={(e) => setAllDay(e.target.checked)} /> 
          All day
        </label>
        <select value={repeatFrequency} onChange={(e) => setRepeatFrequency(e.target.value)}>
          <option value="none">No repetition</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
          {repeatFrequency !== 'none' && (
          <div>
            <label>Repeat until:</label>
            <input type="date" value={repeatEndDate} onChange={(e) => setRepeatEndDate(e.target.value)} />
          </div>
          )}

        <input type="text"
          placeholder="Location (physical or virtual)"
          value={location} onChange={(e) => setLocation(e.target.value)}
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
        titleAccessor="title"
        style={{ height: 500 }}
      />
    </div>
  );
}

// Export the function and the events list
export { initialEvents };

export default EventsFunction;