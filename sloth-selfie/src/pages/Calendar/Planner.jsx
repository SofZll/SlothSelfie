import React, { useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import { useIsDesktop } from '../../utils/utils';
import ScrollListLayout from '../../components/ScrollList';

import { useActivity } from '../../contexts/ActivityContext';
import { useEvent } from '../../contexts/EventContext';

const Planner = () => {


    const isDesktop = useIsDesktop();

    const { activity, setActivity, activities, setActivities } = useActivity();
    const { event, setEvent, events, setEvents } = useEvent();

    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(BigCalendar);


        

    return (
        <>
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

            {!isDesktop && (
                <ScrollListLayout CardList={activities} smallView={false} />
            )}
        </>
    )
}

export default Planner;