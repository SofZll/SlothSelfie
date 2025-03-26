import React, { useState } from 'react';
import '../styles/setting.css';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';


import { X } from 'lucide-react';

function PreviewSetUp(props) {

    const [isSetting, setIsSetting] = useState('calendar');
    const navigate = useNavigate();

    const handleSetUp = () => {
        props.setSetUp(false);
        navigate('..');
    };

    const handleSetting = (setting) => {
        setIsSetting(setting);
    };

    return (
        <div className='d-flex position-relative rounded-3 mb-5 p-3 bg-white card-settings'>
            <button className='btn position-absolute end-0 top-0' onClick={handleSetUp} alt='exit'>
                <X size={36} color='#555B6E' strokeWidth={1.75} />
            </button>
            
            <div className='d-flex flex-row w-100'>
                <div className='d-flex flex-column border-end r-col'>
                    <Button text='Calendar' alt='calendar' onClick={() => handleSetting('calendar')} />
                    <Button text='Notes' alt='notes' onClick={() => handleSetting('notes')} />
                    <Button text='Pomodoro' alt='pomodoro' onClick={() => handleSetting('pomodoro')} />
                    <Button text='Projects' alt='projects' onClick={() => handleSetting('projects')} />
                </div>

                <div className='cd-flex flex-column l-col'>
                </div>
            </div>
            
        </div>
    );
}

export default PreviewSetUp;
