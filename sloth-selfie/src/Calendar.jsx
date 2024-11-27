import React, { useState, useEffect , useContext} from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './css/App.css';
import './css/Calendar.css';
import moment from 'moment';
import { StyleContext } from './StyleContext';
import { handleEventDataChange, convertAllDayToTimedEvent, generateRepeatedEvents, normalizeEvents, handleDeleteEvent, handleAbortDeleteEvent, handleConfirmDeleteEvent, handleClosePopupE} from './EventUtils';
import { normalizeActivities, updateOverdueActivities, handleDeleteActivity, handleAbortDelete, handleConfirmDelete, handleClosePopupA} from './ActivityUtils';
import EventsFunction from './Events';
import ActivitiesFunction from './Activities';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import iconBack from './media/leftBackArrow.svg';

//TODO: edit di eventi ripetuti: non vanno edit e delete di updateAllFutureInstances e non aggiorna time e duration
//IL PROBLEMA STA NEI 3 CAMPI <- CHE RISULTANO UNDEFINED
//IL PROBLEMA STA NEL FETCH DEI CAMPI, MA TANTO POI DOVREMO PRENDERLI DAL DB E IL PROBLEMA RICOMINCIA...

const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(BigCalendar);

const initialEvents = [
  // Puoi aggiungere alcuni eventi di esempio qui 
  // { title: 'Meeting', date: '2024-09-28', time: '14:00', duration: 2 },
  {id: 1, originalId:1, title: 'Coffee with John',date: '2024-10-24',time: '16:00',duration: 1, repeatFrequency: 'none',repeatEndDate: '', allDay: false,},
];


const initialActivities = [
    // Puoi aggiungere alcune attività di esempio qui 
    {id: 1, title: 'Study Math', deadline: '2024-10-22', completed: false },
    {id: 2, title: 'Write Report', deadline: '2024-10-25', completed: false }
];


