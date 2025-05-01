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
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="calendarOption"
                                    value="showCalendar"
                                    checked={customizations.calendar === 'showCalendar'}
                                    onChange={() => handleCustomizationChange('calendar', 'showCalendar')}
                                />
                                Show Calendar
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="calendarOption"
                                    value="showEventsList"
                                    checked={customizations.calendar === 'showEventsList'}
                                    onChange={() => handleCustomizationChange('calendar', 'showEventsList')}
                                />
                                Today's Events List
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="calendarOption"
                                    value="showActivitiesList"
                                    checked={customizations.calendar === 'showActivitiesList'}
                                    onChange={() => handleCustomizationChange('calendar', 'showActivitiesList')}
                                />
                                This Week's Activities List
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="calendarOption"
                                    value="showTasksList"
                                    checked={customizations.calendar === 'showTasksList'}
                                    onChange={() => handleCustomizationChange('calendar', 'showTasksList')}
                                />
                                This Week's Tasks List
                            </label>
                        </div>
                    </div>
                );
            case 'notes':
                return (
                    <div className='customization-options'>
                        <h5>Customize Notes</h5>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="notesOption"
                                    value="listOfNotes"
                                    checked={customizations.notes === 'listOfNotes'}
                                    onChange={() => handleCustomizationChange('notes', 'listOfNotes')}
                                />
                                Notes list (10 most recent)
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="notesOption"
                                    value="lastNote"
                                    checked={customizations.notes === 'lastNote'}
                                    onChange={() => handleCustomizationChange('notes', 'lastNote')}
                                />
                                Most recent Note
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="notesOption"
                                    value="addNote"
                                    checked={customizations.notes === 'addNote'}
                                    onChange={() => handleCustomizationChange('notes', 'addNote')}
                                />
                                Add a Note
                            </label>
                        </div>
                    </div>
                );
            case 'pomodoro':
                return (
                    <div className='customization-options'>
                        <h5>Customize Pomodoro</h5>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="pomodoroOption"
                                    value="quickStart"
                                    checked={customizations.pomodoro === 'quickStart'}
                                    onChange={() => handleCustomizationChange('pomodoro', 'quickStart')}
                                />
                                Quick Start
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="pomodoroOption"
                                    value="listOfPomodoros"
                                    checked={customizations.pomodoro === 'listOfPomodoros'}
                                    onChange={() => handleCustomizationChange('pomodoro', 'listOfPomodoros')}
                                />
                                Pomodoros ToDo list
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="pomodoroOption"
                                    value="lastPomodoro"
                                    checked={customizations.pomodoro === 'lastPomodoro'}
                                    onChange={() => handleCustomizationChange('pomodoro', 'lastPomodoro')}
                                />
                                Last Pomodoro
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="pomodoroOption"
                                    value="stats"
                                    checked={customizations.pomodoro === 'stats'}
                                    onChange={() => handleCustomizationChange('pomodoro', 'stats')}
                                />
                                Pomodoros Stats
                            </label>
                        </div>
                    </div>
                );
            case 'projects':
                return (
                    <div className='customization-options'>
                        <h5>Customize Projects</h5>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="projectsOption"
                                    value="listOfProjects"
                                    checked={customizations.projects === 'listOfProjects'}
                                    onChange={() => handleCustomizationChange('projects', 'listOfProjects')}
                                />
                                Projects list
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="projectsOption"
                                    value="recentProjectsDeadlines"
                                    checked={customizations.projects === 'recentProjectsDeadlines'}
                                    onChange={() => handleCustomizationChange('projects', 'recentProjectsDeadlines')}
                                />
                                Recent Projects deadlines
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="projectsOption"
                                    value="projectGanttChart"
                                    checked={customizations.projects === 'projectGanttChart'}
                                    onChange={() => handleCustomizationChange('projects', 'projectGanttChart')}
                                />
                                Choose a project's Gantt
                            </label>
                        </div>
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
