import React, { createContext, useContext, useState }  from 'react';

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {

    //Activity state
    const [activity, setActivity] = useState({
        _id: '',
        title: '',
        user: '',
        deadline: '',
        late: false,
        date: '',
        completed: false,
        sharedWith: [],
        notify: false,
        notificationTime: 0,
    });

    const [activities, setActivities] = useState([]);

    const resetActivity = () => {
        setActivity({
            _id: '',
            title: '',
            user: '',
            deadline: '',
            late: false,
            date: '',
            completed: false,
            sharedWith: [],
            notify: false,
            notificationTime: 0,
        });
    }

    //Event state
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

    const addImportedEvents = (newEvents) => {
        setEvents(prev => [...prev, ...newEvents]);
        //setActivities(prev => [...prev, ...newEvents]); //TEST FINCHè EVENTS NON VA, ANCHE NEL BACK
    };

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

    //Availability state
    const [availability, setAvailability] = useState({
        _id: '',
        startDate: new Date(),
        endDate: new Date(),
        startTime: '00:00',
        days: true,
        duration: 1,
        repeatFrequency: 'none',
        numberOfOccurrences: 0,
    });

    const [availabilities, setAvailabilities] = useState([]);

    const resetAvailability = () => {
        setAvailability({
            _id: '',
            startDate: new Date(),
            endDate: new Date(),
            startTime: '00:00',
            days: true,
            duration: 1,
            repeatFrequency: 'none',
            numberOfOccurrences: 0,
        });
    }

    //edit or add state
    const [selected, setSelected] = useState({
        selection: '...',
        edit: false,
        add: false,
        popup: false,
    });

    const select = (selection, edit) => {
        setSelected({
            ...selected,
            selection: selection,
            edit: edit,
            add: !edit
        });
    }

    const back = () => {
        if (selected.edit) resetSelected();
        else {
            setSelected({
                ...selected,
                selection: '...',
                add: false
            });
        }
        setNotifications([]);
    }

    const resetSelected = () => {
        setSelected({
            selection: '...',
            edit: false,
            add: false,
            popup: false,
        });
    }

    const [notifications, setNotifications] = useState([]);

    // disable save button if conditions are not met
    const [conditionsMet, setConditionsMet] = useState(false);

    return (
        <CalendarContext.Provider 
            value={{ activity, setActivity, activities, setActivities, resetActivity,
                event, setEvent, events, setEvents, addImportedEvents, resetEvent,
                availability, setAvailability, availabilities, setAvailabilities, resetAvailability,
                selected, setSelected, select, back, resetSelected, notifications, setNotifications, conditionsMet, setConditionsMet, }}>

            {children}
            
        </CalendarContext.Provider>
    )
}

export const useCalendar = () => useContext(CalendarContext);