function Calendar() {

    const [selectingView, setSelectingView] = useState(true);
    const [inEvent, setInEvent] = useState(true);

    const { updateStyles, updateIcon } = useContext(StyleContext);
    const [events, setEvents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [updateAllFutureEvents, setUpdateAllFutureEvents] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [username, setUsername] = useState("");//username of the authenticated user

    // Define the event data structure
    const [eventData, setEventData] = useState({
        id: "",
        originalId: "",
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
        userId: '', // User ID of whom creates the event
    });

    //Define the activity data structure
    const [activityData, setActivityData] = useState({
        id: "",
        title: "",
        deadline: "",
        completed: false,
        userId: '', // User ID of whom creates the event
    });

    useEffect(() => {
        updateStyles(true);
        updateIcon(iconDark);

        return () => {
            updateStyles(false);
            updateIcon(iconLight);
        };
    }, [updateIcon, updateStyles]);

    // Get the username of the authenticated user
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user/username', {
        credentials: 'include'
        });const data = await response.json();
        console.log('Username:', data.username);
        setUsername(data.username);
    } catch (error) {
        console.error('Error fetching username:', error);
    }
    };

    fetchUsername();
}, []); 
       

    // Function to fetch events from the server
    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/events', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Function to fetch activities from the server
    const fetchActivities = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/activities', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);
            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchActivities();
    }, []);

    //checking for overdue activities
    useEffect(() => {
        const overdueActivities = activities.filter(activity => 
            new Date(activity.deadline) < new Date() && !activity.completed
        );
    
        // Update the deadline of overdue activities to today
        if (overdueActivities.length > 0) {
            updateOverdueActivities(activities, setActivities);
        }
    }, [activities]);

    const handleSelection = (event) => {
        setSelectingView(false);
        setInEvent(event);
    };

    const handleBack = () => {
        setSelectingView(true);
    };

    const handleEventClick = (event) => {
        console.log("Event clicked:", event);
        setSelectedEvent(event);
        setIsEditing(true);
        handleSelection(true);
    };

    const handleActivityClick = (activity) => {
        console.log("Activity clicked:", activity);
        setSelectedActivity(activity);
        setIsEditing(true);
        handleSelection(false);
    };

    //setting the date to the current date as a filter at the start
    useEffect(() => {
        handleEventDataChange('date', new Date(), setEventData);
    }, []);

    const handleChangeEvent = () => {

        const isRepeated = selectedEvent.repeatFrequency !== 'none';
        console.log("repeated event", isRepeated);
        console.log("repedetion", selectedEvent.repeatFrequency);

        setEventData({
            id: selectedEvent.id,
            originalId: selectedEvent.originalId,
            title: selectedEvent.title,
            date: !isRepeated && selectedEvent.date
                ? selectedEvent.date
                : new Date(selectedEvent.start).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'),
            time: selectedEvent.time || '00:00',
            isPreciseTime: selectedEvent.isPreciseTime,
            duration: selectedEvent.duration || 1,
            allDay: selectedEvent.allDay,
            days: selectedEvent.allDay ? selectedEvent.duration : 1,
            repeatFrequency: isRepeated ? selectedEvent.repeatFrequency : "none", //boh continua a darmi i default qui, forse devo mettere un campo isRepeated?
            repeatCount: isRepeated ? selectedEvent.repeatCount : 1, //qui
            repeatEndDate: isRepeated ? selectedEvent.repeatEndDate : "", //e qui
            repeatMode: isRepeated ? selectedEvent.repeatMode : "ntimes",
            eventLocation: selectedEvent.eventLocation || "",
            userId: selectedEvent.userId,
        });

        console.log("eventData", eventData);
        console.log("Form prefilled", selectedEvent);
    };

    useEffect(() => {
        if (selectedEvent) {
            handleChangeEvent();
        }
    }, [selectedEvent]);

    const handleAddEvent = (e) => {
        e.preventDefault();

        let newEvent = {
            id: events.length + 1,
            originalId: events.length + 1,
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            duration: eventData.allDay ? eventData.days : eventData.duration,
            allDay: eventData.allDay,
            repeatFrequency: eventData.repeatFrequency,
            repeatEndDate: eventData.repeatEndDate,
            eventLocation: eventData.eventLocation,
            userId: eventData.userId,
        };

        if (eventData.allDay) {
            newEvent = convertAllDayToTimedEvent(newEvent);
        }

        if (eventData.repeatFrequency !== 'none') {
            let repeatedEvents = [];

            //until or ntimes
            if (eventData.repeatMode === 'until' && eventData.repeatEndDate) {
                repeatedEvents = generateRepeatedEvents(newEvent, eventData.repeatEndDate);
            } else if (eventData.repeatMode === 'ntimes' && eventData.repeatCount) {
                repeatedEvents = generateRepeatedEvents(newEvent, null, eventData.repeatCount);
            }
            setEvents([...events, ...repeatedEvents]);
        } else {
            setEvents([...events, newEvent]);
        }

        // Reset input fields
        handleEventDataChange('id', '', setEventData);
        handleEventDataChange('originalId', '', setEventData);
        handleEventDataChange('title', '', setEventData);
        handleEventDataChange('date', '', setEventData);
        handleEventDataChange('time', '00:00', setEventData);
        handleEventDataChange('duration', '', setEventData);
        handleEventDataChange('allDay', false, setEventData);
        handleEventDataChange('days', 1, setEventData);
        handleEventDataChange('repeatFrequency', 'none', setEventData);
        handleEventDataChange('repeatEndDate', '', setEventData);
        handleEventDataChange('repeatCount', '', setEventData);
        handleEventDataChange('eventLocation', '', setEventData);
    
        setIsEditing(false);
        setUpdateAllFutureEvents(false); 
    };

    const onEventDrop = ({ event, start, end }) => {
        const updatedEvent = { ...event, start, end };
        const updatedEvents = events.map((e) => (e.id === event.id ? updatedEvent : e));
        setEvents(updatedEvents);
    }

    const onActivityDrop = ({ activity, start, end }) => {
        const updatedActivity = { ...activity, start, end };
        const updatedActivities = activities.map((a) => (a.id === activity.id ? activity : a));
        setActivities(updatedActivities);
    }


    return (
        <div className="calendar">
            <div className="div-calendar-container">
                <DnDCalendar
                    localizer={localizer}
                    events={[...normalizeActivities(activities), ...normalizeEvents(events)]}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={inEvent ? handleEventClick : handleActivityClick}
                    titleAccessor="title"
                    style={{ height: "60vh" }}
                    onEventDrop={onEventDrop}
                    onActivityDrop={onActivityDrop}
                    resizable
                />

                {selectedEvent && (
                    <div className="popup">
                        <h2>Editing mode:</h2>
                        <h2>{selectedEvent.title}</h2>
                        <p>Location: {selectedEvent.eventLocation}</p>
                        <p>Start: {new Date(selectedEvent.start).toLocaleString()}</p>
                        <p>End: {new Date(selectedEvent.end).toLocaleString()}</p>
                        <p>All Day: {selectedEvent.allDay ? 'Yes' : 'No'}</p>
                        
                        <div>
                            <button className="btn" onClick={() => setShowConfirmation(true)}>
                                Delete
                            </button>
                            <button className="btn" onClick={() => handleClosePopupE(setSelectedEvent, setIsEditing, setEventData)}>
                                X
                            </button>
                        </div>

                        {showConfirmation && (
                            <div className="popup-delete">
                                <h2>Are you sure you want to delete this event?</h2>
                                <div>
                                    <button className="btn" onClick={() => handleConfirmDeleteEvent(selectedEvent, setShowConfirmation, handleDeleteEvent, events, setEvents, setSelectedEvent, setIsEditing, setEventData)}>
                                        Yes
                                    </button>
                                    <button className="btn" onClick={() => handleAbortDeleteEvent(setShowConfirmation)}>
                                        No
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedActivity && (
                    <div className="popup">
                        <h2>Editing mode:</h2>
                        <h2>{selectedActivity.title}</h2>
                        <p>Due: {selectedActivity.deadline}</p>
                        <p>Completed: {selectedActivity.completed ? 'Yes' : 'No'}</p>

                        <div>
                            <button className='btn' onClick={() => setShowConfirmation(true)}>
                                Delete
                            </button>
                            <button className='btn' onClick={() => handleClosePopupA(setSelectedActivity, setActivityData)}>
                                X
                            </button>
                        </div>
                        
                        {showConfirmation && (
                            <div className="popup-delete">
                                <h2>Are you sure you want to delete this activity?</h2>
                                <div>
                                    <button className='btn' onClick={() => handleConfirmDelete(selectedActivity, setShowConfirmation, handleDeleteActivity, activities, setActivities, setSelectedActivity, setActivityData)}>Yes</button>
                                    <button className='btn' onClick={() => handleAbortDelete(setShowConfirmation)}>No</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {selectingView ? (
                <div className='selecting-view'>
                    <h2>What would you like to add?</h2>
                    <div className='btn-container'>
                        <button className='btn' onClick={() => handleSelection(false)}>Activity</button>
                        <button className='btn' onClick={() => handleSelection(true)}>Event</button>
                    </div>
                </div>
            ) : (
                <div className='activity-event-container'>
                    <button className='btn' onClick={() => handleBack()}>
                        <img src={iconBack} alt="back" className="icon" />
                    </button>
                    {inEvent ? (
                        <EventsFunction
                            events={events}
                            setEvents={setEvents}
                            eventData={eventData}
                            setEventData={setEventData}

                            isEditing={isEditing}
                            setIsEditing={setIsEditing}

                            selectedEvent={selectedEvent}
                            setSelectedEvent={setSelectedEvent}
                            updateAllFutureEvents={updateAllFutureEvents}
                            setUpdateAllFutureEvents={setUpdateAllFutureEvents}
                            handleAddEvent={handleAddEvent}
                        />
                    ) : (
                        <ActivitiesFunction
                            activityData={activityData}
                            setActivityData={setActivityData}

                            activities={activities}
                            setActivities={setActivities}

                            isEditing={isEditing}
                            setIsEditing={setIsEditing}

                            selectedActivity={selectedActivity}
                            setSelectedActivity={setSelectedActivity}

                        />
                    )}
                </div>
            )}
        </div>
    );
}
// Export the function and the events list
export { initialEvents };


// Export the function and the Activities list
export { initialActivities };

export default Calendar;