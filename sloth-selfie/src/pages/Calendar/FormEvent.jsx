import React, { useState, useContext, useEffect } from 'react';

import { toastWarning, NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useTools } from '../../contexts/ToolsContext';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';
import { generateTimeOptions } from '../../utils/utils';
import ShareInput from '../../components/ShareInput';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';
import NotificationInput from '../../components/Notification/NotificationInput';
import SliderPriority from '../../components/SliderPriority';

const FormEvent = () => {
    const { getVirtualNow } = useContext(TimeMachineContext);
    const { event, setEvent, events, setEvents, resetEvent, selected, resetSelected, notifications, setNotifications, setConditionsMet, conditionsMet } = useCalendar();
    const { user } = useContext(AuthContext);
    const { toolEvents, setToolEvents, setRooms, setDevices } = useTools();

    const virtualNow = getVirtualNow();
    const [deletePopUp, setDeletePopUp] = useState(false);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const startTimeWarning = (time) => {
        const startDate = new Date(virtualNow);
        if (time !== '') {
            startDate.setHours(event.time.split(':')[0], event.time.split(':')[1]);
            if (event.type === 'work') {
                if (startDate < new Date(startDate).setHours(user.workingHours.start.split(':')[0], user.workingHours.start.split(':')[1])) {
                    toastWarning('Warning', 'Event start time is before working hours');
                } else if (startDate > new Date(startDate).setHours(user.workingHours.end.split(':')[0], user.workingHours.end.split(':')[1])) {
                    toastWarning('Warning', 'Event start time is after working hours');
                }
            } else if (startDate < new Date(startDate).setHours(user.dayHours.start.split(':')[0], user.dayHours.start.split(':')[1])) {
                toastWarning('Warning', 'Event start time is before day hours');
            } else if (startDate > new Date(startDate).setHours(user.dayHours.end.split(':')[0], user.dayHours.end.split(':')[1])) {
                toastWarning('Warning', 'Event start time is after day hours');
            }
        }
    }

    const endTimeWarning = (time, duration) => {
        const startDate = new Date(virtualNow);
        if (time !== '') {
            startDate.setHours(event.time.split(':')[0], event.time.split(':')[1]);
            if (duration) {
                startDate.setHours(startDate.getHours() + parseInt(duration));
                if (event.type === 'work' && startDate > new Date(startDate).setHours(user.workingHours.end.split(':')[0], user.workingHours.end.split(':')[1])) {
                    toastWarning('Warning', 'Event end time is after working hours');
                } else if (startDate > new Date(startDate).setHours(user.dayHours.end.split(':')[0], user.dayHours.end.split(':')[1])) {
                    toastWarning('Warning', 'Event end time is after day hours');
                }
            }
        }
    }

    const weekendWarning = (start, duration) => {
        if (start) {
            const weekday = weekdays[new Date(start).getDay()];
            const isFreeDay = user.freeDays.includes(weekday);
            if (isFreeDay && event.type === 'work') return toastWarning('Warning', 'Selected date is a free day');
        }

        if (duration) {
            for (let i = 1; i < duration; i++) {
                const nextDate = new Date(start);
                nextDate.setDate(nextDate.getDate() + i);
                const weekday = weekdays[nextDate.getDay()];
                const isFreeDay = user.freeDays.includes(weekday);
                if (isFreeDay && event.type === 'work') return toastWarning('Warning', 'Selected date is a free day');
            }
        }
    }
    
    const calcStartDate = (date, allDay, time) => {

        if (date !== '') {
            const startDate = new Date(date);

            if (!allDay && time !== '') startDate.setHours(time.split(':')[0], time.split(':')[1]);
            
            return startDate;
        } else return null;
    }

    const calcEndDate = (start, allDay, duration) => {

        const endDate = new Date(start);
        if (!allDay) {
            if (event.time !== '') {
                endDate.setHours(endDate.getHours() + parseInt(duration));
                endTimeWarning(event.time, duration);
            }
        } else {
            endDate.setDate(endDate.getDate() + parseInt(duration) - 1);
        }
        return endDate;
    }

    const setStartDate = (date) => {
        if (date === '' || date === null) {
            setEvent({ ...event, startDate: null });
            return;
        } 

        const startDate = calcStartDate(date, event.allDay, event.time);
        if (event.duration && (event.allDay || event.time !== '')) {
            const endDate = calcEndDate(startDate, event.allDay, event.duration);
            setEvent({ ...event, startDate, endDate });
            endTimeWarning(event.time, event.duration);
        } else setEvent({ ...event, startDate });
        weekendWarning(startDate);
    }

    const setEndDate = (duration) => {
        if (duration === '') {
            setEvent({ ...event, duration: null });
            return;
        }
        
        if (!event.startDate) {
            setEvent({ ...event, duration: parseInt(duration) });
            return;
        }

        setEvent({ ...event, duration: parseInt(duration), endDate: calcEndDate(event.startDate, event.allDay, duration) });
        if (event.allDay) weekendWarning(event.startDate, duration);
    }

    const setStartTime = (time) => {
        if (time === '') return setEvent({ ...event, time: '' });
        else if (!event.startDate) {
            setEvent({ ...event, time });
            startTimeWarning(time);
        } else if (event.duration === null) setEvent({...event, time, startDate: calcStartDate(event.startDate, event.allDay, time) });
        else {
            const start = calcStartDate(event.startDate, event.allDay, time);
            const end = calcEndDate(start, event.allDay, event.duration);
            setEvent({ ...event, time, startDate: start, endDate: end });
            endTimeWarning(time, event.duration);
        }
            startTimeWarning(time);
    }

    const setAllDay = (allDay) => {
        if (!event.startDate) setEvent({ ...event, allDay });
        else if (!event.duration || (!allDay && event.time === '')) {
            const start = calcStartDate(event.startDate, allDay, event.time);
            setEvent({ ...event, allDay, startDate: start });
        }
        else {
            const start = calcStartDate(event.startDate, allDay, event.time);
            const end = calcEndDate(start, allDay, event.duration);
            setEvent({ ...event, allDay, startDate: start, endDate: end });
        }
    }

    const handleSubmit = async () => {
        if (event.repeatFrequency !== 'none') {

            let gap = 1;
            if (event.repeatFrequency === 'weekly') gap = 7;
            else if (event.repeatFrequency === 'monthly') gap = 30;
            else if (event.repeatFrequency === 'yearly') gap = 365;

            if (new Date(event.repeatEndDate).getDate - new Date(event.startDate).getDate  < gap * 24 * 60 * 60 * 1000) {
                NewSwal.fire({ title: 'Error', icon: 'error', text: `Repeat end date must be at least ${gap} days after start date`});
                return;
            }
        }

        const response = await apiService(`/event/${selected.edit ? event._id : ''}`, selected.edit ? 'PUT' : 'POST', event);
        if (response.success) {
            NewSwal.fire({ title: selected.edit ? 'Event updated' : 'Event created', icon: 'success', text: selected.edit ? 'Event updated successfully' : 'Event created successfully'});
            if (event.repeatFrequency === 'none') {
                if (selected.edit) setEvents([...events.filter(evt => evt._id !== event._id && evt.fatherId !== event.fatherId), response.event]);
                else setEvents([...events, response.event]);
            } else setEvents([...events.filter(evt => evt.fatherId !== response.events[0].fatherId && evt._id !== response.events[0]._id), ...response.events]);
        } else NewSwal.fire({ title: 'Error saving event', icon: 'error', text: response.message});
        resetEvent();
        resetSelected();
    }

    const deleteEvent = async () => {
        const response = await apiService(`/event/${event._id}`, 'DELETE', event);
        if (response.success) {
            NewSwal.fire({ title: 'Event deleted', icon: 'success', text: 'Event deleted successfully'});
            if (user.isAdmin) {
                if (event.repeatFrequency === 'none') setToolEvents(toolEvents.filter(evt => evt._id !== event._id));
                else setToolEvents(toolEvents.filter(evt => evt.fatherId !== event.fatherId));
                const response = await apiService('/users/tools', 'GET');
                if (response.success) {
                    setRooms(response.rooms);
                    setDevices(response.devices);
                }
            } else {
                if (event.repeatFrequency === 'none') setEvents(events.filter(evt => evt._id !== event._id));
                else setEvents(events.filter(evt => evt.fatherId !== event.fatherId));
            }
        } else NewSwal.fire({ title: 'Error deleting event', icon: 'error', text: response.message});
            
        setDeletePopUp(false);
        resetSelected();
        resetEvent();
    }

    useEffect(() => {
        console.log(event, 'eeeeeeeeeeeeee');
    }, [event]);

    useEffect(() => {
        if (!event.title || !event.startDate || !event.endDate || !event.duration || event.duration <= 0) {
            setConditionsMet(false);
        } else if (!event.allDay && event.time === '') {
            setConditionsMet(false); 
        } else if (event.type === '') {
            setConditionsMet(false);
        } else if (user.isAdmin) {
            setConditionsMet(false);
        } else if (event.isInProject) {
            setConditionsMet(false);
        } else setConditionsMet(true);
        
        if (event.repeatFrequency !== 'none') {
            if (event.repeatMode === 'ntimes' && event.repeatTimes <= 0) {
                setConditionsMet(false);
            } else if (event.repeatMode === 'until' && event.repeatEndDate === null) {
                setConditionsMet(false);
            } else if (event.repeatMode === 'until' && new Date(event.repeatEndDate) < new Date(event.startDate)) {
                if (!selected.edit) setConditionsMet(false);
            }
        }
    }, [event.title, event.startDate, event.endDate, event.duration, event.allDay, event.time, event.repeatFrequency, event.repeatMode, event.repeatTimes, event.repeatEndDate]);


    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden' style={{ maxHeight: '70vh' }}>
            <div className='row py-2'>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Event title'
                        value={event.title}
                        onChange={(e) => setEvent({...event, title: e.target.value})}
                        disabled={event.isInProject || event.tool}
                        required />
                </div>

                {event.tool ? (
                    <div className='col-6'>
                        owner:
                        <div className='d-inline-block fst-italic ms-2' style={{ color: '#244476' }}>{event.user.username}</div>
                    </div>
                ) : (
                    <div className='col-6'>
                        <label htmlFor='type' className='form-label'>Event Type</label>
                        <select className='form-select' id='type'
                        value={event.type}
                        disabled={event.isInProject}
                        onChange={(e) => setEvent({...event, type: e.target.value})}>
                            <option value=''>Select type</option>
                            <option value='personal'>Personal</option>
                            <option value='work'>Work</option>
                            <option value='social'>Social</option>
                            <option value='other'>Other</option>
                        </select>
                    </div>
                )}
            </div>

            <div className='row py-2'>
                <div className='col-12'>
                    <label htmlFor='priority' className='form-label'>Priority</label>
                    <SliderPriority />
                </div>
            </div>

            <div className='row py-2 d-flex align-items-end'>
                <div className='col-6'>
                    <label htmlFor='date' className='form-label'>Date</label>
                    <input type='Date' className='form-control' id='date'
                    value={event.startDate ? new Date(event.startDate).toLocaleDateString('en-CA') : ''}
                    disabled={event.isInProject || event.tool}
                    onChange={(e) => setStartDate(e.target.value)}
                    required />
                </div>

                <div className='col col-6 form-check form-switch'>
                    <input
                        className='form-check-input' type='checkbox' id='allDay'
                        checked={event.allDay}
                        disabled={event.isInProject || event.tool}
                        onChange={(e) => setAllDay(e.target.checked)} />
                    <label className='form-check-label' htmlFor='allDay'>All Day</label>
                </div>
            </div>

            {!event.allDay && (
                <div className='row py-2 d-flex align-items-end'>
                    
                    <div className='col col-6 form-check px-3'>
                        <label htmlFor='time' className='form-label'>Time</label>

                        {event.isPreciseTime ? (
                            <input type='time' className='form-control' id='time'
                            placeholder='Event time'
                            value={event.time}
                            disabled={event.isInProject || event.tool}
                            onChange={(e) => setStartTime(e.target.value)}
                            required />
                        ) : (
                            <select className='form-select' id='time'
                            value={event.time || ''}
                            disabled={event.isInProject || event.tool}
                            onChange={(e) => setStartTime(e.target.value)} required>
                                <option value=''>Select time</option>
                                {generateTimeOptions().map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        )}
                        
                    </div>

                    <div className='col col-6 form-check form-switch'>
                        <input
                            className='form-check-input' type='checkbox' id='isPreciseTime'
                            checked={event.isPreciseTime}
                            disabled={event.isInProject || event.tool}
                            onChange={(e) => setEvent({...event, isPreciseTime: e.target.checked})} />
                        <label className='form-check-label' htmlFor='isPreciseTime'>Precise Time</label>
                    </div>
                </div>
            )}


            <div className='row py-2'>
                <div className='col col-10'>
                    <label htmlFor='duration' className='form-label'>Duration</label>
                    <input type='number' className='form-control' id='duration'
                    placeholder={event.allDay ? 'Duration in days' : 'Duration in hours'}
                    min={0}
                    value={event.duration || ''}
                    disabled={event.isInProject || event.tool}
                    onChange={(e) => setEndDate(e.target.value)}
                    required />
                </div>
            </div>

            <div className='row py-2'>
                <div className='col col-10'>
                    <label htmlFor='repeatFrequency' className='form-label'>Frequency</label>
                    <select className='form-select' id='repeatFrequency'
                    value={event.repeatFrequency}
                    disabled={event.isInProject || event.tool}
                    onChange={(e) => setEvent({...event, repeatFrequency: e.target.value})}>
                        <option value='none'>No repetition</option>
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                        <option value='yearly'>Yearly</option>
                    </select>
                </div>
            </div>

            {event.repeatFrequency !== 'none' && (
                <div className='row py-2'>
                    <div className='col col-6'>
                        <label htmlFor='repeatMode' className='form-label'>Mode</label>
                        <select className='form-select' id='repeatMode'
                        value={event.repeatMode || ''}
                        disabled={event.isInProject || event.tool}
                        onChange={(e) => setEvent({...event, repeatMode: e.target.value, repeatTimes: 0, repeatEndDate: null})}>
                            <option value='ntimes'>Repeat N times</option>
                            <option value='until'>Repeat until</option>
                        </select>
                    </div>

                    {event.repeatMode === 'ntimes' ? (
                        <div className='col col-6'>
                            <label htmlFor='repeatTimes' className='form-label'>Times</label>
                            <input type='number' className='form-control' id='repeatTimes'
                            placeholder='Number of repetitions'
                            min={0}
                            value={event.repeatTimes || ''}
                            disabled={event.isInProject || event.tool}
                            onChange={(e) => setEvent({...event, repeatTimes: parseInt(e.target.value)})} 
                            required />
                        </div>
                    ) : (
                        <div className='col col-6'>
                            <label htmlFor='repeatEndDate' className='form-label'>End Date</label>
                            <input type='Date' className='form-control' id='repeatEndDate'
                            value={event.repeatEndDate ? new Date(event.repeatEndDate).toLocaleDateString('en-CA') : ''}
                            disabled={event.isInProject || event.tool}
                            onChange={(e) => setEvent({...event, repeatEndDate: e.target.value})}
                            required />
                        </div>
                    )}
                </div>
            )}

            <div className='row py-2'>
                <div className='col col-10'>
                    <label htmlFor='eventLocation' className='form-label'>Location</label>
                    <select className='form-select' id='eventLocation'
                    value={event.eventLocation}
                    disabled={event.isInProject || event.tool}
                    onChange={(e) => setEvent({...event, eventLocation: e.target.value})}>
                        <option value=''>Not specified</option>
                        <option value='physical'>Physical</option>
                        <option value='virtual'>Virtual</option>
                    </select>
                </div>
            </div>

            {!(event.isInProject || event.tool) && (
                <>
                    <div className='row py-2'>
                        <div className='col-12'>
                            <label htmlFor='share' className='form-label'>Share with</label>
                            <ShareInput receivers={event.sharedWith} setReceivers={(receivers) => setEvent({...event, sharedWith: receivers})} />
                        </div>
                    </div>

                    <div className='row py-2'>
                        <div className='col-12 justify-content-center align-items-center d-flex'>
                        <NotificationInput notifications={notifications} setNotifications={setNotifications}/>
                        </div>
                    </div>
                </>
            )}
                    
            
            <div className='d-flex align-items-center justify-content-center bg-white'>
                {!(event.isInProject || event.tool) && (
                    <button type='button' aria-label='edit-save' className='btn-main rounded shadow-sm mt-4' disabled={!conditionsMet} onClick={() => handleSubmit()}>
                        {selected.edit ? 'edit' : 'save'}
                    </button>
                )}

                {selected.edit && !event.isInProject && (user.isAdmin || !event.tool) && (
                    <button type='button' aria-label='delete' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setDeletePopUp(true)}>
                        delete
                    </button>
                )}
            </div>

            {deletePopUp && (
                <DeletePopUpLayout handleDelete={() => deleteEvent()} handleClose={() => setDeletePopUp(false)}>
                    <div className='d-flex flex-column text-start'>
                        Are you sure you want to delete this {event.repeatFrequency !== 'none' ? 'recurring event' : 'event'}?
                    </div>
                    <div className='d-flex flex-column'>
                        <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{event.title}</div>
                        <div className='fst-italic' style={{ color: '#244476' }}>start: {new Date(event.startDate).toLocaleDateString()}</div>
                        <div className='fst-italic' style={{ color: '#244476' }}>end: {new Date(event.endDate).toLocaleDateString()}</div>

                        {event.repeatFrequency !== 'none' && (
                            <>
                            {event.repeatMode === 'ntimes' ? (
                                <div className='fst-italic' style={{ color: '#244476' }}>repeat {event.repeatTimes} times</div>
                            ) : (
                                <div className='fst-italic' style={{ color: '#244476' }}>repeat until {new Date(event.repeatEndDate).toLocaleDateString()}</div>
                            )}
                            </>
                        )}
                    </div>
                </DeletePopUpLayout>
            )}

        </div>
    )
}

export default FormEvent;