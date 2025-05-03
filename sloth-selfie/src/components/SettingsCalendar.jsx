import React, { useState, useEffect, useContext } from 'react';
import { NewSwal } from '../utils/swalUtils';

import { generateTimeOptions } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const SettingsCalendar = () => {
    const { user, setUser, calendarSettings, setCalendarSettings } = useContext(AuthContext);

    const [daysOff, setDaysOff] = useState([]);
    const [workingHours, setWorkingHours] = useState({
        start: '',
        end: '',
    });
    const [dayHour, setDayHour] = useState({
        start: '',
        end: '',
    });

    const handleSaveSettings = async () => {
        const response = await apiService('/user/edit-schedule', 'PUT', {daysOff, workingHours, dayHour});
        if (response.success){
            NewSwal({ title: 'Success', text: 'Settings saved correctly!', icon: 'success'});
            setUser({ ...user, workingHours: {...response.workingHours}, freeDays: [...response.freeDays], dayHours: {...response.dayHours} });
        } else NewSwal({ title: 'Error', text: 'There was an issue saving your settings. Please try again.', icon: 'error'});
    }

    const selectDaysOff = (selectedValue) => {
        const isAlreadySelected = daysOff.includes(selectedValue);

        if (isAlreadySelected) setDaysOff(daysOff.filter((day) => day !== selectedValue));
        else setDaysOff([...daysOff, selectedValue]);
    };

    useEffect(() => {
        if (user) {
            setWorkingHours({
                start: user.workingHours.start,
                end: user.workingHours.end,
            });
            setDayHour({
                start: user.dayHours.start,
                end: user.dayHours.end,
            });
            setDaysOff(user.freeDays);
        }
    }, [user]);

    if (!calendarSettings) return null;

    return (
        <div className={`modal fade ${calendarSettings ? 'show d-block' : ''}`} id='settingsCalendarModal' tabIndex='-1' aria-labelledby='settingsCalendarModal' aria-hidden='true' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-dialog-centered'>
                <div className='modal-content '>
                    <div className='modal-header'>
                        <h5 className='modal-title py-2' style={{ color: '#244476' }}>Calendar Settings</h5>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' onClick={() => setCalendarSettings(false)}></button>
                    </div>
                    <div className='modal-body overflow-y-scroll col-12' style={{ maxHeight: 'calc(80vh - 200px)' }}>
                        <div className='d-flex flex-column justify-content-around h-100 py-2 gap-3'>
                            <div className='row py-2'>
                                <div className='col-6 d-flex align-items-stretch justify-content-between flex-column'>
                                    <label htmlFor='startWorkingHour'>Start Working Hour</label>
                                    <select
                                        id='startWorkingHour'
                                        className='form-select'
                                        value={workingHours.start}
                                        onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}>
                                        {generateTimeOptions().map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='col-6 d-flex align-items-stretch justify-content-between flex-column'>
                                    <label htmlFor='endWorkingHour'>End Working Hour</label>
                                    <select
                                        id='endWorkingHour'
                                        className='form-select'
                                        value={workingHours.end}
                                        onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}>
                                        {generateTimeOptions().map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='row py-2'>
                                <div className='col-6 d-flex align-items-stretch justify-content-between flex-column'>
                                    <label htmlFor='startDayHour'>Start Day Hour</label>
                                    <select
                                        id='startDayHour'
                                        className='form-select'
                                        value={dayHour.start}
                                        onChange={(e) => setDayHour({ ...dayHour, start: e.target.value })}>
                                        {generateTimeOptions().map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='col-6 d-flex align-items-stretch justify-content-between flex-column'>
                                    <label htmlFor='endDayHour'>End Day Hour</label>
                                    <select
                                        id='endDayHour'
                                        className='form-select'
                                        value={dayHour.end}
                                        onChange={(e) => setDayHour({ ...dayHour, end: e.target.value })}>
                                        {generateTimeOptions().map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='d-flex flex-column gap-2'>
                                <label htmlFor='daysOff'>Days Off</label>
                                <select
                                    id='daysOff'
                                    className='form-select'
                                    multiple
                                    value={daysOff}
                                    onChange={(e) => selectDaysOff(e.target.value)}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='modal-footer d-flex justify-content-center'>
                        <button className='btn-main rounded shadow-sm mt-2' onClick={() => handleSaveSettings()}>
                            save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsCalendar;