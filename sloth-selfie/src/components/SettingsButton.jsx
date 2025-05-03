import React, { useState, useEffect, useContext } from 'react';

import { Settings } from 'lucide-react';

import { AuthContext } from '../contexts/AuthContext';

const SettingsButton = ({ dark, isCalendar = false }) => {
    console.log('isCalendar', isCalendar);
    const { setCalendarSettings, calendarSettings } = useContext(AuthContext);

    return (
        <button className='btn rounded-circle p-1 m-0' onClick={() => {
            if (isCalendar) {
                setCalendarSettings(!calendarSettings);
                console.log('calendarSettings', calendarSettings);
                
            }
            }}
        >
            <Settings size={dark ? 30 : 22} color={dark ? '#888' : '#fff'} strokeWidth='1.75' />
        </button>
    )
}

export default SettingsButton;