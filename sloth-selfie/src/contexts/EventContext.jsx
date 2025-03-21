import React, { createContext, useContext, useState }  from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {

    const [event, setEvent] = useState({
        _id: '',
        title: '',
        user: '',
        type: 'personal',
        date: new Date(),
        time: '',
        isPreciseTime: false,
        duration: null,
        allDay: false,
        repeatFrequency: 'none',
        repeatMode: 'ntimes',
        repeatTimes: 0,
        repeatEndDate: null,
        eventLocation: '',
        sharedWith: [],
        notify: false,
        notificationTime: 0,
    });

    const [events, setEvents] = useState([]);

    const resetEvent = () => {
        setEvent({
            _id: '',
            title: '',
            user: '',
            type: 'personal',
            date: new Date(),
            time: '',
            isPreciseTime: false,
            duration: null,
            allDay: false,
            repeatFrequency: 'none',
            repeatMode: 'ntimes',
            repeatEndDate: null,
            repeatTimes: 0,
            eventLocation: '',
            sharedWith: [],
            notify: false,
            notificationTime: 0,
        });
    }

    return (
        <EventContext.Provider value={{ event, setEvent, events, setEvents, resetEvent }}>
            {children}
        </EventContext.Provider>
    )
}

export const useEvent = () => useContext(EventContext);