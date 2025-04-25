import React, { useState, useEffect, useContext } from 'react';

import { Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/SettingsButton.css';

import { generateTimeOptions } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';

const SettingsButton = ({ color }) => {
    const { user, setUser } = useContext(AuthContext);

    const [showSettingsOptions, setShowSettingsOptions] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [workHours, setWorkHours] = useState({ start: '', end: '', daysOff: [] });

    const validateWorkHours = () => {
        // start hour must be before the end hour
        if (workHours.start >= workHours.end) {
            Swal.fire({
                title: 'Invalid time range',
                text: 'The start time must be earlier than the end time.',
                icon: 'error',
                customClass: { confirmButton: 'button-alert' }
            });
            return false;
        }
        return true;
    };

    const handleSelectSetting = (setting) => {
        setSelectedSetting(setting);
        if (setting === 'workHours') {
            setShowSettings(true);
        }
    };

    const handleCloseSettings = () => {
        setShowSettings(false);
        setShowSettingsOptions(false);
    };

    const handleSaveSettings = async () => {
        if (validateWorkHours()) {
            try {
                const updatedData = {
                    workingHours: {
                        start: workHours.start,
                        end: workHours.end
                    },
                    freeDays: workHours.daysOff
                };
    
                const response = await fetch('http://localhost:3000/api/user/edit-schedule', { //TODO CAMBIA NEL SERVER
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workingHours: { start: workHours.start, end: workHours.end },
                        freeDays: workHours.daysOff,
                        userId : user._id,
                    })
                });
                const data = await response.json();
                console.log('Response:', data);
                
                if (response.ok) {
                    console.log('Profile updated successfully:', response);
                    Swal.fire({
                        title: 'Success',
                        text: ' Settings saved correctly!',
                        icon: 'success',
                        customClass: { confirmButton: 'button-success' }
                    });
                    setUser({
                        ...user,
                        workingHours: updatedData.workingHours,
                        freeDays: updatedData.freeDays
                    });
                    setShowSettings(false);
                    setShowSettingsOptions(false);
                } else {
                    console.error('Failed to update profile:', response);
                    Swal.fire({
                        title: 'Error',
                        text: 'There was an issue saving your settings. Please try again.',
                        icon: 'error',
                        customClass: { confirmButton: 'button-alert' }
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'There was an issue saving your settings. Please try again later.',
                    icon: 'error',
                    customClass: { confirmButton: 'button-alert' }
                });
            }
        }
    };

    useEffect(() => {
        // Pre-populate the user settings with the UserContext fetch
        if (user) {
            setWorkHours({
                start: user.workingHours?.start || '',
                end: user.workingHours?.end || '',
                daysOff: user.freeDays || []
            });
        }
    }, [user]);

    return (
        <>
            <button className={`settings-button button-clean ${color === 'dark' ? 'white' : ' ' } mt-3`} onClick={() => setShowSettingsOptions(!showSettingsOptions)}>
                <Settings size='30' color={color === 'dark' ? '#1c2135' : '#fff'} strokeWidth='1.75' />
            </button>
            
            {showSettingsOptions && !showSettings && (
                <div className="settings-options">
                    <div className='modal-overlay'>
                        <div className='modal-content'>
                        <button className='button-clean white mt-3 ' onClick={handleCloseSettings}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
                                <path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                            <button className='button-clean white mt-3 ' onClick={() => handleSelectSetting('workHours')}>Work schedule settings</button>
                            <button className='button-clean white mt-3 ' onClick={() => handleSelectSetting('notifications')}>Notification Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {showSettings && selectedSetting === 'workHours' && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <button className='button-clean white mt-3 ' onClick={handleCloseSettings}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
                                <path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        <h3>Work schedule settings</h3>

                        {/* Start Time */}
                        <label>Start:</label>
                        <select
                            value={workHours.start}
                            onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
                        >
                            {generateTimeOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* End Time */}
                        <label>End:</label>
                        <select
                            value={workHours.end}
                            onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
                        >
                            {generateTimeOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Days Off */}
                        <label>Days off:</label>
                        <select multiple value={workHours.daysOff} onChange={(e) => setWorkHours({ ...workHours, daysOff: Array.from(e.target.selectedOptions, option => option.value) })}>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                        </select>
                        <button className='button-clean white mt-3' onClick={handleSaveSettings}>Save</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default SettingsButton;