import React, { useState, useEffect, useContext } from 'react';

import { Settings } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';

import { AuthContext } from '../contexts/AuthContext';

const SettingsButton = ({ dark }) => {
    const { setSetting } = useContext(AuthContext);

    return (
        <button className='btn rounded-circle p-1 m-0' onClick={() => setSetting({ open: true, section: '' })}>
            <Settings size={dark ? 30 : 22} color={dark ? '#244476' : '#fff'} strokeWidth='1.75' />
        </button>
    )
}

export default SettingsButton;