import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';


const Planner = () => {

    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(BigCalendar);

    return (
        <DnDCalendar
            localizer={localizer}
            events={[]}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={null}
            titleAccessor="title"
            className='calendar-main'
            onEventDrop={null}
            resizable
        />
    )
}

export default Planner;