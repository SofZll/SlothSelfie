import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { NewSwal } from '../utils/swalUtils';

import { generateTimeOptions } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const Settings = () => {
    const { setUser } = useContext(AuthContext);

    const handleLogout = async () => {
        const response = await apiService('/user/logout', 'POST');
        if (response.success) setUser(null);
        else NewSwal.fire({ title: 'Error logging out', icon: 'error', text: response.message});

        navigate('/login');
    }

    return (
        <div className='modal fade' id='settingsModal' tabIndex='-1' aria-labelledby='settingsModal' aria-hidden='true'>
            <div className='modal-dialog modal-dialog-centered'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h1 className='modal-title fs-5' id='exampleModalLabel'>Modal title</h1>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                    </div>
                    <div className='modal-body'>
                        ...
                    </div>
                    <div className='modal-footer'>
                        <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Close</button>
                        <button type='button' className='btn btn-primary'>Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;