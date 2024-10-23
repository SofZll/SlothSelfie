import React, { createContext, useState } from 'react';

const initialActivities = [
  // Puoi aggiungere alcune attività di esempio qui 
  {id: 1, title: 'Study Math', deadline: '2024-10-22', completed: false },
  {id: 2, title: 'Write Report', deadline: '2024-10-25', completed: false }
];

//define the activity data structure, sharing fields with note tasks
export const ActivityContext = createContext();

export const SharedDataProvider = ({ children }) => {
  const [activityData, setActivityData] = useState({
    id: "",
    title: '',
    deadline: '',
    completed: false
  });

  return (
    <ActivityContext.Provider value={{ activityData, setActivityData }}>
      {children}
    </ActivityContext.Provider>
  );
};
