import React, { useEffect, useContext } from 'react';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import './css/Calendar.css';
import { handleAddActivity, handleRemoveActivity, handleUpdateActivity, handleActivityDataChange} from './ActivityUtils';

import { ActivityContext } from './ActivityContext';



function ActivitiesFunction(props){
    const { activities, setActivities, username } = useContext(ActivityContext);

    // Pre-fill the form with the selected activity
    useEffect(() => {
        if (props.selectedActivity) {
            handleActivityDataChange('id', props.selectedActivity.id, props.setActivityData);
            handleActivityDataChange('title', props.selectedActivity.title, props.setActivityData);
            handleActivityDataChange('deadline', props.selectedActivity.deadline, props.setActivityData);
            handleActivityDataChange('completed', props.selectedActivity.completed, props.setActivityData);
        }
    }, [props.selectedActivity]);

    const handleSubmitSave = (e) => {
        e.preventDefault();
        if (props.selectedActivity) {
            handleUpdateActivity(e, props.activityData, props.setActivityData, props.activities, props.setActivities, props.setSelectedActivity,props.selectedActivity, props.setIsEditing);
        } else {
            handleAddActivity(e, props.activityData, props.setActivityData, props.activities, props.setActivities, username);
        }
    }

  
    return (
        <div className="container-activity-add">
            <h2>Activities</h2>
            <form onSubmit={(e) => handleSubmitSave(e)}>
                <label>Activity:
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={props.activityData.title} 
                        onChange={(e) => handleActivityDataChange("title", e.target.value, props.setActivityData)}
                        required 
                    />
                </label>
                <label>Deadline:
                    <input 
                        type="date" 
                        value={props.activityData.deadline} 
                        onChange={(e) => handleActivityDataChange("deadline", e.target.value, props.setActivityData)}
                        required 
                    />
                </label>
                <button className='btn' type="submit">
                    {props.selectedActivity ? 'Save Changes' : 'Add Activity'}
                </button>
            </form>

            <div className="activities-list">
                <h2>List of your Activities:</h2>
                <div className="activities-container">
                    <div className="scrollable-Card-list">
                        {props.activities.filter(activity => !activity.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(activity => (
                            <div className="activity-card" key={activity._id}>
                                <h2>{activity.title}</h2>
                                <p>Due: {new Date(activity.deadline).toLocaleDateString()}</p>
                                <button className="btn" onClick={() => handleRemoveActivity(activity._id, props.activities, props.setActivities)}>
                                    Done
                                </button>
                            </div>
                        ))}
                    </div>    
                </div>
            </div>
        </div>
    );
}
export default ActivitiesFunction;