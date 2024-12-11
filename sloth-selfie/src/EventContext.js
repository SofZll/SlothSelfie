import React, { createContext, useState } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);

    //Define the event data structure
    const [eventData, setEventData] = useState({
        originalId: "", //DA RIVEDERE
        title: '',
        date: '',
        time: '00:00',
        isPreciseTime: false, // State for precise time input
        duration: '', // hours
        allDay: false,
        days: 1, // Number of days
        repeatFrequency: 'none', // Frequency of repetition <-
        repeatCount: 1, // Number of repetitions            <-
        repeatMode: 'ntimes', // Mode of repetition
        repeatEndDate: '', // Date of the last repetition   <-
        eventLocation: '', // eventLocation of the event
        type: 'event',
        //notify: false,
    });

    return (
        <EventContext.Provider value={{ events, setEvents, eventData, setEventData }}>
            {children}
        </EventContext.Provider>
    );
};
