import React from 'react';
import 'react-calendar/dist/Calendar.css';
import './css/App.css';
import './css/Calendar.css';
import { handleDataChange, handleUpdateData, handleAddData, generateRepeatedEvents, resetInputFiels, fetchData } from './CalendarUtils';
import Select from 'react-select';


function EventsFunction(props) {

    // Function to generate time options  
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
        for (let minutes of [0, 15, 30, 45]) {
            const formattedHour = hour < 10 ? `0${hour}` : hour;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            options.push({ value: `${formattedHour}:${formattedMinutes}`, label: `${formattedHour}:${formattedMinutes}` });
        }
        }
        return options;
    };
    
    const options = generateTimeOptions();

    const handleSubmitSave = (e) => {
        e.preventDefault();
        console.log("Form submit triggered");
        if (props.selectedEvent) {
            console.log("Submitting update for event:", props.selectedEvent);
            handleUpdateData(e, props.eventData, props.setEventData, props.events, props.setEvents, props.selectedEvent, props.setSelectedEvent, props.setIsEditing);
            props.setIsEditing(false);
        } else {
            if (props.eventData.repeatFrequency !== "none") {
                generateRepeatedEvents(e, props.eventData, props.events, props.setEvents);
                resetInputFiels("event", props.setEventData, props.setIsEditing);
            } else {
                console.log("Submitting new event:", props.eventData);
                handleAddData(e, props.eventData, props.setEventData, props.events, props.setEvents, props.setIsEditing);
            }
        }
    }

    const handleFrequencyChange = (selectedOption) => {
        handleDataChange("repeatFrequency", selectedOption.value, props.setEventData);
        if (selectedOption.value === "none") {
            handleDataChange("repeatMode", "ntimes", props.setEventData);
        }
    }
    
    return (
        <div className="container-events-add">
            <h2>{props.selectedEvent ? "Edit Event" : "Add Event"}</h2>

            <form onSubmit={(e) => handleSubmitSave(e)}>
            <label>Event Title:
                <input
                    type="text"
                    placeholder="Add Title"
                    value={props.eventData.title}
                    onChange={(e) => handleDataChange("title", e.target.value, props.setEventData)}
                    required
                />
            </label>
            <br />
    
            <label>Event Date:
                <input
                    type="date"
                    value={props.eventData.date}
                    onChange={(e) => handleDataChange("date", e.target.value, props.setEventData)}
                    required
                />
            </label>
            <br />
    
            <label>
                <input
                    className="checkbox"
                    type="checkbox"
                    checked={props.eventData.allDay}
                    onChange={(e) => handleDataChange("allDay", e.target.checked, props.setEventData)}
                />
                All Day
            </label>
            <br />
    
            {!props.eventData.allDay ? (
                <>
                <div className="time-filter">
                    <label>
                        <input
                            className="checkbox"
                            type="checkbox"
                            checked={props.eventData.isPreciseTime}
                            onChange={(e) => handleDataChange("isPreciseTime", e.target.checked, props.setEventData)}
                        />
                        Use Precise Time
                    </label>
    
                    {props.eventData.isPreciseTime ? (
                        <input
                            type="time"
                            value={props.eventData.time}
                            onChange={(e) => handleDataChange("time", e.target.value, props.setEventData)}
                            required
                        />
                    ) : (
                        <Select
                            value={options.find((option) => option.value === props.eventData.time)}
                            onChange={(selectedOption) => handleDataChange("time", selectedOption.value, props.setEventData)}
                            options={options}
                            isSearchable
                            styles={{
                                menu: (provided) => ({
                                    ...provided,
                                    maxHeight: 200,
                                }),
                                menuList: (provided) => ({
                                    ...provided,
                                    maxHeight: 200,
                                }),
                            }}
                        />  
                    )}
                </div>

                <label>Duration:
                    <input
                        type="number"
                        placeholder="hours"
                        value={props.eventData.duration}
                        onChange={(e) => handleDataChange("duration", e.target.value, props.setEventData)}
                        min="1"
                        required
                    />
                </label>
                </>
            ) : (
                <label>Number of days:
                    <input
                        type="number"
                        placeholder="Number of days"
                        value={props.eventData.days}
                        onChange={(e) => handleDataChange("days", e.target.value, props.setEventData)}
                        min="1"
                    />
                </label>
            )}
            <br />


            <label>Frequency:
                <Select
                    value={options.find((option) => option.value === props.eventData.repeatFrequency)}
                    onChange={(selectedOption) => handleFrequencyChange(selectedOption)}
                    options={[
                        { value: "none", label: "No repetition" },
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" },
                        { value: "yearly", label: "Yearly" },
                    ]}
                    styles={{
                        menu: (provided) => ({
                            ...provided,
                            maxHeight: 90,
                            overflowY: "auto",
                        }),
                        menuList: (provided) => ({
                            ...provided,
                            maxHeight: 90,
                        }),
                    }}
                />
                <br />
            </label>

            {props.eventData.repeatFrequency !== "none" && (
                <div>
                    <label>Repeat Mode:
                        <Select
                            value={options.find((option) => option.value === props.eventData.repeatMode)}
                            onChange={(selectedOption) => handleDataChange("repeatMode", selectedOption.value, props.setEventData)}
                            options= {[
                                { value: 'ntimes', label: 'N Times' },
                                { value: 'until', label: 'Until' },
                            ]}
                            styles={{
                                menu: (provided) => ({
                                    ...provided,
                                    maxHeight: 90,
                                    overflowY: 'auto',
                                }),
                                menuList: (provided) => ({
                                    ...provided,
                                    maxHeight: 90,
                                }),
                            }}
                        />
                    </label>
                    <br />
    
                    {props.eventData.repeatMode === "ntimes" ? (
                        <label>Number of repetitions:
                            <input
                                type="number"
                                value={props.eventData.repeatCount}
                                onChange={(e) => handleDataChange("repeatCount", e.target.value, props.setEventData)}
                                defaultValue={1}
                                min="1"
                            />
                        </label>
                    ) : (
                        <label>Repeat until:
                            <input
                                type="date"
                                value={props.eventData.repeatEndDate}
                                onChange={(e) => handleDataChange("repeatEndDate", e.target.value, props.setEventData)}
                            />
                        </label>
                    )}

                    {props.isEditing && (
                        <label>
                            <input
                                className="checkbox"
                                type="checkbox"
                                onChange={(e) => props.setUpdateAllFutureEvents(e.target.checked)
                                }
                            />
                            Update all future instances
                            <br />
                        </label>
                    )}

                    
                </div>
            )}
            <label>Event Location:
                <input
                    type="text"
                    placeholder="physical or virtual"
                    value={props.eventData.eventLocation}
                    onChange={(e) => handleDataChange("eventLocation", e.target.value, props.setEventData)}
                />
            </label>
            {/* Field for notification 
            <label>
                <input
                    className="checkbox"
                    type="checkbox"
                    checked={props.eventData.notify}
                    onChange={(e) => handleEventDataChange("notify", e.target.checked, props.setEventData)}
                />
                Check this box to receive a notification
            </label>
            {props.eventData.notify && (
                <label>
                    <Select
                        value={options.find((option) => option.value === props.eventData.notificationTime)}
                        onChange={(selectedOption) => handleEventDataChange("notificationTime", selectedOption.value, props.setEventData)}
                        options={[
                            { value: "0", label: "At the time of the event" },
                            { value: "sameDay", label: "same day" },
                            { value: "60", label: "1 hour before" },
                            { value: "120", label: "2 hours before" },
                            { value: "1440", label: "1 day before" },
                        ]}
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
            */}
            <button className="btn btn-main" type="submit">
                {props.selectedEvent ? "Save Changes" : "Add Event"}
            </button>
            </form>
        </div>
    ); 
}

export default EventsFunction;