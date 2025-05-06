import React from 'react';

import PlusSidebarLayout from '../../layouts/PlusSidebarLayout';
import Planner from './Planner';
import FormCalendar from './FormCalendar';

import '../../styles/Calendar.css';

import { CalendarProvider } from '../../contexts/CalendarContext';
import { TaskProvider } from '../../contexts/TaskContext';
import { PomodoroProvider } from '../../contexts/PomodoroContext';
import { ToolsProvider } from '../../contexts/ToolsContext';


const Calendar = () => {

    return (
        <CalendarProvider>
            <TaskProvider>
                <PomodoroProvider>
                    <ToolsProvider>
                        <PlusSidebarLayout childrenMain={<Planner />} childrenSide={<FormCalendar />} />
                    </ToolsProvider>
                </PomodoroProvider>
            </TaskProvider>
        </CalendarProvider>
    )
}

export default Calendar;
