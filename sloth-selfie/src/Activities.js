import React, { useState, useEffect , useContext} from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './css/App.css';
import './css/Activities.css';
import { normalizeActivities, handleAddActivity, handleRemoveActivity, updateOverdueActivities, handleUpdateActivity, handleDeleteActivity, handleAbortDelete, handleConfirmDelete, handleClosePopupA} from './ActivityUtils';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';

const initialActivities = [
    // Puoi aggiungere alcune attività di esempio qui 
    {id: 1, title: 'Study Math', deadline: '2024-10-22', completed: false },
    {id: 2, title: 'Write Report', deadline: '2024-10-25', completed: false }
  ];

function ActivitiesFunction(){
    const { updateStyles, updateIcon } = useContext(StyleContext);
    const [activities, setActivities] = useState(initialActivities || []);
    const [id, setId] = useState("");
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [completed, setCompleted] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // change style page onload document
    useEffect(() => {
        updateStyles(true);
        updateIcon(iconDark);

        return () => {
            updateStyles(false);
            updateIcon(iconLight);
        };
    }, [updateIcon, updateStyles]);

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

    useEffect(() => {// Pre-fill the form with the selected activity
        if (selectedActivity) {
            setId(selectedActivity.id);
            setTitle(selectedActivity.title);
            setDeadline(selectedActivity.deadline);
            setCompleted(selectedActivity.completed);
        }
    }, [selectedActivity]);

    function handleEventClick(event) {
        console.log("Event clicked:", event); 
        setSelectedActivity(event);
      }
  
    return (
        <div className="activities-page">
            <div className="div-calendar-container">
                <h2>Your Activities:</h2>
                <div className="calendar-container">
                    <BigCalendar
                        localizer={momentLocalizer(moment)}
                        events={normalizeActivities(activities)}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleEventClick}
                        titleAccessor="title"
                        style={{ height: "60vh" }}
                    />
                    {/* Display popup for the selected activity*/}
                    {selectedActivity && (
                        <div className="popup">
                        <h2>Editing mode:</h2>
                        <h2>{selectedActivity.title}</h2>
                        <p>Due: {selectedActivity.deadline}</p>
                        <p>Completed: {selectedActivity.completed ? 'Yes' : 'No'}</p>
                        <div>
                            <button className='btn' onClick={() =>{
                                setShowConfirmation(true);
                                console.log(setShowConfirmation);
                            }}>
                                Delete
                            </button>
                            <button className='btn' onClick={() => handleClosePopupA(setSelectedActivity, setId, setTitle, setDeadline, setCompleted)}>X</button>
                        </div>
                        {showConfirmation && (
                            <div className="popup-delete">
                                <h2>Are you sure you want to delete this activity?</h2>
                                <div>
                                    <button className='btn' onClick={() => handleConfirmDelete(selectedActivity, setShowConfirmation, handleDeleteActivity, activities, setActivities, setSelectedActivity, setId, setTitle, setDeadline, setCompleted)}>Yes</button>
                                    <button className='btn' onClick={() => handleAbortDelete(setShowConfirmation)}>No</button>
                                </div>
                            </div>
                        )}
                        </div>
                    )}
                </div>
            </div>
            <div className="container-activity-add">
                <h2>Activities</h2>
                <form onSubmit={selectedActivity 
                    ? (e) => handleUpdateActivity(e, id, title, deadline, completed, activities, setActivities, setSelectedActivity, setId, setTitle, setDeadline, setCompleted) 
                    :(e) => handleAddActivity(e, title, deadline, activities, setActivities, setTitle, setDeadline)}>
                    <label>Activity:
                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>Deadline:
                        <input 
                            type="date" 
                            value={deadline} 
                            onChange={(e) => setDeadline(e.target.value)} 
                            required 
                        />
                    </label>
                    <button className='btn' type="submit">
                        {selectedActivity ? 'Save Changes' : 'Add Activity'}
                    </button>
                </form>
                <div className="activities-list">
                    <h2>List of your Activities:</h2>
                    <div className="activities-container">
                        <div className="scrollable-Card-list">
                            {activities.filter(activity => !activity.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(activity => (
                                <div className="activity-card" key={activity.id}>
                                    <h2>{activity.title}</h2>
                                    <p>Due: {activity.deadline}</p>
                                    <button className="btn" onClick={() => handleRemoveActivity(activity.id, activities, setActivities)}>Done</button>
                                </div>
                            ))}
                        </div>    
                    </div>
                </div>
            </div> 
        </div>
    );
}
// Export the function and the Activities list
export { initialActivities };
export default ActivitiesFunction;