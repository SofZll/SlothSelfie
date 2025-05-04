import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'

import { NewSwal } from '../utils/swalUtils';

import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const Settings = () => {
    const navigate = useNavigate();
    const { setUser, settings, setSettings } = useContext(AuthContext);

    const handleLogout = async () => {
        const response = await apiService('/user/logout', 'POST');
        if (response.success) setUser(null);
        else NewSwal.fire({ title: 'Error logging out', icon: 'error', text: response.message});

        navigate('/login');
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
                        <div className='row'>
                            <h5>Notifications settings</h5>
                            <div class='form-check form-switch col-12 ps-0'>
                                <label class='form-check-label col-11' for='switchNotification'>Disable notifications</label>
                                <input class='form-check-input' type='checkbox' role='switch' id='switchNotification' />
                            </div>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button type='button' className='btn btn-danger' onClick={handleLogout}>Log out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;