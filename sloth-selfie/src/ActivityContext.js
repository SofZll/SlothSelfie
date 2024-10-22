import React, { createContext, useState } from 'react';


const initialActivities = [
    // Puoi aggiungere alcune attività di esempio qui 
    {id: 1, title: 'Study Math', deadline: '2024-10-22', completed: false },
    {id: 2, title: 'Write Report', deadline: '2024-10-25', completed: false }
  ];


export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(initialActivities || []);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  return (
    <ActivityContext.Provider value={{ activities, setActivities, title, setTitle, deadline, setDeadline }}>
      {children}
    </ActivityContext.Provider>
  );
};
