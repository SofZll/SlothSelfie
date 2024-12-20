import React from 'react';
import './css/NotificationInput.css';
import Select from 'react-select';
import { handleDataChange, optionsNotif, optionsRepetition} from './CalendarUtils';

function NotificationInput(props){
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
                    {props.data.notificationTime === 'custom' && (
                        <div className="custom-time">
                            <input
                                type="date"
                                value={props.data.deadline}
                                onChange={(e) => handleDataChange("deadline", e.target.value, props.setData)}
                                required
                            />
                            <input
                                type="time"
                                value={props.customValue}
                                onChange={(e) => props.setCustomValue(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="notification-row input-small">
                        <Select
                            value={optionsRepetition.find((option) => option.value === props.data.NotificationRepeat)}
                            onChange={(selectedOption) => handleDataChange("notificationRepeat", selectedOption.value, props.setData)}
                            options={optionsRepetition}
                            classNamePrefix="custom-select"
                            placeholder="Repetition"
                        />
                    </div>
                </>
            )}
        </>
    )
}

export default NotificationInput;