import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './css/App.css';
import './css/Calendar.css';
import moment from 'moment';
import { handleDataChange, normalizeData, updateOverdueActivities, handleAbortDelete, handleConfirmDelete, handleClosePopup, fetchData, handleFillForm, handleUpdateDataOnDrop, handleDeleteRepeatedEvent } from './CalendarUtils';
import EventsFunction from './Events';
import ActivitiesFunction from './Activities';
import iconBack from './media/leftBackArrow.svg';
import CalendarNoAvailability from './CalendarNoAvailability';

//TODO: edit di eventi ripetuti: non vedo cambiamenti finchè non faccio refresh manuale di pagina
//problemi: non si precompila correttamente sharedwith e receivers quando seleziono/modifico un evento o attività

const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(BigCalendar);


function Calendar() {

    const [selectingView, setSelectingView] = useState(true);
    const [inEvent, setInEvent] = useState(true);

    const [events, setEvents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [updateAllFutureEvents, setUpdateAllFutureEvents] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [receivers, setReceivers] = useState([]);
    const [triggerReceiversReset, setTriggerReceiversReset] = useState(0);
    const [showNoAvailabilityForm, setShowNoAvailabilityForm] = useState(false);
    const notificationDefaults = {
        notify: false,
        notificationTime: '0',
        customValue: '',
        notificationRepeat: '0',
        notificationType:{
            email: false,
            OS: false,
            SMS: false,
        },
    };

    // Define the event data structure
    const [eventData, setEventData] = useState({
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
        type: 'event',
        sharedWith: [],
        ...notificationDefaults,
    });

    //Define the activity data structure
    const [activityData, setActivityData] = useState({
        title: "",
        deadline: "",
        completed: false,
        type: 'activity',
        sharedWith: [],
        ...notificationDefaults,
    });

    useEffect(() => {
        fetchData('events', setEvents);
        fetchData('activities', setActivities);
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

    //setting the date to the current date as a filter at the start
    useEffect(() => {
        if (!isEditing) {
            if (inEvent) {
                handleDataChange('date', new Date().toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'), setEventData);
            } else {
                handleDataChange('deadline', new Date().toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'), setActivityData);
            }
        }
    }, [isEditing, inEvent]);


    const onEventDrop = ({event, start}) => {
        const end = new Date(start);
        console.log("Event dropped:", event, start, end);
        if (event.type === 'event') {
            handleUpdateDataOnDrop(event, start, events, setEvents);
        } else if (event.type === 'activity') {
            handleUpdateDataOnDrop(event, start, activities, setActivities);
        }
    };


    //Call handelEventClick or handleActivityClick
    const onItemSelect = (item) => {
        if (!item._id){
            console.log('Missing ID for the selected item', item);
            return;
        }

        if (item.type === 'event') {
            handleFillForm(item, setEventData, setIsEditing, handleSelection, setSelectedEvent, setReceivers);
        } else if (item.type === 'activity') {
            handleFillForm(item, setActivityData, setIsEditing, handleSelection, setSelectedActivity, setReceivers);
        }
        
    };

    //Delete the selected event
    const selectionDelete = () => {
        if(updateAllFutureEvents){
            handleDeleteRepeatedEvent(selectedEvent, setEvents, setIsEditing, setSelectedEvent);
        } else {
            handleConfirmDelete('event', selectedEvent, setShowConfirmation, events, setEvents, setSelectedEvent, setIsEditing, setEventData);
        }
    };

    // Ensure events is an array
    console.log(events);

    return (
        <div className="calendar">
            <div className="div-calendar-container">
                <DnDCalendar
                    localizer={localizer}
                    events={[...normalizeData(activities, 'activity'), ...normalizeData(events, 'event')]}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={onItemSelect}
                    titleAccessor="title"
                    className='calendar-main'
                    onEventDrop={onEventDrop}
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
                        <p>Shared with: 
                            {Array.isArray(selectedEvent.sharedWith) && selectedEvent.sharedWith.length > 0 
                                ? (selectedEvent.sharedWith.join(', '))
                                : 'No users shared with'}
                        </p>
                        
                        <div>
                            <button className="btn btn-main" onClick={() => setShowConfirmation(true)}>
                                Delete
                            </button>
                            <button className="btn btn-main" onClick={() => handleClosePopup('event', setSelectedEvent, setIsEditing, setEventData)}>
                                X
                            </button>
                        </div>

                        {showConfirmation && (
                            <div className="popup-delete">
                                <h2>Are you sure you want to delete this event?</h2>
                                <div>
                                    <button className="btn btn-main" onClick={() => selectionDelete()}>
                                        Yes
                                    </button>
                                    <button className="btn btn-main" onClick={() => handleAbortDelete(setShowConfirmation, 'event', setIsEditing, setEventData)}>
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
                        <p>Due: {new Date(selectedActivity.deadline).toLocaleDateString()}</p>
                        <p>Completed: {selectedActivity.completed ? 'Yes' : 'No'}</p>
                        <p>Shared with: 
                            {Array.isArray(selectedActivity.sharedWith) && selectedActivity.sharedWith.length > 0 
                                ? (selectedActivity.sharedWith.join(', '))
                                : 'No users shared with'}
                        </p>

                        <div>
                            <button className='btn btn-main' onClick={() => setShowConfirmation(true)}>
                                Delete
                            </button>
                            <button className='btn btn-main' onClick={() => handleClosePopup('activity', setSelectedActivity, setIsEditing, setActivityData)}>
                                X
                            </button>
                        </div>
                        
                        {showConfirmation && (
                            <div className="popup-delete">
                                <h2>Are you sure you want to delete this activity?</h2>
                                <div>
                                    <button className='btn btn-main' onClick={() => handleConfirmDelete('activity', selectedActivity, setShowConfirmation, activities, setActivities, setSelectedActivity, setIsEditing, setActivityData)}>Yes</button>
                                    <button className='btn btn-main' onClick={() => handleAbortDelete(setShowConfirmation, 'activity', setIsEditing, setActivityData)}>No</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {selectingView ? (
                <div className='selecting-view'>
                    <button  
                    className="btn-small-blue"
                    onClick={() => setShowNoAvailabilityForm(!showNoAvailabilityForm)}
                >
                    {showNoAvailabilityForm ? 'Close No Availability Form' : 'Insert No Availability'}
                </button>

                {/* shows the component only if the form is open*/}
                {showNoAvailabilityForm && (
                    <CalendarNoAvailability />
                )}
                    <h2>What would you like to add?</h2>
                    <div className='btn-container'>
                        <button className='btn btn-main' onClick={() => handleSelection(false)}>Activity</button>
                        <button className='btn btn-main' onClick={() => handleSelection(true)}>Event</button>
                    </div>
                </div>
            ) : (
                <div className='activity-event-container'>
                    <button className='btn btn-main' onClick={() => handleBack()}>
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
                            
                            receivers={receivers}
                            setReceivers={setReceivers}
                            triggerReceiversReset={triggerReceiversReset}
                            setTriggerReceiversReset={setTriggerReceiversReset}
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

                            receivers={receivers}
                            setReceivers={setReceivers}
                            triggerReceiversReset={triggerReceiversReset}
                            setTriggerReceiversReset={setTriggerReceiversReset}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
// Export the function and the events list
export default Calendar;