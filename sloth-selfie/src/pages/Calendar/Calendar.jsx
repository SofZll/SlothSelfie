import React from 'react';
import { useIsDesktop } from '../../utils/utils';

import MainLayout from '../../layouts/MainLayout';
import Planner from './Planner';
import FormCalendar from './FormCalendar';

import '../../styles/Calendar.css';

import { CalendarProvider } from '../../contexts/CalendarContext';


const Calendar = () => {

    const isDesktop = useIsDesktop();

    return (
        <MainLayout>
            <CalendarProvider>
                <div className='d-flex w-100 h-100'>

                    <div className='d-flex flex-column flex-grow-1 planner overflow-hidden'>
                        <Planner />
                    </div>
                    
                    {isDesktop && (
                        <div className='d-flex w-25'>
                            <FormCalendar />
                        </div>
                    )}
                </div>
            </CalendarProvider>
        </MainLayout>
    )
}

export default Calendar;
