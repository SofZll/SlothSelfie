
import Swal from "sweetalert2";
import { resetReceivers } from "./globalFunctions";
import { set } from "mongoose";

//Functoin to handle change the current Event or Activity data
export function handleDataChange(field, value, setData) {
    setData((prevData) => {
        const updatedData = {
            ...prevData,
            [field]: value,
        };
        //console.log(`Updated data (${field} = ${value}):`, updatedData);
        return updatedData;
    });
}

const setStartEnd = (data, type) => {
    let startDate, endDate;

    if (type === "activity") {
        endDate = new Date(data.deadline);
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
        
    } else if (type === "event") {
        startDate = new Date(data.date);

        
        if (data.allDay) {
            //Set end = start + duration
            endDate = new Date(startDate.getTime() + (Number(data.duration)-1) * 24 * 60 * 60 * 1000);
            // Set the start at 08:00 and end midnight
            startDate.setHours(8, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else {
            startDate.setHours(data.time.split(":")[0], data.time.split(":")[1], 0, 0);
            //set endDate il giorno dopo a startDate
            endDate = new Date(startDate.getTime() + Number(data.duration) * 60 * 60 * 1000);
        }
    }

    return {startDate, endDate};
}


// Convert Data to the format required by React Big Calendar
export function normalizeData (datas, type) {
    if (!Array.isArray(datas)) {
        console.error("normalizeData expects an array, but got:", datas);
    }
    //console.log("Data to normalize:", datas);

    return (type === "activity" ? datas.filter(data => !data.completed) : datas).map((data) => {

        const { startDate, endDate } = setStartEnd(data, type);


        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error(`Invalid date for event: ${JSON.stringify(data)}`);
            return {
                _id: data._id,
                title: data.title,
                start: new Date(),
                end: new Date(),
                ...getNotificationData(data),
                ...(type === "activity" ? 
                    {
                        deadline: new Date(),
                        completed: data.completed,
                        sharedWith: data.sharedWith,
                    } : {
                        time: data.time,
                        itLast: data.duration,
                        isPreciseTime: data.isPreciseTime,
                        allDay: data.allDay,
                        repeatFrequency: data.repeatFrequency,
                        repeatMode: data.repeatMode,
                        repeatEndDate: data.repeatEndDate,
                        repeatCount: data.repeatCount,
                        eventLocation: data.eventLocation,
                        originalId: data.originalId,
                        sharedWith: data.sharedWith,
                    }
                ),
                type: type
            };
        }
        
        return {
            _id: data._id,
            title: data.title,
            start: startDate,
            end: endDate,
            ...getNotificationData(data),
            ...(type === "event" ?
                {
                    time: data.time,
                    itLast: data.duration,
                    isPreciseTime: data.isPreciseTime,
                    allDay: data.allDay,
                    repeatFrequency: data.repeatFrequency,
                    repeatMode: data.repeatMode,
                    repeatEndDate: data.repeatEndDate,
                    repeatCount: data.repeatCount,
                    eventLocation: data.eventLocation,
                    originalId: data.originalId,
                    sharedWith: data.sharedWith,
                } : {
                    deadline: data.deadline,
                    completed: data.completed,
                    sharedWith: data.sharedWith,
                    notify: data.notify,
                    notificationTime: data.notificationTime,
                }
            ),
            type: type
        };
    });
};

function getNotificationData(data) {
    return {
        notify: data.notify,
        notificationTime: data.notificationTime,
        customValue: data.customValue,
        notificationRepeat: data.notificationRepeat,
        notificationType: data.notificationType,
    };
}

//Function to save data in front and clean the form
export function resetInputFiels(type, setData, setIsEditing) {
    
    
    if (type === "activity") {
        handleDataChange('id', '', setData);
        handleDataChange('title', '', setData);
        handleDataChange('deadline', '', setData);
        handleDataChange('completed', false, setData);
        handleDataChange('sharedWith', [], setData);
    } else if (type === "event") {
        handleDataChange('id', '', setData);
        handleDataChange('originalId', '', setData);
        handleDataChange('title', '', setData);
        handleDataChange('date', '', setData);
        handleDataChange('time', '00:00', setData);
        handleDataChange('isPreciseTime', false, setData);
        handleDataChange('duration', '', setData);
        handleDataChange('allDay', false, setData);
        handleDataChange('days', 1, setData);
        handleDataChange('repeatFrequency', "none", setData);
        handleDataChange('repeatEndDate', '', setData);
        handleDataChange('repeatCount', 1, setData);
        handleDataChange('eventLocation', '', setData);
        handleDataChange('sharedWith', [], setData);
    }

    handleDataChange('notify', false, setData);
    handleDataChange('notificationTime', '0', setData);
    handleDataChange('customValue', '', setData);
    handleDataChange('notificationRepeat', '0', setData);
    handleDataChange('notificationType', {
        email: false,
        OS: false,
        SMS: false,
    }, setData);

    setIsEditing(false);
}

//Function to handle set of new data
export async function newData2Add(data, originalId, receivers) {
    
    
    if (data.type === "activity") {
        const { deadline, title, notify, notificationTime, customValue, notificationRepeat, notificationType} = data;
        const newData = {
            title: title,
            deadline: deadline,
            completed: false,
            type: "activity",
            notify: notify,
            notificationTime: notificationTime,
            customValue: customValue,
            notificationRepeat: notificationRepeat,
            notificationType: notificationType,
            sharedWith: receivers,
        };

        return newData;
    } else if (data.type === "event") {
        const { title, date, time, duration, allDay, eventLocation, isPreciseTime, repeatFrequency, repeatEndDate, notify, notificationTime, customValue, notificationRepeat, notificationType} = data;
        const newData = {
            title: title,
            date: date,
            time: time,
            duration: allDay ? data.days : duration,
            isPreciseTime: isPreciseTime,
            allDay: allDay,
            repeatFrequency: repeatFrequency,
            repeatEndDate: repeatEndDate,
            eventLocation: eventLocation,
            type: "event",
            originalId: originalId,
            notify: notify,
            notificationTime: notificationTime,
            customValue: customValue,
            notificationRepeat: notificationRepeat,
            notificationType: notificationType,
            sharedWith: receivers,
        };

        return newData;
    }
}


// Handle adding an event or activity
export async function handleAddData(e, data, setData, datas, setDatas, setIsEditing, receivers, setReceivers, setTriggerResetReceivers) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const newData = await newData2Add(data, '', receivers);

    try {

        if (data.type === "event" ) {
           // First, check if users are available
            const { startDate, endDate } = data.start ? { startDate: new Date(data.start), endDate: new Date(data.end) } : setStartEnd(data, data.type);

            const isAvailable = await checkAvailabilityForSharedWith(receivers, startDate, endDate);

            if (!isAvailable) {
                return; // Don't add the event if there's a conflict
            }
        }

        // Proceed to add the event (if users are available)
        const response = await fetch(`http://localhost:8000/api/${data.type}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
        });

        if (!response.ok) {
            throw new Error(`Error adding ${data.type}: ${response.status}`);
        }

        // Get the saved data from the backend
        const savedData = await response.json();


        if (savedData) {

            setDatas([...datas, savedData]);
            resetInputFiels(data.type, setData, setIsEditing);
            resetReceivers(setReceivers, setTriggerResetReceivers);
        }
    } catch (error) {
        console.error(`Error adding ${data.type}:`, error);
    }
}


//Handle fetching data from the database
export async function fetchData (type, setData) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`Error fetching ${type}:`, response);
            return;
        }

        const data = await response.json();
        if (data) {
            setData(data);
        }
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
}


// Handle removing an activity and marking it as completed while pressing btn "Done"
export async function handleRemoveActivity(activityId, activities, setActivities) {
    if (!activityId) {
        console.error("ID dell'attività non trovato");
    }

    try{
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: 'DELETE',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Errore nella cancellazione Done della attività');
        }

        // Update the frontend
        const updatedActivities = activities.map(activity => {
            if (activity._id === activityId) {
                return { ...activity, completed: true };
            }
            return activity;
        });

        setActivities(updatedActivities);
    }catch (error) {
        console.error('Error while removing activity:', error);
    }
}

// Find and update overdue activities
export async function updateOverdueActivities(activities, setActivities) {
    const currentDate = new Date().toISOString().split('T')[0];

    const updatedActivities = await Promise.all(
        activities.map(async (activity) => {
            const activityDate = new Date(activity.deadline).toISOString().split('T')[0];
            
            if (activityDate < currentDate && !activity.completed) {
                try {
                    const response = await fetch(`/api/activity/${activity._id}`, {
                        method: 'PUT',
                        credentials: "include",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...activity, deadline: currentDate }),
                    });

                    if (!response.ok) {
                        throw new Error(`Error updating overdue activity: ${response.status}`);
                    }

                    const updatedActivity = await response.json();
                    if (updatedActivity) {
                        return updatedActivity;
                    }
                } catch (error) {
                    console.error('Error updating overdue activity:', error);
                    return activity;
                }
            }
            return activity;
        })
    );

    //If there are updated activities, update frontend
    const hasUpdated = updatedActivities.some(
        (activity, index) => activity.deadline !== activities[index].deadline
    );

    if (hasUpdated) {
        setActivities(updatedActivities);
    }
}

//Handle close popup
export function handleClosePopup(type, setSelectedData, setIsEditing, setData) {
    setSelectedData(null);


    resetInputFiels(type, setData, setIsEditing);
}

export function prepareSharedWith(receivers) {
    // Remove duplicates and empty strings
    return Array.from(new Set(receivers.map(receiver => receiver.trim()).filter(Boolean)));
}

//Function to handle the update of an event or activity
export async function handleUpdateData(e, data, setData, datas, setDatas, selectedData, setSelectedData, setIsEditing, receivers) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    try {
        if (data.type === "event" ) {
            // First, check if users are available
             const { startDate, endDate } = data.start ? { startDate: new Date(data.start), endDate: new Date(data.end) } : setStartEnd(data, data.type);
 
             const isAvailable = await checkAvailabilityForSharedWith(data.sharedWith, startDate, endDate);
             if (!isAvailable) {
                 return; // Don't add the event if there's a conflict
             }
         }

         const updatedSharedWith = receivers ? prepareSharedWith(receivers) : data.sharedWith; 
 
         // Proceed to edit the event (if users are available)
        const response = await fetch(`http://localhost:8000/api/${selectedData.type}/${selectedData._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(
                data.type === "activity" ? {
                    title: data.title,
                    deadline: data.deadline,
                    completed: data.completed,
                    sharedWith: updatedSharedWith,
                    ...getNotificationData(data),
                } : {
                    title: data.title,
                    date: data.date,
                    time: data.time,
                    duration: data.allDay ? data.days : data.itLast,
                    allDay: data.allDay,
                    repeatFrequency: data.repeatFrequency,
                    repeatEndDate: data.repeatEndDate,
                    repeatCount: data.repeatCount,
                    eventLocation: data.eventLocation,
                    sharedWith: updatedSharedWith,
                    ...getNotificationData(data),
                },
            ),
        });

        if (!response.ok) {
            throw new Error(`Error updating ${data.type}: ${response.status}`);
        }

        const updatedData = await response.json();

        const updatedDatas = datas.map((data) =>
            data._id === selectedData._id ? updatedData : data
        );

        setDatas(updatedDatas);
        handleClosePopup(data.type, setSelectedData, setIsEditing, setData);
    
    } catch (error) {
        console.error(`Error updating ${data.type}:`, error);
        Swal.fire({
            title: "Update failed",
            icon: "error",
            text: `Error updating ${data.type}`,
            customClass: {
                confirmButton: "button-alert",
            },
        });
    }
}

