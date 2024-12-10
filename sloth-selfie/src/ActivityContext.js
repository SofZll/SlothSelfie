import React, { createContext, useState, useEffect } from 'react';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    
    //Define the activity data structure
    const [activityData, setActivityData] = useState({
        title: "",
        deadline: "",
        completed: false,
        userId: '', // User ID of whom creates the event
        type: 'activity',
    });

    /*
    //Functoin to handle change the current Event or Activity data
    function handleDataChange(field, value, setData) {
        setData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    }

    //Function to save data in front and clen the form
    function resetInputFiels(type, setData, setIsEditing) {
    
    
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
            handleDataChange('isPreciseTime', false, setData);
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
    async function newData2Add(data, originalId) {
    
    
        if (data.type === "activity") {
            const { deadline, title } = data;
            const newData = {
                title: title,
                deadline: deadline,
                completed: false,
                type: "activity",
            };

            return newData;
        } else if (data.type === "event") {
            const { title, date, time, duration, allDay, eventLocation, isPreciseTime, repeatFrequency, repeatEndDate } = data;
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
            };

            console.log(newData);
            return newData;
        }
    }

    // Handle adding an event or activity
    async function handleAddData(e, data, setData, datas, setDatas, setIsEditing) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        const newData = await newData2Add(data, '');

        try {

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
            }
        } catch (error) {
            console.error(`Error adding ${data.type}:`, error);
        }
    }


//Handle fetching data from the database
    async function fetchData (type, setData) {
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

    //Function to handle the deletion of an event or activity
    async function handleDeleteData(type, id, datas, setDatas, setSelectedData) {
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
                setSelectedData(null);
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    }

    */     
    return (
        <ActivityContext.Provider value={{ activities, setActivities, activityData, setActivityData}}>
            {children}
        </ActivityContext.Provider>
    );
};
