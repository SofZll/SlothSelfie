import React, { useState, useEffect, useContext } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import { useIsDesktop, timeFromDate } from '../../utils/utils';
import { validateNotification } from '../../utils/validation';
import ScrollList from '../../components/ScrollList';
import FormCalendar from './FormCalendar';
import PlusLayout from '../../layouts/PlusLayout';

import { AuthContext } from '../../contexts/AuthContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';
import { usePomodoro } from '../../contexts/PomodoroContext';

import { apiService } from '../../services/apiService';

const Planner = () => {

    const isDesktop = useIsDesktop();

    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(BigCalendar);

    const { user } = useContext(AuthContext);
    const { setActivity, activities, setActivities, setEvent, events, setEvents, selected, setSelected, notifications, fetchNotifications, setConditionsMet, availabilities, setAvailabilities, setAvailability } = useCalendar();
    const { setTask, tasks, setTasks } = useTask();
    const { setPlannedPomodori, plannedPomodori, settingsPomodoro, setSettingsPomodoro } = usePomodoro();

    const [show, setShow] = useState('plans');

    const [listNormal, setListNormal] = useState([]);

    const fetchEvents = async () => {
        const response = await apiService('/events', 'GET');
        if (response.success) setEvents(response.events);
    }

    const fetchActivities = async () => {
        const response = await apiService('/activities', 'GET');
        if (response.success) setActivities(response.activities);
        console.log('activities', response.activities);
    }

    const fetchTasks = async () => {
        const response = await apiService('/tasks', 'GET');
        if (response.success) setTasks(response.tasks);
    }

    const fetchPomodoros = async () => {
        const response = await apiService('/pomodori/todo', 'GET');
        if (response.success) setPlannedPomodori(response.pomodori);
    }

    const fetchNoAvailability = async () => {
        const response = await apiService('/no-availabilities', 'GET');
        if (response.success) setAvailabilities(response.noAvailability);
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
                    type: 'no availability',
                    allDay: data.days,
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
                        start: new Date().setHours(0, 0, 0, 0),
                        end: new Date().setHours(23, 59, 59, 999),
                    } : {
                        late: false,
                        start: new Date(data.deadline).setHours(0, 0, 0, 0),
                        end: new Date(data.deadline).setHours(23, 59, 59, 999),
                    }),
                    allDay: true,
                    durationEditable: false,
                }),
                type: type
            };
        });
    }

    const onItemSelect = async (item) => {
        if (item.type === 'activity'){
            setActivity({...activities.find(a => a._id === item._id)})
            await fetchNotifications({ elementId: item._id });
        } else if (item.type === 'event') {
            setEvent({...events.find(e => e._id === item._id)});
            await fetchNotifications({ elementId: item._id });
        } else if (item.type === 'task') {
            setTask({...tasks.find(t => t._id === item._id)});
        } else if (item.type === 'no availability') {
            const na = availabilities.find(na => na._id === item._id);
            if (na.days) setAvailability({ ...na});
            else setAvailability({ ...na, startTime: timeFromDate(new Date(na.startDate)), duration: (new Date(na.endDate) - new Date(na.startDate)) / (1000 * 60 * 60) });
        } else if (item.type === 'pomodoro') {
            const p = plannedPomodori.find(p => p._id === item._id);
            await setSettingsPomodoro({ ...p });
            console.log(p);
            console.log(settingsPomodoro);
        }
        
        if (item.type === 'pomodoro') setSelected({selection: item.type, add: false, popup: !isDesktop});
        else setSelected({selection: item.type, edit: true, add: false, popup: !isDesktop});
    }

    const onActivityTaskPomodoroDrop = async ({ event, start }) => {
        let deadline = new Date(start);
        deadline.setHours(23, 59, 59, 999);
        if (event.type === 'activity') {
            const a = activities.find(a => a._id === event._id);
            const response = await apiService(`/activity/${a._id}`, 'PUT', { ...a, deadline });
            if (response.success) setActivities(activities.map(a => a._id === event._id ? response.activity : a));
        } else if (event.type === 'task') {
            const t = tasks.find(t => t._id === event._id);
            const response = await apiService(`/task/${t._id}`, 'PUT', { ...t, deadline });
            if (response.success) setTasks(tasks.map(t => t._id === event._id ? response.task : t));
        } else if (event.type === 'pomodoro') {
            const p = plannedPomodori.find(p => p._id === event._id);
            const response = await apiService(`/pomodoro/${p._id}`, 'PUT', { ...p, deadline });
            if (response.success) setPlannedPomodori(plannedPomodori.map(p => p._id === event._id ? response.pomodoro : p));
        }
    }

    //event and activity are the same
    const onEventDrop = async ({ event, start, end }) => {

        if (event.type === 'activity' || event.type === 'task' || event.type === 'pomodoro') return onActivityTaskPomodoroDrop({ event, start });
        else if (event.type === 'event') {
            const e = events.find(e => e._id === event._id);
            const response = await apiService(`/event/${e._id}`, 'PUT', { ...e, start, end });
            if (response.success) setEvents(events.map(e => e._id === event._id ? response.event : e));
        } else if (event.type === 'no availability') {
            const na = availabilities.find(na => na._id === event._id);
            const response = await apiService(`/no-availability/${na._id}`, 'PUT', { ...na, startDate: start, endDate: end });
            if (response.success) {
                if (na.repeatFrequency === 'none') setAvailabilities(availabilities.map(na => na._id === event._id ? response.noAvailability : na));
                else setAvailabilities([...availabilities.filter(noAvailability => noAvailability.fatherId !== na.fatherId), ...response.listNoAvailability]);
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
        } else if (event.type === 'no availability') {
            return {
                style: {
                    backgroundColor: 'gray',
                }
            }
        } else if (event.type === 'pomodoro') {
            return {
                style: {
                    backgroundColor: event.late ? 'red' : 'lightyellow',
                    border: event.late ? 'none' : '2px solid orange',
                    color: event.late ? 'white' : 'orange',
                    
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
        else if (show === 'pomodoro') setListNormal([...normalizeData(plannedPomodori, 'pomodoro')]);
        else if (show === 'no availability') setListNormal([...normalizeData(availabilities, 'no availability')]);
    }, [activities, events, tasks, availabilities, show, plannedPomodori]);

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
        <PlusLayout clickCall={() => setSelected({ ...selected, add: true, popup: true })} selected={selected.popup} popUp={<FormCalendar />}>

            {!isDesktop && (
                <div className='d-flex w-100 justify-content-center'>
                    <div className='btn-group' role='group'>
                        <button type='button' className={`btn btn-light border-secondary-subtle m-0 px-3 ${show === 'no availability' && 'bg-secondary-subtle'}`} onClick={() => setShow('no availability')}>No Availability</button>
                        <button type='button' className={`btn btn-light border-secondary-subtle border-start-0 border-end-0 m-0 px-3 ${show === 'pomodoro' && 'bg-secondary-subtle'}`} onClick={() => setShow('pomodoro')}>Pomodoros</button>
                        <button type='button' className={`btn btn-light border-secondary-subtle m-0 px-3 ${show === 'plans' && 'bg-secondary-subtle'}`} onClick={() => setShow('plans')}>Plans</button>
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
                        <button type='button' className={`btn btn-light border-secondary-subtle m-0 px-3 ${show === 'no availability' && 'bg-secondary-subtle'}`} onClick={() => setShow('no availability')}>No Availability</button>
                        <button type='button' className={`btn btn-light border-secondary-subtle border-start-0 border-end-0 m-0 px-3 ${show === 'pomodoro' && 'bg-secondary-subtle'}`} onClick={() => setShow('pomodoro')}>Pomodoros</button>
                        <button type='button' className={`btn btn-light border-secondary-subtle m-0 px-3 ${show === 'plans' && 'bg-secondary-subtle'}`} onClick={() => setShow('plans')}>Plans</button>
                    </div>
                </div>
            ) : (
                <ScrollList CardList={activities} smallView={true} />
            )}
        </PlusLayout>
    )
}

export default Planner;