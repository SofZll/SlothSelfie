import React from 'react';

import PlusSidebarLayout from '../../layouts/PlusSidebarLayout';
import Planner from './Planner';
import FormCalendar from './FormCalendar';

import '../../styles/Calendar.css';

import { CalendarProvider } from '../../contexts/CalendarContext';
import { TaskProvider } from '../../contexts/TaskContext';


const Calendar = () => {

    return (
        <CalendarProvider>
            <TaskProvider>
                <PlusSidebarLayout childrenMain={<Planner />} childrenSide={<FormCalendar />} />
            </TaskProvider>
        </CalendarProvider>
    )
}

export default Calendar;
