// Function to convert all-day events to timed events 
export function convertAllDayToTimedEvent(event) {
    if (event.allDay) {

      const startDate = new Date(`${event.date}T00:00:00`); // set at midnight of the day
      const endDate = new Date(startDate.getTime() + (event.duration  * 24 * 60 * 60 * 1000) - 1); // set the end at the last millisec of the day
      const eventTime ="00:00"; // set at midnight of the day
      //test
        console.log("Converted Event:", {
            ...event,
            start: startDate,
            time: eventTime,
            duration: ((event.duration * 23)+(59 / 60)).toString(),
            end: endDate,
            allDay: false, //converted in hours
        });
        
      return {
        ...event,
        start: startDate,
        time: eventTime,
        duration: ((event.duration * 23)+(59 / 60)).toString(),
        end: endDate,
        allDay: false, //converted in hours
      };
    }
    return event;
  }

// Function to generate repeated events
export function generateRepeatedEvents (event, repeatEndDate = null, repeatCount = null) {
    const repeatedEvents = [];
    let currentDate = new Date(`${event.date}T${event.time}`);
    let count = 0;
    if(repeatEndDate){
        repeatEndDate = new Date(repeatEndDate);
        repeatEndDate.setHours(23, 59, 59, 999);//Adjusting the end, else we lose a day
    }

    while (true) {
        if (repeatEndDate && currentDate > new Date(repeatEndDate)) break;
        if (repeatCount && count >= repeatCount) break;
      
        repeatedEvents.push({
        title: event.title,
        start: new Date(currentDate),
        end: new Date(currentDate.getTime() + (event.duration ? event.duration * 60 * 60 * 1000 : 0)),
        allDay: event.allDay,
        eventLocation: event.eventLocation,
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
        
        // If no repeat conditions are set, prevent an infinite loop
        if (!repeatEndDate && !repeatCount && count >= 1000) {
            console.warn("Maximum iterations reached. Possibly an infinite loop.");
            break;
        }

        count++;
    }
    console.log("Generated Repeated Events:", repeatedEvents);
    return repeatedEvents;
};

// Convert events to the format required by React Big Calendar
export function normalizeEvents (events) {
    return events.map((event) => {
        let startDate, endDate;
    
    // managing repeated events
    if (event.start && event.end) {
        startDate = new Date(event.start);
        endDate = new Date(event.end);
    } else {
        startDate = new Date(`${event.date}T${event.time}`);
        const durationInMilliseconds = Number(event.duration) * 60 * 60 * 1000;
        endDate = new Date(startDate.getTime() + durationInMilliseconds);
    }
    
    // Setting a default time for allDay events
    if (event.allDay) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`Invalid date for event: ${JSON.stringify(event)}`);
        return {
        id: event.id,
        title: event.title,
        start: new Date(),
        end: new Date(),
        allDay: event.allDay,
        eventLocation: event.eventLocation,
        };
    }
      
        return {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate,
        allDay: event.allDay,
        eventLocation: event.eventLocation,
        };
    });
};

//Function to reset imput fields
export function handleClosePopupE(setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation) {
    setSelectedEvent(null); // close the popup
    //Reset imput fields
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
}

// Handle updating an event
export function handleUpdateEvent(
    e, id, title, date, time, duration, allDay, days, repeatFrequency, repeatEndDate, repeatCount, eventLocation, events, setEvents, setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation, 
  ) {
    e.preventDefault();
    console.log("Updating event:", id); // Check if the update function is called
    const updatedEvents = events.map(event => {
        if (event.id === id) {
            return {
                ...event,
                title: title,
                date: date,
                time: time,
                duration: duration,
                allDay: allDay,
                days: days,
                repeatFrequency: repeatFrequency,
                repeatEndDate: repeatEndDate,
                repeatCount: repeatCount,
                eventLocation: eventLocation,
            };
        }
        return event;
    });
    console.log("Updated events:", events); // Check if the events are updated
    setEvents(updatedEvents);
    handleClosePopupE(setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation);
}


/* CON EVENTI RIPETUTI VANNO SOLO TITLE E LOCATION
// Handle updating an event
export function handleUpdateEvent(
    e, id, title, date, time, duration, allDay, days, repeatFrequency, repeatEndDate, repeatCount, eventLocation, events, setEvents, setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation, setUpdateAllFutureEvents
  ) {
    e.preventDefault();
    console.log("Updating event:", id); // Check if the update function is called
    const updatedEvents = events.map(event => {
        if (event.id === id) {
            // Updates only the current instance
            return {
                ...event,
                title: title,
                date: date,
                time: time,
                duration: duration,
                allDay: allDay,
                days: days,
                repeatFrequency: repeatFrequency,
                repeatEndDate: repeatEndDate,
                repeatCount: repeatCount,
                eventLocation: eventLocation,
            };
        } else if (event.originalId === id && setUpdateAllFutureEvents) {
            // Aggiorna tutte le istanze future
            return {
                ...event,
                title: title,
                date: calculateNextOccurrence(date, event.repeatFrequency),
                time: time,
                duration: duration,
                allDay: allDay,
                days: days,
                repeatFrequency: repeatFrequency,
                repeatEndDate: repeatEndDate,
                repeatCount: repeatCount,
                eventLocation: eventLocation,
            };
        }
        return event;
    });

    console.log("Updated events:", events); // Check if the events are updated
    setEvents(updatedEvents);
    setSelectedEvent(null); // close the popup
    //Reset imput fields
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
}

// Function to calculate the next occurrence of a repeated event
const calculateNextOccurrence = (date, frequency) => {
    const nextDate = new Date(date);
    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            break;
    }
    return nextDate;
};
*/

//Handle deleting an event
export function handleDeleteEvent(id, events, setEvents, setSelectedEvent) {
    console.log("Deleting event with id:", id);
    const updatedEvents = events.filter(event => event.id !== id);
    console.log("Updated events:", updatedEvents); 
    setEvents(updatedEvents);
    setSelectedEvent(null); // close the pop-up
};

  // Function to Abort the deletion
 export function handleAbortDelete(setShowConfirmation) {
    setShowConfirmation(false);
  };

  // Function to confirm the deletion
  export function handleConfirmDelete(selectedEvent, setShowConfirmation, handleDeleteEvent, events, setEvents, setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation) {
    handleDeleteEvent(selectedEvent.id, events, setEvents, setSelectedEvent);
    setShowConfirmation(false);
    handleClosePopupE(setSelectedEvent, setId, setTitle, setDate, setTime, setDuration, setAllDay, setDays, setRepeatFrequency, setRepeatEndDate, setRepeatCount, seteventLocation);
  };
