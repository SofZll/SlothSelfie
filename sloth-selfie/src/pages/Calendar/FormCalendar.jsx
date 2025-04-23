import React from 'react';

import Swal from 'sweetalert2';
import { Download } from 'lucide-react';

import SelectionCalendarLayout from '../../layouts/SelectionCalendarLayout';
import FormActivity from './FormActivity';
import FormEvent from './FormEvent';
import FormNoAvailability from './FormNoAvailability';
import FormTask from './FormTask';
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

    //TODO TESTA E MODIFICA IN BASE A NUOVO MODELLO EVENTI
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
    
            Swal.fire({
                title: 'Import success!',
                icon: 'success',
                text: 'Event imported successfully',
                customClass: { confirmButton: 'button-alert' }
            });

        } catch (err) {
            console.error('Error importing ICS:', err);
            Swal.fire({
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
        if (!response) Swal.fire({ title: 'Error exporting data', icon: 'error', text: 'Error exporting data', customClass: { confirmButton: 'button-alert' } });
        else {

            const a = document.createElement('a');
            a.href = URL.createObjectURL(response);
            if (selected.selection === 'activity') a.download = `${selected.selection}_${activity.title}.ics`;
            else if (selected.selection === 'event') a.download = `${selected.selection}_${event.title}.ics`;
            else if (selected.selection === 'task') a.download = `${selected.selection}_${task.title}.ics`;
            a.click();

            Swal.fire({ title: 'Export success!', icon: 'success', text: `${selected.selection} exported successfully, a mail with .ics attachment will be sent to you`, customClass: { confirmButton: 'button-alert' } });
        }

    }


    return (
        <div className='d-flex flex-column w-100 h-100 overflow-y-auto overflow-x-hidden position-relative'>

            {isDesktop && (
                <ScrollList CardList={activities} smallView={false} />
            )}

            <SelectionCalendarLayout>
                {selected.selection === '...' ? (
                    <div className='d-flex flex-column col-11 col-lg-8 align-items-center py-3'>
                        <Button text='Activity' alt='new activity' onClick={() => select('activity', false)} />
                        <Button text='Event' alt='new event' onClick={() => select('event', false)} />
                        <Button text='no Availability' alt='no availability' onClick={() => select('no availability', false)} />
                        {/* Button to import an event as .ics files */}
                        <input id='ics-upload' type='file' accept='.ics' multiple onChange={handleICSUpload} style={{ display: 'none' }}/>
                        <Button text='Import .ics' alt='import ics' onClick={() => document.getElementById('ics-upload').click()} />
                    </div>
                ) : (
                    <>
                    {selected.selection !== 'no availability' && selected.edit && (
                        <button className='btn position-absolute bottom-0 start-0 translate-middle-y' onClick={() => exportData()}>
                            <Download size='27' color='#555B6E' strokeWidth='1.75' />
                        </button>
                    )}
                    </>
                )}


                {selected.selection === 'activity' && (
                    <FormActivity />
                )}

                {selected.selection === 'event' && (
                    <FormEvent />
                )}

                {selected.selection === 'no availability' && (
                    <FormNoAvailability />
                )}

                {selected.selection === 'task' && (
                    <FormTask />
                )}

            </SelectionCalendarLayout>
        </div>
    )
}

export default FormCalendar;