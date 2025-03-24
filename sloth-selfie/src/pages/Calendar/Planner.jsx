import React, { useState, useEffect, useContext } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import { Plus } from 'lucide-react';

import { useIsDesktop } from '../../utils/utils';
import ScrollList from '../../components/ScrollList';
import FormCalendar from './FormCalendar';

import { UserContext } from '../../contexts/UserContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';

import { apiService } from '../../services/apiService';

const Planner = () => {

    const isDesktop = useIsDesktop();

    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(BigCalendar);

    const { user } = useContext(UserContext);
    const { setActivity, activities, setActivities, setEvent, events, setEvents, selected, setSelected } = useCalendar();
    const { setTask, tasks, setTasks } = useTask();

    const [listNormal, setListNormal] = useState([]);


    const fetchActivities = async () => {
        const response = await apiService('/activities', 'GET');
        if (response) setActivities(response);
    }

    const fetchEvents = async () => {
        const response = await apiService('/events', 'GET');
        if (response) setEvents(response);
    }

    const fetchTasks = async () => {
        const response = await apiService('/tasks', 'GET');
        if (response) setTasks(response.filter(task => task.deadline));
    }

    const normalizeData = (datas, type) => {
        if (!Array.isArray(datas)) return [];

        return (type === 'activity' ? datas.filter(data => !data.completed && data.deadline)
            :  (type === 'task' ? datas.filter(data => !data.completed) : datas)).map(data => {
            return {
                _id: data._id,
                title: data.title,
                user: data.user,
                ...(type === 'event' ? {
                    start: new Date(data.start),
                    end: new Date(data.end),
                } : {
                    start: new Date(data.deadline),
                    end: new Date(data.deadline),
                }),
                type: type
            };
        });
    }

    const onItemSelect = (item) => {
        if (item.type === 'activity') setActivity(activities.find(a => a._id === item._id));
        else if (item.type === 'event') setEvent(events.find(event => event._id === item._id));
        else setTask(tasks.find(task => task._id === item._id));
        
        setSelected({selection: item.type, edit: true, add: false, popUp: !isDesktop});
    }

    //event and activity are the same
    const onEventDrop = async ({ event, start }) => {
        let deadline, date;

        if (event.type === 'activity') {
            deadline = new Date(start);
            deadline.setHours(0, 0, 0, 0);
        }
        else date = new Date(start);

        if (event.type === 'activity') {
            const a = activities.find(a => a._id === event._id);
            const response = await apiService(`/activity/${a._id}`, 'PUT', { ...a, deadline });
            if (response) {
                setActivities(activities.map(a => a._id === event._id ? response : a));
            }
        } else if (event.type === 'event') {
            const e = events.find(e => e._id === event._id);
            const response = await apiService(`/event/${e._id}`, 'PUT', { ...e, date });
            if (response) {
                setEvents(events.map(e => e._id === event._id ? response : e));
            }
        } else {
            const t = tasks.find(t => t._id === event._id);
            const response = await apiService(`/task/${t._id}`, 'PUT', { ...t, deadline });
            if (response) {
                setTasks(tasks.map(t => t._id === event._id ? response : t));
            }
        }
    }

    useEffect(() => {
        if (user) {
            fetchActivities();
            fetchEvents();
            fetchTasks();
        }
    }, [user]);
    
    useEffect(() => {
        setListNormal([...normalizeData(activities, 'activity'), ...normalizeData(events, 'event'), ...normalizeData(tasks, 'task')]);
    }, [activities, events, tasks]);

    return (
        <div className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>

            {!isDesktop && (
                <>
                    <button className='btn-main rounded-circle p-2 position-fixed end-0 mx-3 btn-plus pop-up' alt='add' onClick={() => setSelected({ ...selected, add: true, popUp: true })}>
                        <Plus size={36} color='#fafafa' strokeWidth={1.75} />
                    </button>

                    {selected.popUp && (
                        <div className='d-flex flex-column w-75 bg-white rounded p-3 position-fixed top-50 start-50 translate-middle pop-up shadow-lg'>
                            <FormCalendar />
                        </div>
                    )}
                </>
            )}

            <div className='d-flex justify-content-center align-items-center w-100 h-75 py-3'>
                <DnDCalendar
                    localizer={localizer}
                    events={listNormal}
                    startAccessor='start'
                    endAccessor='end'
                    onSelectEvent={onItemSelect}
                    titleAccessor='title'
                    className='calendar-main'
                    onEventDrop={onEventDrop}
                    resizable
                />

                
            </div>

            {!isDesktop && (
                <ScrollList CardList={activities} smallView={true} />
            )}
        </div>
    )
}

export default Planner;