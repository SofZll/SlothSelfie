
import Swal from "sweetalert2";

//Functoin to handle change the current Event or Activity data
export function handleDataChange(field, value, setData) {
    setData((prevData) => ({
        ...prevData,
        [field]: value
    }));
}

const setStartEnd = (data, type) => {
    let startDate, endDate;

    if (type === "activity") {
        endDate = new Date(data.deadline);
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
        
    } else if (type === "event") {
        if (data.start && data.end) {
            startDate = new Date(data.start);
            endDate = new Date(data.end);
        } else {
            startDate = new Date(`${data.date}T${data.time}`);
            const durationInMilliseconds = Number(data.duration) * 60 * 60 * 1000;
            endDate = new Date(startDate.getTime() + durationInMilliseconds);
        }

        if (data.allDay) {
            // Set the start at 08:00 and end midnight
            startDate.setHours(8, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            if (data.days > 1) {
                endDate.setDate(startDate.getDate() + data.days - 1);
            }

            
        }
    }

    return {startDate, endDate};
}


// Convert Data to the format required by React Big Calendar
export function normalizeData (datas, type) {
    return (type === "activity" ? datas.filter(data => !data.completed) : datas).map((data) => {

        const { startDate, endDate } = setStartEnd(data, type);


        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error(`Invalid date for event: ${JSON.stringify(data)}`);
            return {
                _id: data._id,
                title: data.title,
                start: new Date(),
                end: new Date(),
                deadline: new Date(),
                completed: data.completed,
                type: type
            };
        }
        
        return {
            _id: data._id,
            title: data.title,
            start: startDate,
            end: endDate,
            deadline: data.deadline,
            completed: data.completed,
            type: type
        };
    });
};

//Function to save data in front and clen the form
export function resetInputFiels(type, setData, setIsEditing) {
    
    
    if (type === "activity") {
        handleDataChange('id', '', setData);
        handleDataChange('title', '', setData);
        handleDataChange('deadline', '', setData);
        handleDataChange('completed', false, setData);
    } else if (type === "event") {
        handleDataChange('id', '', setData);
        handleDataChange('originalId', '', setData);
        handleDataChange('title', '', setData);
        handleDataChange('date', '', setData);
        handleDataChange('time', '00:00', setData);
        handleDataChange('duration', '', setData);
        handleDataChange('allDay', false, setData);
        handleDataChange('days', 1, setData);
        handleDataChange('repeatFrequency', 'none', setData);
        handleDataChange('repeatEndDate', '', setData);
        handleDataChange('repeatCount', '', setData);
        handleDataChange('eventLocation', '', setData);
    }

    setIsEditing(false);
}

//Function to handle set of new data
export async function newData2Add(data, username) {
    console.log(username);
    
    if (data.type === "activity") {
        const { deadline, title } = data;
        const newData = {
            title: title,
            deadline: deadline,
            completed: false,
            userId: username,
            type: "activity",
        };

        return newData;
    } else if (data.type === "event") {
        console.log(data._id);
        const { originalId, title, date, time, duration, allDay, repeatFrequency, repeatEndDate, repeatCount, eventLocation } = data;
        const newData = {
            originalId: originalId || data._id,
            title: title,
            date: date,
            time: time,
            duration: allDay ? data.days : duration,
            allDay: allDay,
            repeatFrequency: repeatFrequency,
            repeatEndDate: repeatEndDate,
            eventLocation: eventLocation,
            userId: username,
        };

        return newData;
    }
}


// Handle adding an event or activity
export async function handleAddData(e, data, setData, datas, setDatas, setIsEditing, username) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    console.log("type:", data.type);

    console.log(username);

    console.log("Adding data:", data);
    
    const newData = await newData2Add(data, username);
    console.log("New data:", newData);

    try {
        if (!username) {
            console.error("Username not defined");
        }


        const response = await fetch(`http://localhost:8000/api/${data.type}`, {
            method: "POST",
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
            console.log(`Added ${data.type}:`, savedData);

            resetInputFiels(data.type, setData, setIsEditing);
            setDatas([...datas, savedData]);
        }
    } catch (error) {
        console.error(`Error adding ${data.type}:`, error);
    }
}


