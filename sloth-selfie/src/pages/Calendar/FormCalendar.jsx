import React from 'react';

import Swal from 'sweetalert2';

import SelectionCalendarLayout from '../../layouts/SelectionCalendarLayout';
import FormActivity from './FormActivity';
import FormEvent from './FormEvent';
import FormNoAvailability from './FormNoAvailability';
import FormTask from './FormTask';
import Button from '../../components/Button';
import ScrollListLayout from '../../components/ScrollList';

import { useCalendar } from '../../contexts/CalendarContext';
import { useIsDesktop } from '../../utils/utils';

import { apiService } from '../../services/apiService';

const FormCalendar = () => {

    const { activities, selected, select } = useCalendar();
    const isDesktop = useIsDesktop();

    // Function to handle the upload of a .ics file as event
    const handleICSUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('icsFile', file);
    
        try {
            const response = await apiService('/events/import', 'POST', formData, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            
            });

            console.log('Imported event:', response);
    
            Swal.fire({
                title: 'Import success!',
                icon: 'success',
                text: 'Event imported successfully',
                customClass: { confirmButton: 'button-alert' }
            }); //TODO: COME FACCIO FETCH DEGLI EVENTI IMPORTATI QUI?

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

    return (
        <div className='d-flex flex-column w-100 h-100'>
            <SelectionCalendarLayout>
                {selected.selection === '...' && (
                    <div className='d-flex flex-column col-11 col-lg-8 align-items-center py-3'>
                        <Button text='Activity' alt='new activity' onClick={() => select('activity', false)} />
                        <Button text='Event' alt='new event' onClick={() => select('event', false)} />
                        <Button text='no Availability' alt='no availability' onClick={() => select('no availability', false)} />
                        {/* Button to import an event as .ics files */}
                        <input id='ics-upload'type='file'accept='.ics'onChange={handleICSUpload} style={{ display: 'none' }}/>
                        <Button text='Import .ics' alt='import ics' onClick={() => document.getElementById('ics-upload').click()} />
                    </div>
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
            
            {isDesktop && (
                <ScrollListLayout CardList={activities} smallView={false} />
            )}

        </div>
    )
}

export default FormCalendar;