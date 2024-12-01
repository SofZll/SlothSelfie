import { all } from "axios";
import { a } from "react-spring";
import Swal from "sweetalert2";

//Functoin to handle change the current Event or Activity data
export function handleDataChange(field, value, setData) {
    setData((prevData) => ({
        ...prevData,
        [field]: value
    }));
}

const setStartEnd = (data) => {
    let startDate, endDate;

    if (data.type === "activity") {
        startDate = new Date(data.deadline);
        endDate = new Date(data.deadline);
        
    } else if (data.type === "events") {
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
        }
    }

    return {startDate, endDate};
}


// Convert Data to the format required by React Big Calendar
export function normalizeData (data, type) {
    return data.map((data) => {

        let { startDate, endDate } = setStartEnd(data);


        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error(`Invalid date for event: ${JSON.stringify(data)}`);
            return {
                id: data.id,
                title: data.title,
                start: new Date(),
                end: new Date(),
                deadline: new Date(),
                completed: data.completed,
                type: type
            };
        }
        
        return {
            id: data.id,
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
export function resetInputFiels(type, setData) {
    
    
    if (type === "activity") {
        handleDataChange('id', '', setData);
        handleDataChange('title', '', setData);
        handleDataChange('deadline', '', setData);
        handleDataChange('completed', false, setData);
    } else if (type === "events") {
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
}

//Function to handle set of new data
export async function handleAddData(data, username) {
    if (data.type === "activity") {
        const {title, deadline} = data;
        newData = {
            title: title,
            deadline: deadline,
            completed: false,
            userId: username,
            type: "activity",
        };
    } else if (data.type === "events") {
        const {title, date, time, duration, allDay, days, repeatFrequency, repeatEndDate, repeatCount, eventLocation} = data;
        newData = {
            title: title,
            date: date,
            time: time,
            duration: allDay ? days : duration,
            allDay: allDay,
            days: days,
            repeatFrequency: repeatFrequency,
            repeatEndDate: repeatEndDate,
            repeatCount: repeatCount,
            eventLocation: eventLocation,
            userId: username,
            type: "events",
        };
    }

    return newData;
}



// Handle adding an event or activity
export async function handleAddData(e, data, setData, datas, setDatas, username) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    console.log("Adding data:", data);
    
    const newData = await handleAddData(data, username);

    try {
        if (!username) {
            console.error("Username not defined");
        }

        if (type === "events") {
            handleExtraSettings(data);
        }


        const response = await fetch(`http://localhost:8000/api/${type}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
        });

        if (!response.ok) {
            throw new Error(`Error adding ${type}: ${response.status}`);
        }

        // Get the saved data from the backend
        const savedData = await response.json();

        if (savedData) {
            console.log(`Added ${type}:`, savedData);

            resetInputFiels(type, setData);
            setDatas([...datas, savedData]);
        }
    } catch (error) {
        console.error(`Error adding ${type}:`, error);
    }
}


//Handle fetching data from the database
export async function fetchData (type, setData) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}`, {
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
                    const response = await fetch(`http://localhost:8000/api/activity/${activity._id}`, {
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

    if (type === "events") {
        setIsEditing(false);
    }

    resetInputFiels(type, setData);
}

//Function to handle the update of an event or activity
export async function handleUpdateData(e, data, setData, datas, setDatas, setSelectedData, selectedData, setIsEditing) {
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
export function handleConfirmDelete(type, selectedData, setShowConfirmation, handleDeleteData, datas, setDatas, setSelectedData, setIsEditing, setData) {
    handleDeleteData(selectedData._id, datas, setDatas, setSelectedData);
    setShowConfirmation(false);
    handleClosePopup(type, setSelectedData, setIsEditing, setData);
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

            resetInputFiels(type, setIsEditing, setData);
        }
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
    }

}


// Function to generate repeated events con handleAddData
export function generateRepeatedEvents (eventData, repeatEndDate = null, repeatCount = null, setEventData, setIsEditing) {
    
    let currentDate = new Date(`${eventData.date}T${eventData.time}`);
    let count = 0;
    if(repeatEndDate){
        repeatEndDate = new Date(repeatEndDate);
        repeatEndDate.setHours(23, 59, 59, 999);//Adjusting the end, else we lose a day
    }

    while (true) {
        if (repeatEndDate && currentDate > new Date(repeatEndDate)) break;
        if (repeatCount && count >= repeatCount) break;
      
        const data = {
            ...eventData,
            id: eventData.id + count,
            originalId: eventData.id,
            start: new Date(currentDate),
            end: new Date(currentDate.getTime() + (eventData.duration ? eventData.duration * 60 * 60 * 1000 : 0)),
        };

        handleAddData("events", data, setEventData, setIsEditing);

        count++;

        if (eventData.repeatFrequency === "daily") {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (eventData.repeatFrequency === "weekly") {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (eventData.repeatFrequency === "monthly") {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (eventData.repeatFrequency === "yearly") {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
            break;
        }

    }

};


