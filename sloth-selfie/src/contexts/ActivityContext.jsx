import React, { createContext, useContext, useState }  from 'react';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {

    const [activity, setActivity] = useState({
        _id: '',
        title: '',
        user: '',
        deadline: new Date(),
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
            deadline: new Date(),
            completed: false,
            sharedWith: [],
            notify: false,
            notificationTime: 0,
        });
    }

    return (
        <ActivityContext.Provider value={{ activity, setActivity, activities, setActivities, resetActivity }}>
            {children}
        </ActivityContext.Provider>
    )
}

export const useActivity = () => useContext(ActivityContext);