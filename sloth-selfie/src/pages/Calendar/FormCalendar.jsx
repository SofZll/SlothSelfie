import React, { useEffect } from 'react';

import SelectionCalendarLayout from '../../layouts/SelectionCalendarLayout';
import FormActivity from './FormActivity';
import FormEvent from './FormEvent';
import FormNoAvailability from './FormNoAvailability';
import FormTask from './FormTask';
import Button from '../../components/Button';
import ScrollListLayout from '../../components/ScrollList';

import { useCalendar } from '../../contexts/CalendarContext';
import { useIsDesktop } from '../../utils/utils';

const FormCalendar = () => {

    const { activities, selected, select } = useCalendar();
    const isDesktop = useIsDesktop();

    return (
        <div className='d-flex flex-column w-100 h-100'>
            <SelectionCalendarLayout>
                {selected.selection === '...' && (
                    <div className='d-flex flex-column col-11 col-lg-7 align-items-center py-3'>
                        <Button text='Activity' alt='new activity' onClick={() => select('activity', false)} />
                        <Button text='Event' alt='new event' onClick={() => select('event', false)} />
                        <Button text='no Availability' alt='no availability' onClick={() => select('no availability', false)} />
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