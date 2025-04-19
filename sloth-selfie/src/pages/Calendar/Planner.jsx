import React, { useState, useEffect, useContext } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import Swal from 'sweetalert2';

import { useIsDesktop, dateFromDate, timeFromDate } from '../../utils/utils';
import { validateNotification } from '../../utils/validation';
import ScrollList from '../../components/ScrollList';
import FormCalendar from './FormCalendar';
import PlusLayout from '../../layouts/PlusLayout';

import { AuthContext } from '../../contexts/AuthContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';

import { apiService } from '../../services/apiService';

const Planner = () => {

    const isDesktop = useIsDesktop();

    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(BigCalendar);

    const { user } = useContext(AuthContext);
    const { setActivity, activities, setActivities, setEvent, events, setEvents, selected, setSelected, notifications, setNotifications, setConditionsMet } = useCalendar();
    const { setTask, tasks, setTasks } = useTask();

    const [listNormal, setListNormal] = useState([]);

    const fetchEvents = async () => {
        const response = await apiService('/events', 'GET');
        if (response) setEvents(response);
    }

    const fetchActivities = async () => {
        const response = await apiService('/activities', 'GET');
        if (response) setActivities(response);
    }

    const fetchTasks = async () => {
        const response = await apiService('/tasks', 'GET');
        if (response) setTasks(response);
    }

    const fetchNotifications = async ({ elementId }) => {
        const response = await apiService(`/notifications/${elementId}`, 'GET');
        if (response) {
            if (response.notifications.length > 0) {
                setNotifications(response.notifications.map(notification => {
                    return {
                        ...notification,
                        fromDate: dateFromDate(new Date(notification.from)),
                        fromTime: timeFromDate(new Date(notification.from)),
                    }
                }));
            } else setNotifications([]);
        } else setNotifications([]);
    }

    const normalizeData = (datas, type) => {
        if (!Array.isArray(datas)) return [];

        return (type === 'event' ? datas : datas.filter(data => !data.completed && data.deadline)).map(data => {
            return {
                _id: data._id,
                title: data.title,
                user: data.user,
                ...(type === 'event' ? {
                    start: new Date(data.start),
                    end: new Date(data.end),
                } : {
                    ...(new Date(data.deadline) < new Date() ? { 
                        late: true,
                        start: new Date(),
                        end: new Date(),
                    } : {
                        late: false,
                        start: new Date(data.deadline),
                        end: new Date(data.deadline),
                    }),
                }),
                type: type
            };
        });
    }

    const onItemSelect = async (item) => {
        if (item.type === 'activity'){
            const a = activities.find(a => a._id === item._id);
            setActivity({...a, sharedWith: a.sharedWith.map(u => u.username)});
            await fetchNotifications({ elementId: a._id });
        } else if (item.type === 'event') {
            const e = events.find(e => e._id === item._id);
            setEvent({...e, sharedWith: e.sharedWith.map(u => u.username)});
            await fetchNotifications({ elementId: e._id });
        } else {
            const t = tasks.find(t => t._id === item._id);
            setTask({...t, sharedWith: t.sharedWith.map(u => u.username)});
        }
        
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

    const eventStyleGetter = (event) => {
        if (event.type === 'activity') {
            return {
                style: {
                    backgroundColor: event.late ? 'red' : 'lightblue',
                }
            }
        } else if (event.type === 'task') {
            return {
                style: {
                    backgroundColor: event.late ? 'red' : 'lightgreen',
                }
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

    useEffect(() => {
        if (notifications.length > 0) {
            let flag;
            notifications.forEach(notification => {
                if (notification.type === 'default') flag = validateNotification(notification, 1);
                else flag = validateNotification(notification, 2);
                flag = flag && validateNotification(notification, 3);
            });
            if (!flag) {
                setConditionsMet(false);
            } else setConditionsMet(true);
        } else {
            setConditionsMet(true);
        }

        // TODO: check validity of activity and event
    }, [notifications]);

    return (
        <PlusLayout clickCall={() => setSelected({ ...selected, add: true, popUp: true })} selected={selected.popUp} popUp={<FormCalendar />}>
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
                    eventPropGetter={eventStyleGetter}
                    resizable
                />
            </div>

            {!isDesktop && (
                <ScrollList CardList={activities} smallView={true} />
            )}
        </PlusLayout>
    )
}

export default Planner;