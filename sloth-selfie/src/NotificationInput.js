import React, { useState }  from 'react';
import './css/NotificationInput.css';
import Select from 'react-select';
import { handleDataChange } from './CalendarUtils';

function NotificationInput(props){
    const [customDate, setCustomDate] = useState('');
    const [customTime, setCustomTime] = useState('');
    const optionsNotif = [
        { value: "0", label: "same day" },
        { value: "5", label: "5 minutes before" },
        { value: "15", label: "15 minutes before" },
        { value: "60", label: "1 hour before" },
        { value: "120", label: "2 hours before" },
        { value: "1440", label: "1 day before" },
        { value: "-1", label: "Customize" }
    ];
    
    const optionsRepetition = [
        { value: "none", label: "None" },
        { value: "three", label: "3 times" },
        { value: "1 minute", label: "Minutely" },
        { value: "1 hour", label: "Hourly" },
        { value: "1 day", label: "Daily" },
        { value: "1 week", label: "Weekly" },
        { value: "1 month", label: "Monthly" },
        { value: "untilAnswer", label: "Until answered" },
    ];
    
    const handleDateTimeChange = (date, time) => {
        const dateValue = date || customDate;
        const timeValue = time || customTime;
        const dateTime = new Date(`${dateValue}T${timeValue}`);
        
        handleDataChange("customValue", dateTime, props.setData);
        setCustomDate(dateValue);
        setCustomTime(timeValue);
    };

    const handleNotificationChange = (type, value) => {
        props.setData((prevData) => ({
            ...prevData,
            notificationType: {
                ...prevData.notificationType,
                [type]: value,
            },
        }));
    };

    return (
        <>
            <div className="notification-row">
                <input
                    className="checkbox"
                    type="checkbox"
                    checked={props.data.notify}
                    onChange={(e) => handleDataChange("notify", e.target.checked, props.setData)}
                />
                <label>
                    Check this box to receive a notification:
                </label>
            </div>
            {props.data.notify && (
                <>
                    <div className="notification-row input-small">
                        <label>
                            Select notification time:
                        </label>
                        <Select
                            value={optionsNotif.find((option) => option.value === props.data.notificationTime)}
                            onChange={(selectedOption) => handleDataChange("notificationTime", selectedOption.value, props.setData)}
                            options={optionsNotif}
                            classNamePrefix="custom-select"
                            menuPlacement="top"
                            placeholder="Select time"
                        />
                    </div>
                    {props.data.notificationTime === "-1" && (
                        <div className="custom-time">
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => handleDateTimeChange(e.target.value, customTime)}
                                required
                            />
                            <input
                                type="time"
                                value={customTime}
                                onChange={(e) => handleDateTimeChange(customDate, e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="notification-row input-small">
                        <Select
                            value={optionsRepetition.find((option) => option.value === props.data.notificationRepeat)}
                            onChange={(selectedOption) => handleDataChange("notificationRepeat", selectedOption.value, props.setData)}
                            options={optionsRepetition}
                            classNamePrefix="custom-select"
                            placeholder="Repetition"
                        />
                    </div>
                    <div className="notification-row">
                        <label> How would you like to be notified? </label>
                        <div className="notification-type">
                            <input
                                type="checkbox"
                                checked={props.data.notificationType.email}
                                onChange={(e) => handleNotificationChange("email", e.target.checked)}
                            />
                            <label>Email</label>
                        </div>
                        <div className="notification-type">
                            <input
                                type="checkbox"
                                checked={props.data.notificationType.OS}
                                onChange={(e) => handleNotificationChange("OS", e.target.checked)}
                            />
                            <label>OS</label>
                        </div>
                        <div className="notification-type">
                            <input
                                type="checkbox"
                                checked={props.data.notificationType.SMS}
                                onChange={(e) => handleNotificationChange("SMS", e.target.checked)}
                            />
                            <label>SMS</label>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default NotificationInput;