//Function to handle the deletion of an event or activity
export async function handleDeleteData(type, id, datas, setDatas, setSelectedData) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error deleting ${type}: ${response.status}`);
        }

        // Get the saved note from the backend
        const deletedData = await response.json();
        if (deletedData) {

            const updatedDatas = datas.filter((data) => data._id !== id);
            setDatas(updatedDatas);
            if (setSelectedData){
                setSelectedData(null);
            }
        }
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
    }
}

// Function to Abort the deletionS
export function handleAbortDelete(setShowConfirmation, type, setIsEditing, setData) {
    setShowConfirmation(false);
    resetInputFiels(type, setData, setIsEditing);
}

// Function to confirm the deletion of an event or activity
export function handleConfirmDelete(type, selectedData, setShowConfirmation, datas, setDatas, setSelectedData, setIsEditing, setData) {
    handleDeleteData(type, selectedData._id, datas, setDatas, setSelectedData);
    setShowConfirmation(false);
    handleClosePopup(type, setSelectedData, setIsEditing, setData);
}

//Function to handle the filling of the form with the selected event or activity
export function handleFillForm(data, setData, setIsEditing, handleSelection, setSelectedData, setReceivers) {
    
    setIsEditing(true);
    handleSelection(data.type === "event");

    if (data.type === "activity") {
        handleDataChange('title', data.title, setData);
        handleDataChange('deadline', data.deadline.split('T')[0], setData);
        handleDataChange('completed', data.completed, setData);
        handleDataChange('sharedWith', data.sharedWith, setData);
        setReceivers(data.sharedWith || []);
    } else if (data.type === "event") {
        handleDataChange('title', data.title, setData);
        handleDataChange('date', new Date(data.start).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'), setData);
        handleDataChange('isPreciseTime', data.isPreciseTime, setData);
        handleDataChange('time', new Date(data.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }), setData);
        handleDataChange('allDay', data.allDay, setData);
        if (data.allDay) {
            handleDataChange('days', data.itLast, setData);
        } else {
            handleDataChange('duration', data.itLast, setData);
        }
        if (data.repeatFrequency === "none") {
            handleDataChange('repeatFrequency', "none", setData);
        } else {
            handleDataChange('repeatFrequency', data.repeatFrequency, setData);
            handleDataChange('repeatMode', "until", setData);
            handleDataChange('repeatEndDate', data.repeatEndDate.split('T')[0], setData);
        }
        handleDataChange('eventLocation', data.eventLocation, setData);
        handleDataChange('sharedWith', data.sharedWith, setData);
        setReceivers(data.sharedWith || []);
    }

    setSelectedData(data);
}

//Function to update activity and event on drop (drag and drop)
export async function handleUpdateDataOnDrop(item, start, datas, setDetas) {
    if (!item) {
        console.error("Item not found");
        return;
    }

    let deadline, date;

    if (item.type === "activity") {
        deadline = new Date(start).toISOString().split('T')[0];
    } else if (item.type === "event") {
        date = new Date(start);
    }

    const updatedDatas = await Promise.all(
        datas.map(async (data) => {
            if (data._id === item._id) {
                try {
                    const response = await fetch(`/api/${item.type}/${item._id}`, {
                        method: 'PUT',
                        credentials: "include",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            ...item, 
                            ...(item.type === 'activity' 
                            ? { deadline }
                            : { date })
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Error updating activity: ${response.status}`);
                    }

                    const updatedData = await response.json();
                    if (updatedData) {
                        return updatedData;
                    }
                } catch (error) {
                    console.error('Error updating activity:', error);
                    return data;
                }
            }
            return data;
        })
    );

    setDetas(updatedDatas);
}

    


