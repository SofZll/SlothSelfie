import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import './css/Events.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { convertAllDayToTimedEvent, generateRepeatedEvents, normalizeEvents, handleDeleteEvent, handleUpdateEvent } from './EventUtils';

const localizer = momentLocalizer(moment);

const initialEvents = [
  // Puoi aggiungere alcuni eventi di esempio qui 
  // { title: 'Meeting', date: '2024-09-28', time: '14:00', duration: 2 },
  {id: 1, title: 'Coffee with John',date: '2024-10-24',time: '16:00',duration: 1, repeatFrequency: 'none',repeatEndDate: '', allDay: false,},
];

// Custom component to display the event
const EventComponent = ({ event }) => {
  return (
    <span>
      <strong>{event.title}</strong>
      <br />
      <em>eventLocation:{event.eventLocation}</em>
    </span>
  );
};


function EventsFunction() {
  const [events, setEvents] = useState(initialEvents || []);
  const [id, setId] = useState("");
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');//hours
  const [allDay, setAllDay] = useState(false);
  const [days, setDays] = useState(1); // Number of days
  const [repeatFrequency, setRepeatFrequency] = useState('none'); // Freqence of repetition
  const [repeatCount, setRepeatCount] = useState(null); // Number of repetitions
  const [repeatMode, setRepeatMode] = useState(''); // Mode of repetition
  const [repeatEndDate, setRepeatEndDate] = useState(''); // Date of the last repetition
  const [eventLocation, seteventLocation] = useState(''); // eventLocation of the event
  const [filterDate, setFilterDate] = useState(new Date()); // default day: today
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  useEffect(() => {
    //setting the date to the current date as a filter at the start
    const today = new Date();
    setFilterDate(today);
  }, []);

  useEffect(() => {
    if (selectedEvent) {// Pre-fill the form with the selected event
        console.log("Selected event:", selectedEvent);
        setId(selectedEvent.id);
        setTitle(selectedEvent.title);
        setDate(selectedEvent.start ? new Date(selectedEvent.start).toISOString().substring(0, 10) : ''); // Format as YYYY-MM-DD
        setTime(selectedEvent.start ? new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''); // Format as HH:MM
        setDuration(selectedEvent.duration || 1);
        setAllDay(selectedEvent.allDay);
        setDays(selectedEvent.allDay ? selectedEvent.duration : 1);
        setRepeatFrequency(selectedEvent.repeatFrequency);
        setRepeatEndDate(selectedEvent.repeatEndDate);
        seteventLocation(selectedEvent.eventLocation);
        console.log("form prefilled", selectedEvent);
    }
  },[selectedEvent]);
  
  function handleEventClick(event) {
    console.log("Event clicked:", event); 
    setSelectedEvent(event);
  }


  const handleAddEvent = (e) => {
    e.preventDefault();
    let newEvent = {
      id: events.length + 1,
      title,
      date,
      time,
      duration: allDay ? days : duration,
      allDay,
      repeatFrequency,
      repeatEndDate,
      eventLocation,
    };

    if(allDay){
      newEvent = convertAllDayToTimedEvent(newEvent);
    }
    
    // If we have a repeat frequency, generate repeated events
    if (repeatFrequency !== 'none') {
      let repeatedEvents = [];
  
      if (repeatMode === 'until' && repeatEndDate) {
        // Generate events based on an end date
        repeatedEvents = generateRepeatedEvents(newEvent, repeatEndDate);
      } else if (repeatMode === 'ntimes' && repeatCount) {
        // Generate events based on a number of repetitions N
        repeatedEvents = generateRepeatedEvents(newEvent, null, repeatCount);
      }
  
      setEvents([...events, ...repeatedEvents]);
      console.log("Current Events:", [...events, ...repeatedEvents]);
    } else {
      setEvents([...events, newEvent]);
      console.log("Current Events:", [...events, newEvent]);
    }
    // Reset input fields
    setId('');
    setTitle('');
    setDate('');
    setTime('');
    setDuration('');
    setAllDay(false);
    setDays(1);
    setRepeatFrequency('none');
    setRepeatEndDate('');
    setRepeatCount('');
    seteventLocation('');
  };
  return (
    <div className= "Event">
      <h2>Add Event</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submit triggered");
        if (selectedEvent) {
          console.log("Submitting update for event:", selectedEvent);
          handleUpdateEvent(e, id, title, date, time, duration, allDay, days, repeatFrequency, repeatEndDate, repeatCount, eventLocation, events, setEvents, setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation);
        } else {
          handleAddEvent(e);
        }
      }}>
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
          {!allDay && (
    <input 
      type="time" 
      value={time} 
      onChange={(e) => setTime(e.target.value)} 
      required 
    />
  )}

  {!allDay && (
    <input 
      type="number" 
      placeholder="Duration (hours)" 
      value={duration} 
      onChange={(e) => setDuration(e.target.value)} 
      min="1" 
      required 
    />
  )}

  {allDay && (
    <input 
      type="number" 
      placeholder="Number of days" 
      value={days} 
      onChange={(e) => setDays(e.target.value)} 
      min="1" 
    />
  )}

  <label>
    <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
    All Day
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
          <label>
            Repeat Mode:
            <select onChange={(e) => setRepeatMode(e.target.value)}>
              <option value="ntimes">N Times</option>
              <option value="until">Until</option>
            </select>
          </label>
    
          {repeatMode === 'ntimes' && (
            <div>
              <label>Number of repetitions:</label>
              <input 
                type="number" 
                value={repeatCount} 
                onChange={(e) => setRepeatCount(e.target.value)} 
                min="1" 
              />
            </div>
          )}
    
          {repeatMode === 'until' && (
            <div>
              <label>Repeat until:</label>
              <input 
                type="date" 
                value={repeatEndDate} 
                onChange={(e) => setRepeatEndDate(e.target.value)} 
              />
            </div>
          )}
        </div>
      )}

        <input type="text"
          placeholder="eventLocation (physical or virtual)"
          value={eventLocation} onChange={(e) => seteventLocation(e.target.value)}
        />
        <button className='btn' type="submit">
          {selectedEvent ? 'Save Changes' : 'Add Event'}
        </button>
      </form>

       {/* React Big Calendar to display events */}
       <h2>Your Events:</h2>
       <div className="calendar-container">
        <BigCalendar
          localizer={localizer}
          events={normalizeEvents(events)}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleEventClick}
          titleAccessor="title"
          style={{ height: 500 }}
          components={{
            event: EventComponent
          }}
        />
        {/* Display popup for the selected activity*/}
        {selectedEvent && (
            <div className="popup">
            <h2>Editing mode:</h2>
            <h2>{selectedEvent.title}</h2>
            <p>Location: {selectedEvent.eventLocation}</p>
            <p>Start: {selectedEvent.start.toLocaleString()}</p>
            <p>End: {selectedEvent.end.toLocaleString()}</p>
            <p>All Day: {selectedEvent.allDay ? 'Yes' : 'No'}</p>
            <button className='btn' onClick={() => {
                if (selectedEvent) {
                    handleDeleteEvent(selectedEvent.id, events, setEvents, setSelectedEvent);
                }
            }}>Delete</button>
            <button className='btn' onClick={() => setSelectedEvent(null)}>X</button>
            </div>
          )}
      </div>
    </div>
  );
}

// Export the function and the events list
export { initialEvents };

export default EventsFunction;