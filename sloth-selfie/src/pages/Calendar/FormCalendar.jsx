import React from 'react';

import { NewSwal } from '../../utils/swalUtils';
import { Download } from 'lucide-react';

import SelectionCalendarLayout from '../../layouts/SelectionCalendarLayout';
import FormActivity from './FormActivity';
import FormEvent from './FormEvent';
import FormNoAvailability from './FormNoAvailability';
import FormTask from './FormTask';
import FormPomodoro from './FormPomodoro';
import Button from '../../components/Button';
import ScrollList from '../../components/ScrollList';

import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';
import { useIsDesktop } from '../../utils/utils';

import { apiService } from '../../services/apiService';

const FormCalendar = () => {

    const { activities, selected, select, addImportedEvents, activity, event } = useCalendar();
    const { task } = useTask();
    const isDesktop = useIsDesktop();

    // Function to handle the upload of .ics files as events
    const handleICSUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
    
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('icsFiles', file);
        });
    
        try {
            const response = await apiService('/events/import', 'POST', formData, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            
            });

            console.log('Imported events:', response);
            addImportedEvents(response.importedEvents);
    
            NewSwal.fire({
                title: 'Import success!',
                icon: 'success',
                text: 'Event imported successfully',
                customClass: { confirmButton: 'button-alert' }
            });

        } catch (err) {
            console.error('Error importing ICS:', err);
            NewSwal.fire({
                title: 'Error importing .ics',
                icon: 'error',
                text: 'Error importing .ics file',
                customClass: { confirmButton: 'button-alert' }
            });
        }
    };

    const exportData = async () => {
        let path = '';

        if (selected.selection === 'activity') path = `/activity/${activity._id}/export`;
        else if (selected.selection === 'event') path = `/event/${event._id}/export`;
        else if (selected.selection === 'task') path = `/task/${task._id}/export`;

        const response = await apiService(path, 'GET');
        if (!response) NewSwal.fire({ title: 'Error exporting data', icon: 'error', text: 'Error exporting data'});
        else {

            const a = document.createElement('a');
            a.href = URL.createObjectURL(response);
            if (selected.selection === 'activity') a.download = `${activity.title}.ics`;
            else if (selected.selection === 'event') a.download = `${event.title}.ics`;
            else if (selected.selection === 'task') a.download = `${task.title}.ics`;
            a.click();

            NewSwal.fire({ title: 'Export success!', icon: 'success', text: `${selected.selection} exported successfully, a mail with .ics attachment will be sent to you`});
        }

    }


    return (
        <div className='d-flex flex-column w-100 h-100 overflow-y-auto overflow-x-hidden position-relative'>

            {isDesktop && (
                <ScrollList CardList={activities} smallView={false} />
            )}

            <SelectionCalendarLayout>
                {selected.selection === '...' && (
                    <div className='d-flex flex-column col-11 col-lg-8 align-items-center py-3'>
                        <Button text='Activity' alt='new activity' onClick={() => select('activity', false)} />
                        <Button text='Event' alt='new event' onClick={() => select('event', false)} />
                        <Button text='no Availability' alt='no availability' onClick={() => select('no availability', false)} />
                        {/* Button to import an event as .ics files */}
                        <input id='ics-upload' type='file' accept='.ics' multiple onChange={handleICSUpload} style={{ display: 'none' }}/>
                        <Button text='Import .ics' alt='import ics' onClick={() => document.getElementById('ics-upload').click()} />
                    </div>
                )}

                {selected.selection === 'activity' && (
                    <div className="formPopup">
                        <FormActivity />
                    </div>
                )}

                {selected.selection === 'event' && (
                    <div className="formPopup">
                        <FormEvent />
                    </div>
                )}

                {selected.selection === 'no availability' && (
                    <div className="formPopup">
                        <FormNoAvailability />
                    </div>
                )}

                {selected.selection === 'task' && (
                    <div className="formPopup">
                        <FormTask />
                    </div>
                )}

                {selected.selection === 'pomodoro' && (
                    <div className="formPopup w-100">
                        <FormPomodoro />
                    </div>
                )}

                {selected.edit && (selected.selection === 'activity' || selected.selection === 'event' || selected.selection === 'task') && (
                    <button className='btn position-absolute bottom-0 start-0 m-1 p-1 bg-white shadow-sm' onClick={() => exportData()}>
                        <Download size='27' color='#555B6E' strokeWidth='1.75' />
                    </button>
                )}

            </SelectionCalendarLayout>
        </div>
    )
}

export default FormCalendar;