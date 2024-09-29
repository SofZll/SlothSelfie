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
  { title: 'Coffee with John',date: '2024-09-30',time: '16:00',duration: 1, repeatFrequency: 'none',repeatEndDate: '', allDay: false,},
];

function EventsFunction() {
  const [events, setEvents] = useState(initialEvents);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');//hours
  //
  const [allDay, setAllDay] = useState(false);//days AGGIUSTA
  const [repeatFrequency, setRepeatFrequency] = useState('none'); // Freqence of repetition
  const [repeatCount, setRepeatCount] = useState(null); // Number of repetitions
  const [repeatMode, setRepeatMode] = useState('indefinite'); // Mode of repetition
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
  const mappedEvents = events.map(event => {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + event.duration * 60 * 60 * 1000);
    
    return {
      title: event.title,
      start: startDate,
      end: endDate,
      allDay: event.allDay,
      location: event.location,
    };
  });

    //test
    useEffect(() => {
      console.log("Mapped Events:", mappedEvents); // Aggiungi questo per vedere i dati mappati
      mappedEvents.forEach(event => {
        console.log(`Event: ${event.title}, Start: ${event.start}, End: ${event.end}`);
      });

    }, [mappedEvents]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    const newEvent = { title, date, time, duration, allDay, repeatFrequency, repeatEndDate, location };

    // If we have a repeat frequency, generate repeated events
    if (repeatFrequency !== 'none') {
      let repeatedEvents = [];
  
      if (repeatMode === 'until' && repeatEndDate) {
        // Generate events based on an end date
        repeatedEvents = generateRepeatedEvents(newEvent, repeatEndDate);
      } else if (repeatMode === 'ntimes' && repeatCount) {
        // Generate events based on a number of repetitions N
        repeatedEvents = generateRepeatedEvents(newEvent, null, repeatCount);
      } else if (repeatMode === 'indefinite') {
        // Indefinite repetitions, we set a maximum number of repetitions AGGIUSTA QUESTA OPZIONE
        repeatedEvents = generateRepeatedEvents(newEvent, null, 100); // es. 100 repetitions
      }
  
      setEvents([...events, ...repeatedEvents]);
      console.log("Current Events:", [...events, ...repeatedEvents]);
    } else {
      setEvents([...events, newEvent]);
      console.log("Current Events:", [...events, newEvent]);
    }
    // Reset input fields

    setTitle('');
    setDate('');
    setTime('');
    setDuration('');
    setAllDay(false);
    setRepeatFrequency('none');
    setRepeatEndDate('');
    setRepeatCount('');
    setLocation('');
  };
/*
    // Function to generate repeated events
    const generateRepeatedEvents = (event) => {
      const repeatedEvents = [];
      let currentDate = new Date(`${event.date}T${event.time}`);
      const endDate = new Date(event.repeatEndDate);

       //setting the end of the day for the repeat end date
      endDate.setHours(23, 59, 59, 999);
      console.log("Repeat End Date:", endDate);

      while (currentDate <= endDate) {

        // Log currentDate on each iteration
        console.log("Current Date:", currentDate); 

          repeatedEvents.push({
          title: event.title,
          start: new Date(currentDate), // Start date
          end: new Date(currentDate.getTime() + event.duration * 60 * 60 * 1000), // End date
          allDay: event.allDay,
          location: event.location,
        });
      
        // Increment the date based on the repeat frequency
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
      console.log("Generated Repeated Events:", repeatedEvents); //FINO A QUI TUTTO OK
      return repeatedEvents;
    };
    */

    // Function to generate repeated events
    const generateRepeatedEvents = (event, repeatEndDate = null, repeatCount = null) => {
      const repeatedEvents = [];
      let currentDate = new Date(`${event.date}T${event.time}`);
      let count = 0;
      if(repeatEndDate){
        //setting the end of the day for the repeat end date
        //repeatEndDate.setHours(23, 59, 59, 999); //Aggiusta, altrimenti si perde un giorno
        console.log("Repeat End Date:", repeatEndDate);
      }
      while (true) {
        if (repeatEndDate && currentDate > new Date(repeatEndDate)) break;
        if (repeatCount && count >= repeatCount) break;
    
        repeatedEvents.push({
          title: event.title,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + event.duration * 60 * 60 * 1000),
          allDay: event.allDay,
          location: event.location,
        });
    
        //  Increment the date based on the repeat frequency
        if (event.repeatFrequency === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (event.repeatFrequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (event.repeatFrequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (event.repeatFrequency === 'yearly') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
    
        count++;
      }
      console.log("Generated Repeated Events:", repeatedEvents);
      return repeatedEvents;
    };
    
  

  useEffect(() => {
    //setting the date to the current date as a filter at the start
    const today = new Date();
    setFilterDate(today);
  }, []);

  const normalizeEvents = (events) => {
    return events.map((event) => {
      let startDate, endDate;

    // Gestione di eventi ripetuti
    if (event.start && event.end) {
      startDate = new Date(event.start);
      endDate = new Date(event.end);
    } else {
      startDate = new Date(`${event.date}T${event.time}`);
      const durationInMilliseconds = Number(event.duration) * 60 * 60 * 1000; // Assicurati che sia un numero
      endDate = new Date(startDate.getTime() + durationInMilliseconds);
    }

    // Controllo di validità delle date
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error(`Invalid date for event: ${JSON.stringify(event)}`);
      return {
        title: event.title,
        start: new Date(), // O un valore di fallback
        end: new Date(),
        allDay: event.allDay,
        location: event.location,
      };
    }
  
      return {
        title: event.title,
        start: startDate,
        end: endDate,
        allDay: event.allDay,
        location: event.location,
      };
    });
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
          <label>
            Repeat Mode:
            <select onChange={(e) => setRepeatMode(e.target.value)}>
              <option value="indefinite">Indefinite</option>
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
          placeholder="Location (physical or virtual)"
          value={location} onChange={(e) => setLocation(e.target.value)}
        />
        <button className='btn' type="submit">Add Event</button>
      </form>

       {/* React Big Calendar to display events */}
       <h2>Your Calendar</h2>
      <BigCalendar
        localizer={localizer}
        events={normalizeEvents(events)}
        //events={events}
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