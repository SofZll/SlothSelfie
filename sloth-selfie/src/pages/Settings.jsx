import React, { useState, useEffect, useContext } from 'react';

import Swal from 'sweetalert2';

import { generateTimeOptions } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const Settings = () => {

    const { user, setUser, setting, setSetting, resetSetting } = useContext(AuthContext);

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
        if (setting.section === 'calendar') {
            const response = await apiService('/user/edit-schedule', 'PUT', {daysOff, workingHours, dayHour});
            if (response.success){
                Swal.fire({ title: 'Success', text: 'Settings saved correctly!', icon: 'success', customClass: { confirmButton: 'button-success' } });
                setUser({ ...user, workingHours: {...response.workingHours}, freeDays: [...response.freeDays], dayHours: {...response.dayHours} });
            } else Swal.fire({ title: 'Error', text: 'There was an issue saving your settings. Please try again.', icon: 'error', customClass: { confirmButton: 'button-alert' } });
        }

        resetSetting();
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

    return (
        <div className='d-flex h-100 w-100 justify-content-center align-items-center position-fixed bg-dark bg-opacity-25' style={{ zIndex: '1000'}}>
        <div className='d-flex justify-content-center align-items-start position-fixed pop-up bg-white border border-secondary rounded' style={{ width: '350px', minHeight: '350px' }}>
            <div className='modal-dialog custom-modal my-3 d-flex h-100'>
                <div className='modal-content p-3 h-100 d-flex flex-column justify-content-between'>

                    <div className='modal-header w-100 d-flex align-items-center justify-content-between border-bottom border-secondary'>
                        {setting.section === '' && (
                            <h5 className='modal-title py-2' style={{ color: '#244476' }}>Settings</h5>
                        )}

                        {setting.section === 'calendar' && (
                            <h5 className='modal-title py-2' style={{ color: '#244476' }}>Calendar Settings</h5>
                        )}

                        {setting.section === 'notification' && (
                            <h5 className='modal-title' style={{ color: '#244476' }}>Notification Settings</h5>
                        )}

                        <button type='button' className='close' onClick={() => resetSetting()}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className='modal-body overflow-y-scroll col-12' style={{ maxHeight: 'calc(80vh - 200px)' }}>
                        

                        {setting.section === '' && (
                            <div className='d-flex flex-column justify-content-around h-100 py-5 gap-3'>
                                <button className='btn btn-outline-secondary' onClick={() => setSetting({ section: 'calendar', open: true })}>
                                    Calendar

                                </button>
                                <button className='btn btn-outline-secondary' onClick={() => setSetting({ section: 'notification', open: true })}>
                                    Notification
                                </button>
                            </div>
                        )}

                        {setting.section === 'calendar' && (
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
                        )}

                        {setting.section === 'notification' && (
                            <></>
                        )}
                    </div>


                    {setting.section !== '' && (
                        <div className='d-flex align-items-center justify-content-center w-100 border-top border-secondary'>
                            <button className='btn-main rounded shadow-sm mt-2' onClick={() => handleSaveSettings()}>
                                save
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}

export default Settings;