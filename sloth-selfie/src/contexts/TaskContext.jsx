import React, { createContext, useContext, useState }  from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {

    const [task, setTask] = useState({
        _id: '',
        title: '',
        user: '',
        deadline: null,
        completed: false,
        sharedWith: [],
    });

    const [tasks, setTasks] = useState([]);

    const resetTask = () => {
        setTask({
            _id: '',
            title: '',
            user: '',
            deadline: null,
            completed: false,
            sharedWith: [],
        });
    }

    return (
        <TaskContext.Provider value={{ task, setTask, resetTask, tasks, setTasks }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTask = () => useContext(TaskContext);