//Function to handle the update of a repeated event
export async function handleUpdateRepeatedEvent(data, setData, setIsEditing, selectedData, setSelectedData) {
    console.log("Final data before sending:", selectedData);
    try {
        const response = await fetch(`http://localhost:8000/api/event/original/${selectedData.originalId}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            console.error(`Error updating repeated events`, response);
        }

        // Parse the response to get the updated events
        const updatedResponse = await response.json();

        if (updatedResponse.updatedEvents) {
            const updatedEvents = updatedResponse.updatedEvents;
            console.log("Updated events:", updatedEvents);
            // Update all matching events in the state
            setData((prevData) => {
                const newData = prevData.map((event) => {
                    if (event.originalId === selectedData.originalId) {
                        const updatedEvent = updatedEvents.find((e) => e._id === event._id);
                        return updatedEvent ? { ...event, ...updatedEvent } : event;
                    }
                    return event; // keep the other events as they are
                });
                return [...newData]; // return the updated data
            });

            // Reset editing state
            setIsEditing(false);
            setSelectedData(null);
        } else {
            console.warn("No updated events returned by the server.");
        }
    }
    catch (error) {
        console.error(`Error updating repeated events:`, error);
    }
}


//Function to handle the deletion of a repeted events by the original id
export async function handleDeleteRepeatedEvent(data, setData, setIsEditing, setSelectedData) {
    try {
        const response = await fetch(`http://localhost:8000/api/event/original/${data.originalId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`Error deleting repeted events`, response);
        }

        // Get the saved note from the backend
        const deletedData = await response.json();
        if (deletedData.deletedEvents) {
            console.log(`Deleted repeated events:`, deletedData.deletedEvents); // array of objects
            // we remove all the repeated events with the same originalId
            setData((prevData) => {
                const updatedData = prevData.filter(event => event.originalId !== data.originalId);
                console.log('updatedData:', updatedData);
                return updatedData;
            });
            setIsEditing(false);
            setSelectedData(null);

            //handleDataChange('title', '', setData); ->questa causa problemi

            //resetInputFiels('event', setData, setIsEditing);
        }
    } catch (error) {
        console.error(`Error deleting repeted events:`, error);
    }

}

