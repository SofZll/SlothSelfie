
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
        
    } else {
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
export function resetInputFiels(type, setIsEditing, setData) {
    
    
    if (type === "activity") {
        handleDataChange('title', '', setData);
        handleDataChange('deadline', '', setData);
    } else {
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


//Function to Connect to the database
export async function connectToDB (type, data, setData, setIsEditing) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Error adding ${type}:`, response);
        }

        // Get the saved note from the backend
        const savedData = await response.json();
        if (savedData) {
            console.log(`Added ${type}:`, savedData);

            resetInputFiels(type, setIsEditing, setData);

            //TODO: Add an alert to confirm the data was saved
        }
        
    
    } catch (error) {
        console.error(`Error adding ${type}:`, error);
    }
}

// Handle dding an activity
export async function handleAddData(type, data, setData, setIsEditing) {
    
    if (!data.username) {
        console.error("Username not defined");
    }

    connectToDB(type, data, setData, setIsEditing);   
}

//Handle fetching data from the database
export async function fetchData (type) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}`, {
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


//Function to handle the update of an event or activity
export async function handleUpdateData(type, data, setData, setIsEditing, setSelectedData) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Error updating ${type}:`, response);
        }

        // Get the saved note from the backend
        const updatedData = await response.json();
        if (updatedData) {
            console.log(`Updated ${type}:`, updatedData);

            resetInputFiels(type, setIsEditing, setData);
            setSelectedData(null);
        }
    } catch (error) {
        console.error(`Error updating ${type}:`, error);
    }
}

//Function to handle the deletion of an event or activity
export async function handleDeleteData(type, id, setData, setIsEditing) {
    try {
        const response = await fetch(`http://localhost:8000/api/${type}/${id}`, {
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

// Find and update overdue activities
export async function updateOverdueActivities(activities, setActivities) {
    const currentDate = new Date();
    const overdueActivities = activities.filter((activity) => new Date(activity.deadline) < currentDate && !activity.completed);
    if (overdueActivities.length > 0) {
        console.log("Overdue activities:", overdueActivities);
        overdueActivities.forEach((activity) => {
            activity.completed = true;
            handleUpdateData("activities", activity, setActivities);
        });

        setActivities(fetchData("activities"));
    }
}

// Function to Abort the deletion
export function handleAbortDelete(setShowConfirmation) {
    setShowConfirmation(false);
}







        




