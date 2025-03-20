import React, { useEffect }  from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useEvent } from '../../contexts/EventContext';
import { generateTimeOptions } from '../../utils/utils';

const FormEvent = (props) => {
    
    const { event, setEvent, events, setEvents, resetEvent } = useEvent();

    const handleSubmit = async () => {
        if (props.edit) {
            const response = await apiService('/event/edit', 'POST', event);
            if (response){
                Swal.fire({ title: 'Event edited', icon: 'success', text: 'Event edited successfully', customClass: { confirmButton: 'button-alert' } });
                setEvents(events.map(evt => evt._id === event._id ? event : evt));
                resetEvent();
            } else Swal.fire({ title: 'Error editing event', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });

        } else {
            const response = await apiService('/event/add', 'PUT', event);
            if (response){
                Swal.fire({ title: 'Event added', icon: 'success', text: 'Event added successfully', customClass: { confirmButton: 'button-alert' } });
                setEvents([...events, response]);
                resetEvent();
            } else Swal.fire({ title: 'Error adding event', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        }
    }

    useEffect(() => {
        if (props.edit) {
            setEvent(event);
        }
    }, [props.edit]);

    return (
        <form className='d-flex flex-column w-100' onSubmit={() => handleSubmit()}>

            <div className='row py-2'>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Event title'
                        value={event.title}
                        onChange={(e) => setEvent({...event, ['title']: e.target.value})} 
                        required />
                </div>

                <div className='col-6'>
                    <label htmlFor='type' className='form-label'>Event Type</label>
                    <select className='form-select' id='type'
                    value={event.type}
                    onChange={(e) => setEvent({...event, ['type']: e.target.value})}>
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
                    placeholder={new Date(event.date)} 
                    value={event.date}
                    onChange={(e) => setEvent({...event, ['date']: e.target.value})} 
                    required />
                </div>

                <div className='col col-6 form-check form-switch'>
                    <input
                        className='form-check-input' type='checkbox' id='allDay'
                        checked={event.allDay}
                        onChange={(e) => setEvent({...event, ['allDay']: e.target.checked})} />
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
                            onChange={(e) => setEvent({...event, ['time']: e.target.value})}
                            required />
                        ) : (
                            <select className='form-select' id='time'
                            value={event.time}
                            onChange={(e) => setEvent({...event, ['time']: e.target.value})} required>
                                {generateTimeOptions().map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        )}
                        
                    </div>

                    <div className='col col-auto form-check form-switch'>
                        <input
                            className='form-check-input' type='checkbox' id='isPreciseTime'
                            checked={event.isPreciseTime}
                            onChange={(e) => setEvent({...event, ['isPreciseTime']: e.target.checked})} />
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
                    onChange={(e) => setEvent({...event, ['duration']: e.target.value})} 
                    required />
                </div>
            </div>

            <div className='row py-2'>
                <div className='col col-10'>
                    <label htmlFor='repeatFrequency' className='form-label'>Frequency</label>
                    <select className='form-select' id='repeatFrequency'
                    value={event.repeatFrequency}
                    onChange={(e) => setEvent({...event, ['repeatFrequency']: e.target.value})}>
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
                        onChange={(e) => setEvent({...event, ['repeatMode']: e.target.value})}>
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
                            onChange={(e) => setEvent({...event, ['repeatTimes']: e.target.value})} 
                            required />
                        </div>
                    ) : (
                        <div className='col col-6'>
                            <label htmlFor='repeatEndDate' className='form-label'>End Date</label>
                            <input type='Date' className='form-control' id='repeatEndDate'
                            placeholder={new Date()}
                            value={event.repeatEndDate}
                            onChange={(e) => setEvent({...event, ['repeatEndDate']: e.target.value})}
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
                    onChange={(e) => setEvent({...event, ['eventLocation']: e.target.value})}>
                        <option value=''>Not specified</option>
                        <option value='physical'>Physical</option>
                        <option value='virtual'>Virtual</option>
                    </select>
                </div>
            </div>

            <div className='row py-2'>
                <div className='col-6'>
                    {/* Field for notification TODO */}
                </div>
                <div className='col-6'>
                    {/* Field for share TODO */}
                </div>
            </div>
            
            
            <button type='submit' className='btn-main rounded shadow-sm mt-4'>{props.edit ? 'edit' : 'save'}</button>
        </form>
    )
}

export default FormEvent;