//Function to handle the calculation of the last date of a repeated event
export function calcLastDate(eventData) {
    let lastDate;
    const { date, repeatMode, repeatEndDate, repeatFrequency, repeatCount } = eventData;

    if (repeatMode === "until") {
        lastDate = repeatEndDate;
    } else if (repeatMode === "ntimes") {
        const currentDate = new Date(date);
        if (repeatFrequency === "daily") {
            currentDate.setDate(currentDate.getDate() + Number(repeatCount)-1);
        } else if (repeatFrequency === "weekly") {
            currentDate.setDate(currentDate.getDate() + (Number(repeatCount)-1) * 7);
        } else if (repeatFrequency === "monthly") {
            currentDate.setMonth(currentDate.getMonth() + Number(repeatCount)-1);
        } else if (repeatFrequency === "yearly") {
            currentDate.setFullYear(currentDate.getFullYear() + Number(repeatCount)-1);
        }
        lastDate = currentDate.toISOString().split('T')[0];

    }

    return lastDate;
}

//Function to generate the first event of a repeated event calling newDta2Add and return the original id
export async function generateEvent (data, originalId, receivers) {

    const newData = await newData2Add(data, originalId ? originalId : '', receivers);

    try {

        const response = await fetch(`http://localhost:8000/api/event`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
        });
        if (!response.ok) {
            throw new Error(`Error adding ${data.type}: ${response.status}`);
        }

        // Get the saved data from the backend
        const savedData = await response.json();


        if (savedData) {
            return savedData;
        }
    } catch (error) {
        console.error(`Error adding ${data.type}:`, error);
    }

    return null;

}

