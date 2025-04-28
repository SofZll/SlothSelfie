import React, { useState, useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { generateTimeOptions } from '../../utils/utils';
import { apiService } from '../../services/apiService';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';

import { useCalendar } from '../../contexts/CalendarContext';

const FormNoAvailability = () => {

    const { availability, setAvailability, availabilities, setAvailabilities, resetAvailability, selected, resetSelected, setConditionsMet, conditionsMet } = useCalendar();
    const [deletePopUp, setDeletePopUp] = useState(false);

    const setStartDate = (date) => {
        const newDate = new Date(date);
        if (availability.days) {
            newDate.setHours(0, 0, 0, 0);
            setAvailability({ ...availability, startDate: newDate });
        } else {
            newDate.setHours(new Date(availability.startDate).getHours(), new Date(availability.startDate).getMinutes(), 0, 0);
            if (selected.edit) {
                const newEndDate = new Date(newDate);
                newEndDate.setHours(newEndDate.getHours() + parseInt(availability.duration), newEndDate.getMinutes(), 0, 0);
                setAvailability({ ...availability, startDate: newDate, endDate: newEndDate });
            } else setAvailability({ ...availability, startDate: newDate });
        }
    }

    const setEndDate = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        setAvailability({ ...availability, endDate: newDate });
        console.log(availability);
    }


    const setStartTime = (time) => {
        const [hours, minutes] = time.split(':');
        const newDate = new Date(availability.startDate);
        const newEndDate = new Date(availability.startDate);
        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        newEndDate.setHours(parseInt(hours) + parseInt(availability.duration), parseInt(minutes), 0, 0);

        setAvailability({ ...availability, startTime: time, startDate: newDate, endDate: newEndDate });
    }

    const setEndTime = (duration) => {
        if (!duration) setAvailability({ ...availability, duration: null });
        else {
            const newDate = new Date(availability.startDate);
            newDate.setHours(newDate.getHours() + parseInt(duration), newDate.getMinutes(), 0, 0);
            setAvailability({ ...availability, endDate: newDate, duration: parseInt(duration) });
        }
    }


    const handleSubmit = async () => {
        
        if (!availability.days) {

            if (!availability.endDate > new Date(availability.startDate).setHours(23, 59, 59, 999)) {
                NewSwal.fire({ title: 'Warning', icon: 'warning', text: 'End time must be before the next day'});
                return;
            }
        }

        if (availability.repeatFrequency !== 'none') {
            let gap = 1;
            if (availability.repeatFrequency === 'weekly') gap = 7;
            else if (availability.repeatFrequency === 'monthly') gap = 30;
            else if (availability.repeatFrequency === 'yearly') gap = 365;

            if (new Date(availability.endDate).getDate() >= new Date(availability.startDate).getDate() + gap) {
                NewSwal.fire({ title: 'Warning', icon: 'warning', text: 'End date must be before the next occurrence'});
                return;
            }
        }

        const response = await apiService(`/no-availability/${selected.edit ? availability._id : ''}`, selected.edit ? 'PUT' : 'POST', availability);

        if (response.success) {
            NewSwal.fire({ title: selected.edit ? 'Availability edited' : 'Availability added', icon: 'success', text: selected.edit ? 'Availability edited successfully' : 'Availability added successfully'});
            if (selected.edit) {
                if (availability.repeatFrequency === 'none') setAvailabilities(availabilities.map(a => a._id === availability._id ? response.noAvailability : a));
                else setAvailabilities([...availabilities.filter(a => a.fatherId !== availability.fatherId), ...response.listNoAvailability]);
            }
            else setAvailabilities([...availabilities, ...(availability.repeatFrequency !== 'none' ? response.listNoAvailability : [response.noAvailability])]);
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message});

        resetAvailability();
        resetSelected();
    }

    const deleteAvailability = async () => {
        const response = await apiService(`/no-availability/${availability._id}`, 'DELETE');
        if (response.success) {
            NewSwal.fire({ title: 'Availability deleted', icon: 'success', text: 'Availability deleted successfully'});
            if (availability.repeatFrequency === 'none') setAvailabilities(availabilities.filter(a => a._id !== availability._id));
            else setAvailabilities(availabilities.filter(a => a.fatherId !== availability._id && a._id !== availability._id));
        } else NewSwal.fire({ title: 'Error deleting availability', icon: 'error', text: response.message});
        resetAvailability();
        resetSelected();
    }

    useEffect(() => {
        if (!availability.startDate || !availability.endDate) {
            setConditionsMet(false);
        }else if (!availability.days && (!availability.startTime || !availability.duration)) {
            setConditionsMet(false);
        } else if (availability.startDate > availability.endDate) {
            setConditionsMet(false);
        } else if (availability.repeatFrequency !== 'none' && (!availability.numberOfOccurrences || availability.numberOfOccurrences < 1)) {
            setConditionsMet(false);
        } else {
            setConditionsMet(true);
        }
    }, [availability.startDate, availability.endDate, availability.repeatFrequency, availability.numberOfOccurrences]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            <div className='row py-2'>
                <div className='col-6'>
                    <label htmlFor='startDate' className='form-label'>Start Date</label>
                    <input type='date' className='form-control' id='startDate'
                        value={new Date(availability.startDate).toLocaleDateString('en-CA')}
                        onChange={(e) => setStartDate(e.target.value)}
                        required />
                </div>
                {availability.days ? (
                    <div className='col-6'>
                        <label htmlFor='endDate' className='form-label'>End Date</label>
                        <input type='date' className='form-control' id='endDate'
                        value={new Date(availability.endDate).toLocaleDateString('en-CA')}
                        onChange={(e) => setEndDate(e.target.value)}
                        required />
                    </div>
                ) : (
                    <div className='col-6'>
                        <label htmlFor='time' className='form-label'>Time</label>
                        <select className='form-select' id='time'
                        value={availability.startTime}
                        onChange={(e) => setStartTime(e.target.value)}>
                            <option value=''>Select time</option>
                            {generateTimeOptions().map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className='row py-2'>
                <div className='col col-auto form-check form-switch ms-3'>
                    <input className='form-check-input' type='checkbox' id='days'
                        checked={!availability.days}
                        onChange={(e) => setAvailability({ ...availability, days: !e.target.checked })} />
                    <label className='form-check-label' htmlFor='days'>it lasts hours</label>
                </div>
            </div>

            {!availability.days && (
                <div className='row py-2'>
                    <div className='col-10'>
                        <label htmlFor='duration' className='form-label'>Duration</label>
                        <input type='number' className='form-control' id='duration'
                        placeholder='Duration in hours'
                        value={availability.duration}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={1}
                        required />
                    </div>
                </div>
            )}

            <div className='row py-2'>
                <div className='col col-6'>
                    <label htmlFor='repeatFrequency' className='form-label'>Repeat Frequency</label>
                    <select className='form-select' name='repeatFrequency'
                    value={availability.repeatFrequency}
                    onChange={(e) => setAvailability({ ...availability, repeatFrequency: e.target.value })}>
                        <option value='none'>None</option>
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                        <option value='yearly'>Yearly</option>
                    </select>
                </div>
                {availability.repeatFrequency !== 'none' && (
                    <div className='col col-6'>
                        <label htmlFor='numberOfOccurrences' className='form-label'>Number of Occurrences</label>
                        <input type='number' className='form-control' id='numberOfOccurrences'
                        placeholder='Number of occurrences'
                        value={availability.numberOfOccurrences}
                        onChange={(e) => setAvailability({ ...availability, numberOfOccurrences: e.target.value })}
                        min={1}
                        required />
                    </div>
                )}
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' className='btn-main rounded shadow-sm mt-4'  disabled={!conditionsMet} onClick={() => handleSubmit()}>{selected.edit ? 'edit' : 'save'}</button>
                {selected.edit && (
                    <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setDeletePopUp(true)}>delete</button>
                )}
            </div>

            {deletePopUp && (
                <DeletePopUpLayout handleDelete={() => deleteAvailability()} handleClose={() => setDeletePopUp(false)}>
                    <div className='d-flex flex-column text-start'>
                        Are you sure you want to delete this {availability.repeatFrequency !== 'none' && 'series of '}availability?
                    </div>

                    <div className='d-flex justify-content-between pe-3 pt-2'>

                        <div className='d-flex flex-column'>
                            <div className='fst-italic' style={{ color: '#244476' }}>
                                start: {new Date(availability.startDate).toLocaleDateString('en-CA')}
                            </div>
                            <div className='fst-italic' style={{ color: '#244476' }}>
                                end: {new Date(availability.endDate).toLocaleDateString('en-CA')}
                            </div>
                        </div>

                        {availability.repeatFrequency !== 'none' && (
                            <div className='d-flex flex-column'>
                                <div className='fst-italic' style={{ color: '#244476' }}>
                                    repeat: {availability.repeatFrequency}
                                </div>
                                <div className='fst-italic' style={{ color: '#244476' }}>
                                    occurrences: {availability.numberOfOccurrences}
                                </div>
                            </div>
                        )}
                    </div>
                </DeletePopUpLayout>
            )}
        </div>
    )
}

export default FormNoAvailability;