import React, { useState, useContext } from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { generateTimeOptions } from '../../utils/utils';
import ShareInput from '../../components/ShareInput';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';
import NotificationInput from '../../components/Notification/NotificationInput';

const FormEvent = () => {
    
    const { event, setEvent, events, setEvents, resetEvent, selected, resetSelected, notifications, setNotifications} = useCalendar();
    const [deletePopUp, setDeletePopUp] = useState(false);
    const { user } = useContext(AuthContext);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const calcStartDate = (date, allDay, time) => {
        if (date === '') return null

        const startDate = new Date(date);

        const weekday = weekdays[startDate.getDay()];
        const isFreeDay = user.freeDays.includes(weekday);
        if (isFreeDay && event.type === 'work') Swal.fire({ title: 'Warning', icon: 'warning', text: 'Selected date is a free day', customClass: { confirmButton: 'button-alert' } });

        if (allDay) {
            if (event.type === 'work') startDate.setHours(user.workingHours.start.split(':')[0], user.workingHours.start.split(':')[1]);
            else startDate.setHours(user.dayHours.start.split(':')[0], user.dayHours.start.split(':')[1]);
        } else if (time !== '') {
            startDate.setHours(event.time.split(':')[0], event.time.split(':')[1]);
            if (event.type === 'work' && startDate < new Date(date).setHours(user.workingHours.start.split(':')[0], user.workingHours.start.split(':')[1])) {
                Swal.fire({ title: 'Warning', icon: 'warning', text: 'Event start time is before working hours', customClass: { confirmButton: 'button-alert' } });
            } else if (startDate < new Date(date).setHours(user.dayHours.start.split(':')[0], user.dayHours.start.split(':')[1])) {
                Swal.fire({ title: 'Warning', icon: 'warning', text: 'Event start time is before day hours', customClass: { confirmButton: 'button-alert' } });
            }
        }
        return startDate;
    }

    const calcEndDate = (start, duration, allDay) => {

        const endDate = new Date(start);
        if (allDay) {
            endDate.setDate(endDate.getDate() + parseInt(duration));
            if (event.type === 'work') endDate.setHours(user.workingHours.end.split(':')[0], user.workingHours.end.split(':')[1]);
            else endDate.setHours(user.dayHours.end.split(':')[0], user.dayHours.end.split(':')[1]);
        } else {
            endDate.setHours(endDate.getHours() + parseInt(duration));
            if (event.type === 'work' && endDate > new Date(start).setHours(user.workingHours.end.split(':')[0], user.workingHours.end.split(':')[1])) {
                Swal.fire({ title: 'Warning', icon: 'warning', text: 'Event end time is after working hours', customClass: { confirmButton: 'button-alert' } });
            } else if (endDate > new Date(start).setHours(user.dayHours.end.split(':')[0], user.dayHours.end.split(':')[1])) {
                Swal.fire({ title: 'Warning', icon: 'warning', text: 'Event end time is after day hours', customClass: { confirmButton: 'button-alert' } });
            }
        }
    }


    const setStartDate = (date) => {
        
        setEvent({ ...event, startDate: calcStartDate(date, event.allDay, event.time) });
    }

    const setEndDate = (date) => {
        if (date === '') {
            setEvent({ ...event, endDate: null });
            return;
        } else if (!event.startDate) {
            setEvent({ ...event, duration: parseInt(date) });
            return;
        }
        setEvent({ ...event, endDate: calcEndDate(event.start, date, event.allDay), duration: parseInt(date) });
    }

    const setStartTime = (time) => {
        console.log('time', time);
        if (time === '') {
            setEvent({ ...event, time: '' });
            return;
        } else if (!event.startDate) {
            calcStartDate(new Date(), event.allDay, time);
            setEvent({ ...event, time });
            return;
        }
        if (event.duration !== null) setEvent({...event, time, startDate: calcStartDate(event.startDate, event.allDay, time) });
        else setEvent({ ...event, time, startDate: calcStartDate(event.startDate, event.allDay, time), endDate: calcEndDate(event.startDate, event.duration, event.allDay) });


        console.log('startDate', event.startDate);
    }

    const setAllDay = (allDay) => {
        if (!event.startDate) setEvent({ ...event, allDay });
        else if (event.startDate === null) setEvent({ ...event, allDay });
        else setEvent({ ...event, allDay, startDate: calcStartDate(event.startDate, allDay, event.time), endDate: calcEndDate(event.startDate, event.duration, allDay) });
    }

    const handleSubmit = async () => {
        if (event.title === '') {
            Swal.fire({ title: 'Error', icon: 'error', text: 'Title is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }
        if (event.startDate === null) {
            Swal.fire({ title: 'Error', icon: 'error', text: 'Start date is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }
        if (event.endDate === null) {
            Swal.fire({ title: 'Error', icon: 'error', text: 'End date is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }
        if (event.duration === null) {
            Swal.fire({ title: 'Error', icon: 'error', text: 'Duration is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }
        if (event.duration > 1) {
            Swal.fire({ title: 'Error', icon: 'error', text: `Duration must be at least 1 ${event.allDay ? 'day' : 'hour'}`, customClass: { confirmButton: 'button-alert' } });
            return;
        }
        if (!event.allDay && event.time === '') {
            Swal.fire({ title: 'Error', icon: 'error', text: 'Time is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }

        if (event.repeatFrequency !== 'none') {
            if (event.repeatMode === 'ntimes' && event.repeatTimes <= 0) {
                Swal.fire({ title: 'Error', icon: 'error', text: 'Repeat times must be greater than 0', customClass: { confirmButton: 'button-alert' } });
                return;
            }
            if (event.repeatMode === 'until' && event.repeatEndDate === null) {
                Swal.fire({ title: 'Error', icon: 'error', text: 'Repeat end date is required', customClass: { confirmButton: 'button-alert' } });
                return;
            }
            if (new Date(event.repeatEndDate) < new Date(event.startDate)) {
                Swal.fire({ title: 'Error', icon: 'error', text: 'Repeat end date must be after start date', customClass: { confirmButton: 'button-alert' } });
                return;
            }

            let gap = 1;
            if (event.repeatFrequency === 'weekly') gap = 7;
            else if (event.repeatFrequency === 'monthly') gap = 30;
            else if (event.repeatFrequency === 'yearly') gap = 365;

            if (new Date(event.repeatEndDate) - new Date(event.startDate) < gap * 24 * 60 * 60 * 1000) {
                Swal.fire({ title: 'Error', icon: 'error', text: `Repeat end date must be at least ${gap} days after start date`, customClass: { confirmButton: 'button-alert' } });
                return;
            }
        }

        const response = await apiService(`/event/${selected.edit ? event._id : ''}`, selected.edit ? 'PUT' : 'POST', event);
        if (response) {
            Swal.fire({ title: selected.edit ? 'Event updated' : 'Event created', icon: 'success', text: selected.edit ? 'Event updated successfully' : 'Event created successfully', customClass: { confirmButton: 'button-alert' } });
            if (event.repeatFrequency === 'none') setEvents(events.map(evt => evt._id === event._id ? response.event : evt));
            else setEvents([...events.filter(evt => evt.fatherId !== response.events[0].fatherId), ...response.events]);
        } else Swal.fire({ title: 'Error saving event', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        resetEvent();
        resetSelected();
    }

    const deleteEvent = async () => {
        const response = await apiService(`/event/${event._id}`, 'DELETE', event);
        if (response){
            Swal.fire({ title: 'Event deleted', icon: 'success', text: 'Event deleted successfully', customClass: { confirmButton: 'button-alert' } });
            setEvents(events.filter(evt => evt._id !== event._id));
            resetEvent();
        } else Swal.fire({ title: 'Error deleting event', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
    }


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
                        disabled={event.isInProject}
                        required />
                </div>

                <div className='col-6'>
                    <label htmlFor='type' className='form-label'>Event Type</label>
                    <select className='form-select' id='type'
                    value={event.type}
                    disabled={event.isInProject}
                    onChange={(e) => setEvent({...event, type: e.target.value})}>
                        <option value='personal'>Personal</option>
                        <option value='work'>Work</option>
                        <option value='social'>Social</option>
                        <option value='other'>Other</option>
                    </select>
                </div>
            </div>

            <div className='row py-2 d-flex align-items-end'>
                <div className='col-6'>
                    <label htmlFor='date' className='form-label'>Date</label>
                    <input type='Date' className='form-control' id='date'
                    value={event.startDate ? new Date(event.startDate).toLocaleDateString('en-CA') : ''}
                    disabled={event.isInProject}
                    onChange={(e) => setStartDate(e.target.value)} 
                    required />
                </div>

                <div className='col col-6 form-check form-switch'>
                    <input
                        className='form-check-input' type='checkbox' id='allDay'
                        checked={event.allDay}
                        disabled={event.isInProject}
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
                            disabled={event.isInProject}
                            onChange={(e) => setStartTime(e.target.value)}
                            required />
                        ) : (
                            <select className='form-select' id='time'
                            value={event.time}
                            disabled={event.isInProject}
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
                    value={event.duration}
                    disabled={event.isInProject}
                    onChange={(e) => setEndDate(e.target.value)}
                    required />
                </div>
            </div>

            <div className='row py-2'>
                <div className='col col-10'>
                    <label htmlFor='repeatFrequency' className='form-label'>Frequency</label>
                    <select className='form-select' id='repeatFrequency'
                    value={event.repeatFrequency}
                    disabled={event.isInProject}
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
                        value={event.repeatMode}
                        disabled={event.isInProject}
                        onChange={(e) => setEvent({...event, repeatMode: e.target.value})}>
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
                            value={event.repeatTimes}
                            disabled={event.isInProject}
                            onChange={(e) => setEvent({...event, repeatTimes: e.target.value})} 
                            required />
                        </div>
                    ) : (
                        <div className='col col-6'>
                            <label htmlFor='repeatEndDate' className='form-label'>End Date</label>
                            <input type='Date' className='form-control' id='repeatEndDate'
                            value={new Date(event.repeatEndDate).toISOString().split('T')[0]}
                            disabled={event.isInProject}
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
                    disabled={event.isInProject}
                    onChange={(e) => setEvent({...event, eventLocation: e.target.value})}>
                        <option value=''>Not specified</option>
                        <option value='physical'>Physical</option>
                        <option value='virtual'>Virtual</option>
                    </select>
                </div>
            </div>

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
            
            
            <div className='d-flex align-items-center justify-content-center'>
                {!event.isInProject && (
                    <button type='button' className='btn-main rounded shadow-sm mt-4' onClick={() => handleSubmit()}>
                        {selected.edit ? 'edit' : 'save'}
                    </button>
                )}

                {selected.edit && !event.isInProject && (
                    <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setDeletePopUp(true)}>
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