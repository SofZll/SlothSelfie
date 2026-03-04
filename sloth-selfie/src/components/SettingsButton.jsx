import React, { useState, useEffect, useContext } from 'react';

import { Settings } from 'lucide-react';

import { AuthContext } from '../contexts/AuthContext';

const SettingsButton = ({ dark, isCalendar = false }) => {
    const { setCalendarSettings, calendarSettings, setSettings, settings } = useContext(AuthContext);

    return (
        <button className='button-clean rounded-circle p-2 mt-1' type='button' aria-label='settings' title='Settings' onClick={() => {
            if (isCalendar) setCalendarSettings(!calendarSettings);
            else setSettings(!settings);
        }}>
            <Settings size={dark ? 30 : 22} color={dark ? '#888' : '#fff'} strokeWidth='1.75' />
        </button>
    )
}

export default SettingsButton;