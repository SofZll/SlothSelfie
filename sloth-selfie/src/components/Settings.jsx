import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react';

import { NewSwal } from '../utils/swalUtils';

import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const Settings = () => {
    const navigate = useNavigate();
    const { user, setUser, settings, setSettings } = useContext(AuthContext);

    const handleLogout = async () => {
        const response = await apiService('/user/logout', 'POST');
        if (response.success) setUser(null);
        else NewSwal.fire({ title: 'Error logging out', icon: 'error', text: response.message});
        setSettings(false);

        navigate('/login');
    }

    const handleSwitch = async (e, field) => {
        const value = e.target.checked;

        const response = await apiService('/user/disable-notifications', 'PUT', { field, value });
        if (response.success) {
            setUser((prevUser) => ({
                ...prevUser,
                disableNotifications: {
                    ...prevUser.disableNotifications,
                    [field]: value,
                },
            }));
            console.log('Disable notifications', response.disableNotifications);
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
    }

    return (
        <div className={`modal fade ${settings ? 'show d-block' : ''}`} id='settingsModal' tabIndex='-1' aria-labelledby='settingsModal' aria-hidden='true'>
            <div className='modal-dialog modal-dialog-centered'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h1 className='modal-title fs-5' id='exampleModalLabel'>Settings</h1>
                        <button type='button' className='btn-close' aria-label='Close' onClick={() => setSettings(!settings)}></button>
                    </div>
                    <div className='modal-body container'>
                        <div className='row'>
                            <h5>Account settings</h5>
                        </div>
                        <div className='row rounded-3 border border-secondary-subtle p-2 m-1 overflow-hidden'>
                            <div className='form-check form-switch col-12 ps-0 my-1 mb-2'>
                                <label className='form-check-label col-12 fw-medium' htmlFor='switchAll'>Disable all notifications</label>
                                <input className='form-check-input' type='checkbox' role='switch' id='switchAll' checked={user.disableNotifications.all} onChange={(e) => handleSwitch(e, 'all')} />
                            </div>
                            <hr className='hr-settings' />
                            <div className='form-check form-switch col-12 ps-0 my-1 mt-2'>
                                <label className='form-check-label col-12' htmlFor='switchSystem'>System notifications</label>
                                <input className='form-check-input' type='checkbox' role='switch' id='switchSystem' checked={user.disableNotifications.system} onChange={(e) => handleSwitch(e, 'system')} disabled={user.disableNotifications.all} />
                            </div>
                            <div className='form-check form-switch col-12 ps-0 my-1'>
                                <label className='form-check-label col-12' htmlFor='switchEmail'>Email notifications</label>
                                <input className='form-check-input' type='checkbox' role='switch' id='switchEmail' checked={user.disableNotifications.email} onChange={(e) => handleSwitch(e, 'email')} disabled={user.disableNotifications.all} />
                            </div>
                            <div className='form-check form-switch col-12 ps-0 my-1'>
                                <label className='form-check-label col-12' htmlFor='switchWork'>Work notifications outside working hours</label>
                                <input className='form-check-input' type='checkbox' role='switch' id='switchWork' checked={user.disableNotifications.outsideWorkingHours} onChange={(e) => handleSwitch(e, 'outsideWorkingHours')} disabled={user.disableNotifications.all} />
                            </div>
                            <div className='form-check form-switch col-12 ps-0 my-1'>
                                <label className='form-check-label col-12' htmlFor='switchDay'>Notifications outside day hours</label>
                                <input className='form-check-input' type='checkbox' role='switch' id='switchDay' checked={user.disableNotifications.outsideDayHours} onChange={(e) => handleSwitch(e, 'outsideDayHours')} disabled={user.disableNotifications.all} />
                            </div>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button type='button' className='btn btn-danger fw-medium' onClick={() => handleLogout()}>
                            <LogOut size={19} /> Log out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;