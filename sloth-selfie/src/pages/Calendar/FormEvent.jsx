import React, { useState } from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import { generateTimeOptions } from '../../utils/utils';
import ShareInput from '../../components/ShareInput';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';
import NotificationInput from '../../components/Notification/NotificationInput';

const FormEvent = () => {
    
    const { event, setEvent, events, setEvents, resetEvent, selected, notifications, setNotifications} = useCalendar();
    const [deletePopUp, setDeletePopUp] = useState(false);

    const handleSubmit = async () => {
        if (selected.edit) {
            const response = await apiService(`/event/${event._id}`, 'PUT', event);
            if (response){
                Swal.fire({ title: 'Event edited', icon: 'success', text: 'Event edited successfully', customClass: { confirmButton: 'button-alert' } });
                setEvents(events.map(evt => evt._id === event._id ? event : evt));
                resetEvent();
            } else Swal.fire({ title: 'Error editing event', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });

        } else if (selected.add) {
            const response = await apiService('/event', 'POST', event);
            if (response){
                Swal.fire({ title: 'Event added', icon: 'success', text: 'Event added successfully', customClass: { confirmButton: 'button-alert' } });
                setEvents([...events, response]);
                resetEvent();
            } else Swal.fire({ title: 'Error adding event', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        }
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
        <div className='d-flex flex-column w-100'>
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
                    value={new Date(event.startDate).toISOString().split('T')[0]}
                    disabled={event.isInProject}
                    onChange={(e) => setEvent({...event, startDate: e.target.value})} 
                    required />
                </div>

                <div className='col col-6 form-check form-switch'>
                    <input
                        className='form-check-input' type='checkbox' id='allDay'
                        checked={event.allDay}
                        disabled={event.isInProject}
                        onChange={(e) => setEvent({...event, allDay: e.target.checked})} />
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
                            onChange={(e) => setEvent({...event, time: e.target.value})}
                            required />
                        ) : (
                            <select className='form-select' id='time'
                            value={event.time}
                            disabled={event.isInProject}
                            onChange={(e) => setEvent({...event, time: e.target.value})} required>
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
                    onChange={(e) => setEvent({...event, duration: e.target.value})} 
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