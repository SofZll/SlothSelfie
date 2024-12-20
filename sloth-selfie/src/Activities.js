import React from 'react';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import './css/Calendar.css';
import { handleDataChange, handleAddData, handleRemoveActivity, handleUpdateData } from './CalendarUtils';
import ShareInput from './ShareInput';
import NotificationInput from './NotificationInput';
import { changeReceivers } from './globalFunctions';

function ActivitiesFunction(props){
    const [customValue, setCustomValue] = React.useState('');
    const handleSubmitSave = (e) => {
        e.preventDefault();
        if (props.selectedActivity) {
            handleUpdateData(e, props.activityData, props.setActivityData, props.activities, props.setActivities, props.selectedActivity, props.setSelectedActivity, props.setIsEditing);
            props.setIsEditing(false);
        } else {
            handleAddData(e, props.activityData, props.setActivityData, props.activities, props.setActivities, props.setIsEditing, props.receivers, props.setReceivers, props.setTriggerReceiversReset);
        }
    }
    
  
    return (
        <div className="container-activity-add">
            <h2>Activities</h2>
            <form>
                <label>Activity:
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={props.activityData.title} 
                        onChange={(e) => handleDataChange("title", e.target.value, props.setActivityData)}
                        required 
                    />
                </label>
                <label>Deadline:
                    <input 
                        type="date" 
                        value={props.activityData.deadline} 
                        onChange={(e) => handleDataChange("deadline", e.target.value, props.setActivityData)}
                        required 
                    />
                </label>
                <ShareInput changeReceivers={changeReceivers({setReceivers: props.setReceivers})} resetReceivers={props.setTriggerReceiversReset}/>
                {/* Field for notification */}
                <NotificationInput data={props.activityData} setData={props.setActivityData} customValue={customValue} setCustomValue={setCustomValue}/>
                <button className='btn btn-main' type="submit" onClick={handleSubmitSave}>
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
                                <button className="btn btn-main" onClick={() => handleRemoveActivity(activity._id, props.activities, props.setActivities)}>
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