//Function to update the current date of a repeated event
export function updateCurrentDate(currentDate, repeatFrequency) {
    if (repeatFrequency === "daily") {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if (repeatFrequency === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
    } else if (repeatFrequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (repeatFrequency === "yearly") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
}

// Function to generate repeated events con handleAddData
export async function generateRepeatedEvents (e, eventData, events, setEvents, receivers) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const { date, repeatFrequency } = eventData;

    const newEvents = [];
    const events2Add = [];
    let currentDate = new Date(date);
    const lastDate = new Date(calcLastDate(eventData));

    const firstEventData = {
        ...eventData,
        date: currentDate.toISOString().split('T')[0],
        repeatEndDate: lastDate.toISOString().split('T')[0],
    };

    // check if the users are available for the first event
    const isFirstAvailable = await checkAvailabilityForSharedWith(receivers, new Date(firstEventData.date), new Date(firstEventData.date));
    if (!isFirstAvailable) {
        return; // Don't add the event if there's a conflict
    }

    // Add the first event
    const firstEvent = await generateEvent(firstEventData, '', receivers);
    if (!firstEvent) {
        console.error("Error generating first event");
        return
    }
    const originalId = firstEvent.originalId;

    events2Add.push(firstEvent);
    updateCurrentDate(currentDate, repeatFrequency);

    let hasConflict = false; // Flag to check if there are conflicts, in case we remove the first event and we add nothing

    while (currentDate <= lastDate) {
        const data2add = {
            ...eventData,
            date: currentDate.toISOString().split('T')[0],
            repeatEndDate: lastDate.toISOString().split('T')[0],
        };

        //check if the users are available for the repeated event
        const isAvailable = await checkAvailabilityForSharedWith(receivers, new Date(data2add.date), new Date(data2add.date));
        if (!isAvailable) {
            hasConflict = true;
            break; // Don't add the event if there's a conflict
        }

        newEvents.push(data2add);

        // Update the current date for repeated events
        updateCurrentDate(currentDate, repeatFrequency);
    }

    if (hasConflict) {
        //delete the first event
        await handleDeleteData('event', firstEvent._id, events, setEvents);
        return;
    }

    // Adds all the repeated events if there are no conflicts
    await Promise.all(
        newEvents.map(async (event) => {
                const tmp = await generateEvent(event, originalId, receivers);
                if (!tmp) {
                    console.error("Error generating repeated event");
                    return;
                } else {
                    events2Add.push(tmp);
                }
        })
        
    );

    //adds all the repeated events if there are no conflicts
    setEvents([...events, ...events2Add]);
};


// Function to fetch the user's no availability time intervals
export async function fetchNoAvailability(setNoAvailability){
    try {
        const response = await fetch('http://localhost:8000/api/user/no-availability', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            setNoAvailability(data.noAvailability);
        } else {
            throw new Error('Error fetching no availability');
        }
    } catch (error) {
        console.error('Error fetching no availability:', error);
        throw error;
    }
};
// Function to add a no availability time interval
export async function addNoAvailability(startDate, endDate, repeatFrequency) {
    try {
        const response = await fetch(`http://localhost:8000/api/user/add-no-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ startDate, endDate, repeatFrequency }),
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const error = await response.json();
            console.error('Failed to add no availability:', error.message);
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error adding no availability:', error);
        throw error;
    }
}

// Function to remove a no availability time interval
export async function removeNoAvailability(noAvailabilityId) {
    try {
        const response = await fetch(`http://localhost:8000/api/user/remove-no-availability/${noAvailabilityId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const textResponse = await response.text();
            console.error('Error response:', textResponse);
        }
    } catch (error) {
        console.error('Error removing no availability:', error);
        throw error;
    }
}

// Function to get the user ID from the username
async function getUserIdFromUsername(username) {
    try {
        const response = await fetch(`http://localhost:8000/api/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return data.userId;
        } else {
            throw new Error('Error fetching no availability');
        }
    } catch (error) {
        console.error('EErrore nel recuperare  ID utente', error);
        throw error;
    }
}

// Function to get the user's no availability data
async function getUserAvailabilityWithId(userId) {
    try {
        const response = await fetch(`http://localhost:8000/api/user/no-availability/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return data.noAvailability;
        } else {
            throw new Error('Error fetching no availability');
        }
    } catch (error) {
        console.error('EErrore nel recuperare la disponibilità', error);
        throw error;
    }
}

// Function to check if there is an overlap in the user's availability
function isOverlapping(start1, end1, start2, end2) {
    return (
        (start1 >= start2 && start1 <= end2) || // start inside interval
        (end1 >= start2 && end1 <= end2) || // end inside interval
        (start1 <= start2 && end1 >= end2) // Contained interval
    );
}

// Function to check availability of users in sharedWith
async function checkAvailabilityForSharedWith(receivers, startDate, endDate) {
    try {

        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        for (const receiver of receivers) {
            
            // Get user IDs from usernames
            const userId =  await getUserIdFromUsername(receiver);

            const noAvailability = await getUserAvailabilityWithId(userId);


            // Check if the user's availability overlaps with the new event
            for (const unavailablePeriod of noAvailability) {
                const { startDate: unavailableStart, endDate: unavailableEnd, repeatFrequency } = unavailablePeriod;

                if(repeatFrequency === "none") {
                    // Check for a single period
                    if (isOverlapping(new Date(startDate), new Date(endDate), new Date(unavailableStart), new Date(unavailableEnd))) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: `The user "${receiver}" is not available during this period.`,
                        });
                        return false; // Return false if there's an overlap
                    }
                }
                // Check for repeated periods
                else {
                    let currentStart = new Date(unavailableStart);
                    let currentEnd = new Date(unavailableEnd);

                    while (currentStart <= newEndDate) {
                        if (isOverlapping(
                            newStartDate, 
                            newEndDate, 
                            currentStart, 
                            currentEnd
                        )) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: `The user "${receiver}" is not available during this period.`,
                            });
                            return false; // Return false if there's an overlap
                        }

                        // We update the dates for the next occurrence
                        updateCurrentDate(currentStart, repeatFrequency);
                        updateCurrentDate(currentEnd, repeatFrequency);
                    }
                }
            }
        }
        // no overlaps found, the user is available
        return true;
  
    } catch (error) {
        console.error("Errore nel controllare la disponibilità:", error);
        return false; // Return false in case of an error
    }
}