//Handle fetching data from the database
export async function fetchData (type, setData) {
    try {
        const response = await fetch(`http://localhost:8000/api/${(type)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching ${type}: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            console.log(`Fetched ${type}:`, data);
            setData(data);
        }
        
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
}

//Handle fetching by data id
export async function fetchDataById (type, id) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}/${id}`, {
            method: "GET",
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
            console.log(`Fetched ${type}:`, data);
            return data;
        }
        
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return;
    }
}


// Handle removing an activity and marking it as completed while pressing btn "Done"
export async function handleRemoveActivity(activityId, activities, setActivities) {
    if (!activityId) {
        console.error("ID dell'attività non trovato");
    }

    try{
        //const response = await fetch(`/api/activities/${activityId}`, {
        //locale:
        const response = await fetch(`http://localhost:8000/api/activity/${activityId}`, {
            method: 'DELETE',
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
        console.log("Current activities:", updatedActivities);
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

//Function to handle the update of an event or activity
export async function handleUpdateData(e, data, setData, datas, setDatas, selectedData, setSelectedData, setIsEditing) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    try {
        const response = await fetch(`http://localhost:8000/api/${data.type}/${selectedData._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(
                data.type === "activity" ? {
                    title: data.title,
                    deadline: data.deadline,
                    completed: data.completed,
                } : {
                    title: data.title,
                    date: data.date,
                    time: data.time,
                    duration: data.allDay ? data.days : data.duration,
                    allDay: data.allDay,
                    repeatFrequency: data.repeatFrequency,
                    repeatEndDate: data.repeatEndDate,
                    repeatCount: data.repeatCount,
                    eventLocation: data.eventLocation,
                }
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
            console.log(`Deleted ${type}:`, deletedData);

            const updatedDatas = datas.filter((data) => data._id !== id);
            setDatas(updatedDatas);
            setSelectedData(null);
        }
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
    }
}

// Function to Abort the deletion
export function handleAbortDelete(setShowConfirmation) {
    setShowConfirmation(false);
}

// Function to confirm the deletion of an event or activity
export function handleConfirmDelete(type, selectedData, setShowConfirmation, datas, setDatas, setSelectedData, setIsEditing, setData) {
    handleDeleteData(type, selectedData._id, datas, setDatas, setSelectedData);
    setShowConfirmation(false);
    handleClosePopup(type, setSelectedData, setIsEditing, setData);
}

//Function to handle the filling of the form with the selected event or activity
export function handleFillForm(data, setSelectedData, setIsEditing, handleSelection) {
    
    setIsEditing(true);
    handleSelection(data.type === "event");

    setSelectedData(data);
}

//Function to update activity and event on drop (drag and drop)
export async function handleUpdateDataOnDrop(item, start, datas, setDetas) {
    if (!item) {
        console.error("Item not found");
        return;
    }

    let deadline, endDate, startDate;

    if (item.type === "activity") {
        deadline = new Date(start).toISOString().split('T')[0];
    } else if (item.type === "event") {
        startDate = new Date(start);
        endDate = new Date(start);

        if (item.allDay) {
            // Set the start at 08:00 and end midnight
            startDate.setHours(8, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else {
            startDate.setHours(item.start.getHours(), item.start.getMinutes(), 0, 0);
            endDate.setHours(item.end.getHours(), item.end.getMinutes(), 0, 0);
        }

    }

    const updatedDatas = await Promise.all(
        datas.map(async (data) => {
            if (data._id === item._id) {
                try {
                    const response = await fetch(`/api/${item.type}/${item._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            ...item, 
                            ...(item.type === 'activity' 
                            ? { deadline }
                            : {start: startDate, end: endDate})
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


    








        


//Function to handle the deletion of a repeted events by the original id
export async function handleDeleteRepeatedEvent(type, id, setData, setIsEditing) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}/original/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`Error deleting ${type}:`, response);
        }

        // Get the saved note from the backend
        const deletedData = await response.json();
        if (deletedData) {
            console.log(`Deleted ${type}:`, deletedData);

            resetInputFiels(type, setData, setIsEditing);
        }
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
    }

}

//Function to handle the calculation of the last date of a repeated event
export function calcLastDate(repeatMode, repeatEndDate, repeatCount, repeatFrequency) {
    let lastDate;

    if (repeatMode === "end") {
        lastDate = repeatEndDate;
    } else if (repeatMode === "count") {
        const currentDate = new Date();
        if (repeatFrequency === "daily") {
            currentDate.setDate(currentDate.getDate() + repeatCount);
        } else if (repeatFrequency === "weekly") {
            currentDate.setDate(currentDate.getDate() + repeatCount * 7);
        } else if (repeatFrequency === "monthly") {
            currentDate.setMonth(currentDate.getMonth() + repeatCount);
        } else if (repeatFrequency === "yearly") {
            currentDate.setFullYear(currentDate.getFullYear() + repeatCount);
        }
        lastDate = currentDate.toISOString().split('T')[0];

    }

    return lastDate;
}


// Function to generate repeated events con handleAddData
export function generateRepeatedEvents (e, eventData, setEventData, events, setEvents, setIsEditing, username) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const { date, repeatFrequency, repeatMode, repeatEndDate, repeatCount } = eventData;

    const newEvents = [];
    let currentDate = new Date(date);
    const lastDate = new Date(calcLastDate(repeatMode, repeatEndDate, repeatCount, repeatFrequency));



    while (currentDate <= lastDate) {
        const newEvent = {
            ...eventData,
            date: currentDate.toISOString().split('T')[0],
        };

        newEvents.push(newEvent);

        switch (repeatFrequency) {
            case "daily":
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case "weekly":
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case "monthly":
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case "yearly":
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
            default:
                break;
        }
    }

    newEvents.forEach(async (event) => {
        handleAddData(null, event, setEventData, events, setEvents, setIsEditing, username);
    });

};


