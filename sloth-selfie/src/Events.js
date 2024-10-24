import React, { useState, useEffect , useContext} from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import './css/Events.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { handleEventDataChange, convertAllDayToTimedEvent, generateRepeatedEvents, normalizeEvents, handleDeleteEvent, handleUpdateEvent, handleAbortDelete, handleConfirmDelete, handleClosePopupE} from './EventUtils';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import Select from 'react-select';

//TODO: edit di eventi ripetuti(vanno solo title e location) e non vanno edit e delete di updateAllFutureInstances
//TODO: cliccando su evento compila il form sbagliando il campo data, mette il giorno prima

const localizer = momentLocalizer(moment);

const initialEvents = [
  // Puoi aggiungere alcuni eventi di esempio qui 
  // { title: 'Meeting', date: '2024-09-28', time: '14:00', duration: 2 },
  {id: 1, originalId:1, title: 'Coffee with John',date: '2024-10-24',time: '16:00',duration: 1, repeatFrequency: 'none',repeatEndDate: '', allDay: false,},
];

function EventsFunction() {
    const { updateStyles, updateIcon } = useContext(StyleContext);
    const [events, setEvents] = useState(initialEvents || []);
    const [filterDate, setFilterDate] = useState(new Date()); // default day: today
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [updateAllFutureEvents, setUpdateAllFutureEvents] = useState(false); // option to choose in the editing form
    const [isEditing, setIsEditing] = useState(false);

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
    repeatFrequency: 'none', // Frequency of repetition
    repeatCount: null, // Number of repetitions
    repeatMode: 'ntimes', // Mode of repetition
    repeatEndDate: '', // Date of the last repetition
    eventLocation: '', // eventLocation of the event
    });

    // change style page onload document
    useEffect(() => {
        updateStyles(true);
        updateIcon(iconDark);

        return () => {
            updateStyles(false);
            updateIcon(iconLight);
        };
    }, [updateIcon, updateStyles]);

    useEffect(() => {
        //setting the date to the current date as a filter at the start
        const today = new Date();
        handleEventDataChange('filterDate', today, setEventData);
    }, []);

        useEffect(() => {
            if (selectedEvent) {
            console.log("Selected event:", selectedEvent);
            
            // Pre-fill the form with the selected event using handleEventDataChange
            handleEventDataChange('id', selectedEvent.id, setEventData);
            handleEventDataChange('originalId', selectedEvent.id ,setEventData);
            handleEventDataChange('title', selectedEvent.title ,setEventData);
            
            // Set date in YYYY-MM-DD format
            handleEventDataChange(
                'date',
                selectedEvent.start ? new Date(selectedEvent.start).toISOString().substring(0, 10) : '',
                setEventData
            );
            
            // Set time in HH:MM format
            handleEventDataChange(
                'time',
                selectedEvent.start ? new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                setEventData
            );
            
            handleEventDataChange('duration', selectedEvent.duration || 1, setEventData);
            handleEventDataChange('allDay', selectedEvent.allDay, setEventData);
            
            // Set number of days based on whether it's an all-day event
            handleEventDataChange('days', selectedEvent.allDay ? selectedEvent.duration : 1, setEventData);
            
            handleEventDataChange('repeatFrequency', selectedEvent.repeatFrequency, setEventData);
            handleEventDataChange('repeatCount', selectedEvent.repeatCount, setEventData);
            handleEventDataChange('repeatEndDate', selectedEvent.repeatEndDate, setEventData);
            handleEventDataChange('eventLocation', selectedEvent.eventLocation, setEventData);
            
            console.log("Form prefilled", selectedEvent);
            }
        }, [selectedEvent]);

    function handleEventClick(event) {
        console.log("Event clicked:", event);
        
        // Set the selected event and enable editing mode
        setSelectedEvent(event);
        setIsEditing(true);
    }

    // Function to generate time options
        
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
        for (let minutes of [0, 15, 30, 45]) {
            const formattedHour = hour < 10 ? `0${hour}` : hour;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            options.push({ value: `${formattedHour}:${formattedMinutes}`, label: `${formattedHour}:${formattedMinutes}` });
        }
        }
        return options;
    };
    
    const options = generateTimeOptions();

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
        };
    
        if (eventData.allDay) {
        newEvent = convertAllDayToTimedEvent(newEvent);
        }
    
        // If we have a repeat frequency, generate repeated events
        if (eventData.repeatFrequency !== 'none') {
        let repeatedEvents = [];
    
        if (eventData.repeatMode === 'until' && eventData.repeatEndDate) {
            // Generate events based on an end date
            repeatedEvents = generateRepeatedEvents(newEvent, eventData.repeatEndDate);
        } else if (eventData.repeatMode === 'ntimes' && eventData.repeatCount) {
            // Generate events based on a number of repetitions N
            repeatedEvents = generateRepeatedEvents(newEvent, null, eventData.repeatCount);
        }
    
        setEvents([...events, ...repeatedEvents]);
        console.log("Current Events:", [...events, ...repeatedEvents]);
        } else {
        setEvents([...events, newEvent]);
        console.log("Current Events:", [...events, newEvent]);
        }
    
        // Reset input fields using handleEventDataChange
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
    return (
        <div className="Event">
        <div className="div-calendar-container">
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
                style={{ height: "60vh" }}
                components={{
                //event: EventComponent
                }}
            />
            {/* Display popup for the selected activity */}
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
                    <button
                    className="btn"
                    onClick={() =>
                        handleClosePopupE(setSelectedEvent, setIsEditing, setEventData)
                    }
                    >
                    X
                    </button>
                </div>
                {showConfirmation && (
                    <div className="popup-delete">
                    <h2>Are you sure you want to delete this event?</h2>
                    <div>
                        <button
                        className="btn"
                        onClick={() =>
                            handleConfirmDelete(
                            selectedEvent,
                            setShowConfirmation,
                            handleDeleteEvent,
                            events,
                            setEvents,
                            setSelectedEvent,
                            setIsEditing,
                            setEventData
                            )
                        }
                        >
                        Yes
                        </button>
                        <button className="btn" onClick={() => handleAbortDelete(setShowConfirmation)}>
                        No
                        </button>
                    </div>
                    </div>
                )}
                </div>
            )}
            </div>
        </div>
    
        <div className="container-events-add">
            <h2>{selectedEvent ? "Edit Event" : "Add Event"}</h2>
            <form
            onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submit triggered");
                if (selectedEvent) {
                console.log("Submitting update for event:", selectedEvent);
                handleUpdateEvent(e, eventData, setEventData, events, setEvents, setSelectedEvent, updateAllFutureEvents, setIsEditing);
                } else {
                handleAddEvent(e);
                }
            }}
            >
            <label>Event Title:
                <input
                type="text"
                placeholder="Add Title"
                value={eventData.title}
                onChange={(e) => handleEventDataChange("title", e.target.value, setEventData)}
                required
                />
            </label>
            <br />
    
            <label>Event Date:
                <input
                type="date"
                value={eventData.date}
                onChange={(e) => handleEventDataChange("date", e.target.value, setEventData)}
                required
                />
            </label>
            <br />
    
            <label>
                <input
                className="checkbox"
                type="checkbox"
                checked={eventData.allDay}
                onChange={(e) => handleEventDataChange("allDay", e.target.checked, setEventData)}
                />
                All Day
            </label>
            <br />
    
            {!eventData.allDay ? (
                <>
                <div className="time-filter">
                    <label>
                    <input
                        className="checkbox"
                        type="checkbox"
                        checked={eventData.isPreciseTime}
                        onChange={(e) =>
                        handleEventDataChange("isPreciseTime", e.target.checked, setEventData)
                        }
                    />
                    Use Precise Time
                    </label>
    
                    {eventData.isPreciseTime ? (
                    <input
                        type="time"
                        value={eventData.time}
                        onChange={(e) => handleEventDataChange("time", e.target.value, setEventData)}
                        required
                    />
                    ) : (
                    <Select
                        value={options.find((option) => option.value === eventData.time)}
                        onChange={(selectedOption) =>
                        handleEventDataChange("time", selectedOption.value, setEventData)
                        }
                        options={options}
                        isSearchable
                        styles={{
                        menu: (provided) => ({
                            ...provided,
                            maxHeight: 200,
                        }),
                        menuList: (provided) => ({
                            ...provided,
                            maxHeight: 200,
                        }),
                        }}
                    />
                    )}
                </div>
                <label>Duration:
                    <input
                    type="number"
                    placeholder="hours"
                    value={eventData.duration}
                    onChange={(e) => handleEventDataChange("duration", e.target.value, setEventData)}
                    min="1"
                    required
                    />
                </label>
                </>
            ) : (
                <label>Number of days:
                <input
                    type="number"
                    placeholder="Number of days"
                    value={eventData.days}
                    onChange={(e) => handleEventDataChange("days", e.target.value, setEventData)}
                    min="1"
                />
                </label>
            )}
            <br />
    
            {isEditing && (
                <label>
                <input
                    className="checkbox"
                    type="checkbox"
                    onChange={(e) =>
                    handleEventDataChange("updateAllFutureEvents", e.target.checked, setEventData)
                    }
                />
                Update all future instances
                <br />
                </label>
            )}
    
            <Select
                value={options.find((option) => option.value === eventData.repeatFrequency)}
                onChange={(selectedOption) => {
                handleEventDataChange("repeatFrequency", selectedOption.value, setEventData);
                if (selectedOption.value === "none") {
                    handleEventDataChange("repeatMode", "ntimes", setEventData);
                }
                }}
                options={[
                { value: "none", label: "No repetition" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
                ]}
                styles={{
                menu: (provided) => ({
                    ...provided,
                    maxHeight: 90,
                    overflowY: "auto",
                }),
                menuList: (provided) => ({
                    ...provided,
                    maxHeight: 90,
                }),
                }}
            />
            <br />
            {eventData.repeatFrequency !== "none" && (
                <div>
                <label>Repeat Mode:
                    <select
                    onChange={(e) => handleEventDataChange("repeatMode", e.target.value, setEventData)}
                    >
                    <option value="ntimes">N Times</option>
                    <option value="until">Until</option>
                    </select>
                </label>
                <br />
    
                {eventData.repeatMode === "ntimes" ? (
                    <label>Number of repetitions:
                    <input
                        type="number"
                        value={eventData.repeatCount}
                        onChange={(e) => handleEventDataChange("repeatCount", e.target.value, setEventData)}
                        defaultValue={1}
                        min="1"
                    />
                    </label>
                ) : (
                    <label>Repeat until:
                    <input
                        type="date"
                        value={eventData.repeatEndDate}
                        onChange={(e) =>
                        handleEventDataChange("repeatEndDate", e.target.value, setEventData)
                        }
                    />
                    </label>
                )}
                </div>
            )}
            <label>Event Location:
                <input
                type="text"
                placeholder="physical or virtual"
                value={eventData.eventLocation}
                onChange={(e) =>
                    handleEventDataChange("eventLocation", e.target.value, setEventData)
                }
                />
            </label>
            <button className="btn" type="submit">
                {selectedEvent ? "Save Changes" : "Add Event"}
            </button>
            </form>
        </div>
        </div>
    ); 
}
// Export the function and the events list
export { initialEvents };

export default EventsFunction;