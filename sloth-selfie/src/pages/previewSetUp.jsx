import React, { useState, useContext  } from 'react';
import '../styles/setting.css';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { CustomizationContext } from '../contexts/PreviewContext';


import { X } from 'lucide-react';

function PreviewSetUp(props) {
    const [isSetting, setIsSetting] = useState('calendar');
    const { customizations, setCustomizations } = useContext(CustomizationContext);
    const navigate = useNavigate();

    const handleSetUp = () => {
        props.setSetUp(false);
        navigate('..');
    };

    const handleSetting = (setting) => {
        setIsSetting(setting);
    };

    const handleCustomizationChange = (setting, option) => {
        setCustomizations(prev => {
            const newCustomizations = { ...prev, [setting]: option };
            console.log("Updated Customizations inside setCustomizations:", newCustomizations);

            // Save the personalizations to local storage
            localStorage.setItem('customizations', JSON.stringify(newCustomizations));
            return newCustomizations;
        });
    };

    const renderCustomizationOptions = () => {
        switch (isSetting) {
            case 'calendar':
                return (
                    <div className='customization-options'>
                        <h5>Customize Calendar</h5>
                        <Button 
                            text="Show Calendar" 
                            onClick={() => handleCustomizationChange('calendar', 'showCalendar')} 
                        />
                        <Button 
                            text="Today's Events list"
                            onClick={() => handleCustomizationChange('calendar', 'showEventsList')} 
                        />
                        <Button 
                            text="This week's Activities List"
                            onClick={() => handleCustomizationChange('calendar', 'showActivitiesList')}
                        />
                        {/* other calendar personalizations */}
                    </div>
                );
            case 'notes':
                return (
                    <div className='customization-options'>
                        <h5>Customize Notes</h5>
                        <Button 
                            text="Notes list (10 most recent)"
                            onClick={() => handleCustomizationChange('notes', 'listOfNotes')} 
                        />
                        <Button 
                            text="Most recent Note"
                            onClick={() => handleCustomizationChange('notes', 'lastNote')} 
                        />
                        {/* other notes personalizations */}
                    </div>
                );
            case 'pomodoro':
                return (
                    <div className='customization-options'>
                        <h5>Customize Pomodoro</h5>
                        <Button 
                            text="Quick Start"
                            onClick={() => handleCustomizationChange('pomodoro', 'quickStart')} 
                        />
                        <Button 
                            text="Pomodoros list"
                            onClick={() => handleCustomizationChange('pomodoro', 'listOfPomodoros')} 
                        />
                        <Button 
                            text="Last Pomodoro"
                            onClick={() => handleCustomizationChange('pomodoro', 'lastPomodoro')} 
                        />
                        {/* other pomodoro personalizations */}
                    </div>
                );
            case 'projects':
                return (
                    <div className='customization-options'>
                        <h5>Customize Projects</h5>
                        <Button 
                            text="Projects list"
                            onClick={() => handleCustomizationChange('projects', 'listOfProjects')} 
                        />
                        <Button 
                            text="Recent Projects deadlines"
                            onClick={() => handleCustomizationChange('projects', 'recentProjectsDeadlines')}
                        />
                        {/* other projects personalizations */}
                    </div>
                );
            default:
                return null;
        }
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
                    {renderCustomizationOptions()}
                </div>
            </div>
            
        </div>
    );
}

export default PreviewSetUp;
