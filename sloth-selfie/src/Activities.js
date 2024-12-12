import React from 'react';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import './css/Calendar.css';
import { handleDataChange, handleAddData, handleRemoveActivity, handleUpdateData } from './CalendarUtils';
import Select from 'react-select';

function ActivitiesFunction(props){
    
    const options = [
        { value: "0", label: "same day" },
        { value: "1440", label: "1 day before" },
    ];


    const handleSubmitSave = (e) => {
        e.preventDefault();
        if (props.selectedActivity) {
            handleUpdateData(e, props.activityData, props.setActivityData, props.activities, props.setActivities, props.selectedActivity, props.setSelectedActivity, props.setIsEditing);
            props.setIsEditing(false);
        } else {
            handleAddData(e, props.activityData, props.setActivityData, props.activities, props.setActivities, props.setIsEditing);
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

                {/*Here we have the list for shared Events with other Users */}
            <div>
                <label>Share your activity with:
            <input 
                type="text" 
                placeholder="Type username and press Enter" 
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                    const newUser = e.target.value.trim();
                    if (newUser && props.activityData?.sharedWith?.length >= 0 && !props.activityData.sharedWith.includes(newUser)) {
                        handleDataChange('sharedWith', [...props.activityData.sharedWith, newUser], props.setActivityData);
                        e.target.value = ''; // Clear input field
                    }
                    }
                }}
                />
                <ul>
                {(props.activityData?.sharedWith || []).map((user, index) => (
                    <li key={index}>
                    {user} <button onClick={() => handleDataChange('sharedWith', props.activityData.sharedWith.filter(u => u !== user), props.setActivityData)}>Remove</button>
                    </li>
                ))}
                </ul>
            </label>
            </div>

                <label>
                    <input
                        className="checkbox"
                        type="checkbox"
                        checked={props.activityData.notify}
                        onChange={(e) => handleDataChange("notify", e.target.checked, props.setActivityData)}
                    />
                    Check this box to receive a notification
                </label>
                {props.activityData.notify && (
                    <label>
                        <Select
                            value={options.find((option) => option.value === props.activityData.notificationTime)}
                            onChange={(selectedOption) => handleDataChange("notificationTime", selectedOption.value, props.setActivityData)}
                            options={options}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    width: 170,
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    maxHeight: 150,
                                    overflowY: "auto",
                                }),
                                menuList: (provided) => ({
                                    ...provided,
                                    maxHeight: 150,
                                }),
                            }}
                            menuPlacement="top"
                        />
                    </label>
                )}
                <button className='btn btn-main' type="submit">
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