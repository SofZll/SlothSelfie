import React, { useState, useEffect, useContext } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

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
    const { activity, setActivity, activities, setActivities, setEvent, events, setEvents, selected, setSelected, notifications, setNotifications, setConditionsMet, availabilities, setAvailabilities, setAvailability } = useCalendar();
    const { setTask, tasks, setTasks } = useTask();

    const [show, setShow] = useState('plans');

    const [listNormal, setListNormal] = useState([]);

    const fetchEvents = async () => {
        const response = await apiService('/events', 'GET');
        if (response.success) setEvents(response.events);
    }

    const fetchActivities = async () => {
        const response = await apiService('/activities', 'GET');
        if (response.success) setActivities(response.activities);
    }

    const fetchTasks = async () => {
        const response = await apiService('/tasks', 'GET');
        if (response.success) setTasks(response.tasks);
    }

    const fetchPomodoros = async () => {
    }

    const fetchNoAvailability = async () => {
        const response = await apiService('/no-availabilities', 'GET');
        if (response.success) setAvailabilities(response.noAvailability);
    }

    const fetchNotifications = async ({ elementId }) => {
        const response = await apiService(`/notifications/${elementId}`, 'GET');
        if (response.success) {
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

        if (type === 'no availability') {
            return datas.map(data => {
                return {
                    _id: data._id,
                    title: 'No Availability for group events',
                    user: data.user,
                    start: new Date(data.startDate),
                    end: new Date(data.endDate),
                    type: 'no availability'
                };
            });
        }

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
        } else if (item.type === 'task') {
            const t = tasks.find(t => t._id === item._id);
            setTask({...t, sharedWith: t.sharedWith.map(u => u.username)});
        } else if (item.type === 'no availability') {
            const na = availabilities.find(na => na._id === item._id);
            if (na.days) setAvailability({ ...na});
            else setAvailability({ ...na, startTime: timeFromDate(new Date(na.startDate)), duration: (new Date(na.endDate) - new Date(na.startDate)) / (1000 * 60 * 60) });
        }
        
        setSelected({selection: item.type, edit: true, add: false, popUp: !isDesktop});
    }

    //event and activity are the same
    const onEventDrop = async ({ event, start }) => {
        let deadline, date;

        if (event.type === 'no availability') return;

        if (event.type === 'activity') {
            deadline = new Date(start);
            deadline.setHours(0, 0, 0, 0);
        } else date = new Date(start);

        if (event.type === 'activity') {
            const a = activities.find(a => a._id === event._id);
            const response = await apiService(`/activity/${a._id}`, 'PUT', { ...a, deadline });
            if (response.success) setActivities(activities.map(a => a._id === event._id ? response.activity : a));
        } else if (event.type === 'event') {
            const e = events.find(e => e._id === event._id);
            const response = await apiService(`/event/${e._id}`, 'PUT', { ...e, date });
            if (response.success) setEvents(events.map(e => e._id === event._id ? response.event : e));
        } else {
            const t = tasks.find(t => t._id === event._id);
            const response = await apiService(`/task/${t._id}`, 'PUT', { ...t, deadline });
            if (response.success) setTasks(tasks.map(t => t._id === event._id ? response.task : t));
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
        } else if (event.type === 'no availability') {
            return {
                style: {
                    backgroundColor: 'gray',
                }
            }
        }
    }

    useEffect(() => {
        fetchActivities();
        fetchEvents();
        fetchTasks();
        fetchPomodoros();
        fetchNoAvailability();
    }, [user, show]);

    
    useEffect(() => {
        if (show === 'plans') setListNormal([...normalizeData(activities, 'activity'), ...normalizeData(events, 'event'), ...normalizeData(tasks, 'task')]);
        //else if (show === 'pomodoro') setListNormal([...normalizeData(activities, 'activity'), ...normalizeData(events, 'event'), ...normalizeData(tasks, 'task')]);
        if (show === 'no availability') setListNormal([...normalizeData(availabilities, 'no availability')]);
    }, [activities, events, tasks, availabilities, show]);

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

            {!isDesktop && (
                <div className='d-flex w-100'>
                    <div className='btn-group ms-4' role='group'>
                        <button type='button' className='btn btn-light border-secondary-subtle m-0 px-3' onClick={() => setShow('no availability')}>No Availability</button>
                        <button type='button' className='btn btn-light border-secondary-subtle border-start-0 border-end-0 m-0 px-3' onClick={() => setShow('pomodoro')}>Pomodoros</button>
                        <button type='button' className='btn btn-light border-secondary-subtle m-0 px-3' onClick={() => setShow('plans')}>Plans</button>
                    </div>
                </div>
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
                    eventPropGetter={eventStyleGetter}
                    resizable
                />
            </div>

            {isDesktop ? (
                <div className='d-flex w-100'>
                    <div className='btn-group ms-4' role='group'>
                        <button type='button' className='btn btn-light border-secondary-subtle m-0 px-3 ' onClick={() => setShow('no availability')}>No Availability</button>
                        <button type='button' className='btn btn-light border-secondary-subtle border-start-0 border-end-0 m-0 px-3' onClick={() => setShow('pomodoro')}>Pomodoros</button>
                        <button type='button' className='btn btn-light border-secondary-subtle m-0 px-3' onClick={() => setShow('plans')}>Plans</button>
                    </div>
                </div>
            ) : (
                <ScrollList CardList={activities} smallView={true} />
            )}
        </PlusLayout>
    )
}

export default Planner;