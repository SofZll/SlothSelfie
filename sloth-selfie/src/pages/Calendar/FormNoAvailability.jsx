import React, { useEffect }  from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { generateTimeOptions } from '../../utils/utils';

import { useCalendar } from '../../contexts/CalendarContext';

const FormNoAvailability = () => {

    const { availability, setAvailability, selected } = useCalendar();

    const handleSubmit = async () => {
        
    }

    const deleteAvailability = async () => {
        
    }

    return (
        <form className='d-flex flex-column w-100'>
            <div className='row py-2'>
                <div className='col-6'>
                    <label htmlFor='startDate' className='form-label'>Start Date</label>
                    <input type='date' className='form-control' id='startDate'
                        value={new Date(availability.startDate).toISOString().split('T')[0]}
                        onChange={(e) => setAvailability({ ...availability, startDate: e.target.value })}
                        required />
                </div>
                {availability.days ? (
                    <div className='col-6'>
                        <label htmlFor='endDate' className='form-label'>End Date</label>
                        <input type='date' className='form-control' id='endDate'
                        value={new Date(availability.endDate).toISOString().split('T')[0]}
                        onChange={(e) => setAvailability({ ...availability, endDate: e.target.value })}
                        required />
                    </div>
                ) : (
                    <div className='col-6'>
                        <label htmlFor='time' className='form-label'>Time</label>
                        <select className='form-select' id='time'
                        value={availability.startTime}
                        onChange={(e) => setAvailability({ ...availability, startTime: e.target.value })}>
                            {generateTimeOptions().map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className='row py-2'>
                <div className='col col-auto form-check form-switch ms-2'>
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
                        onChange={(e) => setAvailability({ ...availability, duration: e.target.value })}
                        min={1}
                        required />
                    </div>
                </div>
            )}

            <div className='row py-2'>
                <div className='col col-10'>
                    <label htmlFor='repeatFrequency' className='form-label'>Repeat Frequency</label>
                    <select className='form-select' name='repeatFrequency'
                    value={availability.repeatFrequency}
                    onChange={(e) => setAvailability({ ...availability, repeatFrequency: e.target.value })}>
                        <option value='none'>None</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                        <option value='yearly'>Yearly</option>
                    </select>
                </div>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' className='btn-main rounded shadow-sm mt-4' onClick={() => handleSubmit()}>{selected.edit ? 'edit' : 'save'}</button>
                {selected.edit && (
                    <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => deleteAvailability()}>delete</button>
                )}
            </div>
        </form>
    )
}

export default FormNoAvailability;