import React, { useState }  from 'react';

import SelectionCalendarLayout from '../../layouts/SelectionCalendarLayout';
import FormActivity from './FormActivity';
import Button from '../../components/Button';

const FormCalendar = () => {

    const [selection, setSelection] = useState('...');
    const [edit, setEdit] = useState(false);
    
    return (
        <SelectionCalendarLayout selection={selection} setSelection={setSelection}>
            {selection === '...' && (
                <div className='d-flex flex-column col-11 col-lg-7 align-items-center py-3'>
                    <Button text='Activity' alt='new activity' onClick={() => setSelection('activity')} />
                    <Button text='Event' alt='new event' onClick={() => setSelection('event')} />
                    <Button text='no Availability' alt='no availability' onClick={() => setSelection('no availability')} />
                </div>
            )}

            {selection === 'activity' && (
                <FormActivity edit={edit} setEdit={setEdit} />
            )}


        </SelectionCalendarLayout>
    )
}

export default FormCalendar;