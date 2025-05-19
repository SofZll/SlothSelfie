import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import Select from 'react-select';

import { useIsDesktop, timeFromDate } from '../../utils/utils';
import { validateNotification } from '../../utils/validation';
import ScrollList from '../../components/ScrollList';
import SettingsCalendar from '../../components/SettingsCalendar';
import FormCalendar from './FormCalendar';
import PlusLayout from '../../layouts/PlusLayout';
import DeleteFromCalendar from './DeleteFromCalendar';

import { TimeMachineContext } from '../../contexts/TimeMachineContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { useTask } from '../../contexts/TaskContext';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { useTools } from '../../contexts/ToolsContext';

import { apiService } from '../../services/apiService';

const Planner = () => {
    console.log('Planner');
    const { getVirtualNow, refreshKey } = useContext(TimeMachineContext);
    const now = getVirtualNow();
    const location = useLocation();
    const navigate = useNavigate();
      
    const [calendarView, setCalendarView] = useState('month');
    const [date, setDate] = useState(getVirtualNow());
    
    const isDesktop = useIsDesktop();

    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(BigCalendar);

    const { user } = useContext(AuthContext);
    const { setActivity, activities, setActivities, setEvent, events, setEvents, selected, setSelected, notifications, fetchNotifications, setConditionsMet, availabilities, setAvailabilities, setAvailability, show, setShow, deletePopUp } = useCalendar();
    const { setTask, tasks, setTasks } = useTask();
    const { rooms, devices, setRooms, setDevices, selectedRooms, setSelectedRooms, selectedDevices, setSelectedDevices, toolEvents, setToolEvents, toolAvailabilities, setToolAvailabilities } = useTools();
    const { setPlannedPomodori, plannedPomodori, setSettingsPomodoro } = usePomodoro();


    const [listNormal, setListNormal] = useState([]);

    const roomOptions = [
        ...rooms.map(room => ({ value: room._id, label: room.username }))
    ];

    const deviceOptions = [
        ...devices.map(device => ({ value: device._id, label: device.username }))
    ];


    const normalizeData = useCallback((datas, type) => {
        if (!Array.isArray(datas)) return [];

        if (type === 'no availability' || type === 'no availability tool') {

            return datas.map((data) => {
                return {
                    _id: data._id,
                    title: data.title || 'No Availability for group events',
                    user: data.user,
                    start: new Date(data.startDate),
                    end: new Date(data.endDate),
                    type: 'no availability',
                    allDay: data.days,
                    tool: type === 'no availability tool',
                };
            });
        } else if (type === 'event' || type === 'event tool') {
            return datas.map((data) => {
                return {
                    _id: data._id,
                    title: data.title,
                    user: data.user,
                    ...(data.allDay ? {
                        start: new Date(data.startDate).setHours(0, 0, 0, 0),
                        end: new Date(data.endDate).setHours(23, 59, 59, 999),
                    } : {
                        start: new Date(data.startDate),
                        end: new Date(data.endDate),
                    }),
                    type: 'event',
                    inProject: data.isInProject,
                    allDay: data.allDay,
                    tool: type === 'event tool',
                };
            });
        } else {
            return datas.filter(data => !data.completed && data.deadline).map(data => {
                const deadline = new Date(data.deadline);
                const isLate = deadline < now;

                const start = isLate ? new Date(now.setHours(0, 0, 0, 0)) : new Date(deadline.setHours(0, 0, 0, 0));
                const end = isLate ? new Date(now.setHours(23, 59, 59, 999)) : new Date(deadline.setHours(23, 59, 59, 999));
    
                return {
                    _id: data._id,
                    title: data.title,
                    user: data.user,
                    start: start,
                    end: end,
                    type: type,
                    late: isLate,
                    durationEditable: false,
                    allDay: true,
                };
            });
        }
    }, [now]);

    const onItemSelect = async (item) => {
        if (item.type === 'activity'){
            setActivity({...activities.find(a => a._id === item._id)})
            await fetchNotifications({ elementId: item._id });
        } else if (item.type === 'event') {
            let e;
            if (item.tool) e = toolEvents.find(ev => ev._id === item._id);
            else e = events.find(ev => ev._id === item._id);
            console.log('event', e);
            if (e.allDay) {
                setEvent({ ...e, duration: (new Date(e.endDate).getDate() - new Date(e.startDate).getDate() + 1), time: '', isPreciseTime: false, fatherId: e.fatherId || '', repeatMode: (e.repeatTimes && e.repeatTimes > 0) ? 'ntimes' : 'until', tool: item.tool });
            } else {
                const minutes = [0, 15, 30, 45];
                const time = timeFromDate(new Date(e.startDate));
                setEvent({ ...e, time, duration: (new Date(e.endDate).getHours() - new Date(e.startDate).getHours()), isPreciseTime: !minutes.includes(new Date(e.startDate).getMinutes()), fatherId: e.fatherId || '', repeatMode: (e.repeatTimes && e.repeatTimes > 0) ? 'ntimes' : 'until', tool: item.tool });
            }
            await fetchNotifications({ elementId: item._id });
        } else if (item.type === 'task') {
            setTask({...tasks.find(t => t._id === item._id)});
        } else if (item.type === 'no availability') {
            let na;
            if (item.tool) na = toolAvailabilities.find(na => na._id === item._id);
            else na = availabilities.find(na => na._id === item._id);

            if (na.days) setAvailability({ ...na, tool: item.tool});
            else setAvailability({ ...na, startTime: timeFromDate(new Date(na.startDate)), duration: (new Date(na.endDate) - new Date(na.startDate)) / (1000 * 60 * 60), tool: item.tool });
        } else if (item.type === 'pomodoro') {
            const p = plannedPomodori.find(p => p._id === item._id);
            await setSettingsPomodoro({ ...p });
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
            const response = await apiService(`/event/${e._id}`, 'PUT', { ...e, startDate: start, endDate: end });
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
        } else if (event.type === 'event') {
            if (event.inProject) {
                return {
                    style: {
                        backgroundColor: 'orange',
                    }
                }
            }
        }

    }

    const handleChange = (type) => (newValue) => {
        const listId = newValue.map(item => item.value);
       
        if (type === 'room') {
            setSelectedRooms([...listId]);
        } else if (type === 'device') {
            setSelectedDevices([...listId]);
        }
    }

    useEffect(() => {
        const sr = rooms.filter(opt => selectedRooms.includes(opt._id));
        const sd = devices.filter(opt => selectedDevices.includes(opt._id));

        const eventsSelected = [];
        const availabilitiesSelected = [];
        const eventsId = new Set();

        for (let i = 0; i < sr.length; i++) {
            const ev = sr[i].events.filter(e => !eventsId.has(e._id));
        
            ev.forEach(e => eventsId.add(e._id));
            
            eventsSelected.push(...ev);
            availabilitiesSelected.push(...sr[i].availabilities.map(na => ({ ...na, title: `${sr[i].username} no Availability` })));
        }

        for (let i = 0; i < sd.length; i++) {
            const ev = sd[i].events.filter(e => !eventsId.has(e._id));
        
            ev.forEach(e => eventsId.add(e._id));
            
            eventsSelected.push(...ev);
            availabilitiesSelected.push(...sd[i].availabilities.map(na => ({ ...na, title: `${sd[i].username} no Availability` })));
        }

        setToolEvents([...eventsSelected]);
        setToolAvailabilities([...availabilitiesSelected]);

    }, [selectedRooms, selectedDevices, rooms, devices]);

    const dayPropGetter = useCallback((date) => ({
        className: moment(date).isSame(now, 'day') ? 'virtual-day' : ''
    }), [now]);

    useEffect(() => {
        const fetchData = async () => {
            if (user.isAdmin) {
                const response = await apiService('/users/tools', 'GET');
                if (response.success) {
                    setRooms(response.rooms);
                    setDevices(response.devices);
                }
            } else {
                const [activitiesResponse, eventsResponse, tasksResponse, pomodorosResponse, noAvailabilityResponse, toolsResponse] = await Promise.all([
                    apiService('/activities', 'GET'),
                    apiService('/events', 'GET'),
                    apiService('/tasks', 'GET'),
                    apiService('/pomodori/todo', 'GET'),
                    apiService('/no-availabilities', 'GET'),
                    apiService('/users/tools', 'GET')
                ]);

                if (activitiesResponse.success) setActivities(activitiesResponse.activities);
                if (eventsResponse.success) setEvents(eventsResponse.events);
                if (tasksResponse.success) setTasks(tasksResponse.tasks);
                if (pomodorosResponse.success) setPlannedPomodori(pomodorosResponse.pomodori);
                if (noAvailabilityResponse.success) setAvailabilities(noAvailabilityResponse.noAvailability);
                if (toolsResponse.success) {
                    setRooms(toolsResponse.rooms);
                    setDevices(toolsResponse.devices);
                }
            }
        };
    
        fetchData();
    }, [user, refreshKey]);

    useEffect(() => {
        if (!activities.length || !events.length) return;

        const openELement = async () => {
            const params = new URLSearchParams(location.search);
            const type = params.get('type');
            const id = params.get('element');
            console.log('type', type);
            console.log('id', id);

            if (type && id) {
                if (type === 'Activity') {
                    const activity = activities.find(a => a._id === id);
                    if (activity) {
                        setActivity({ ...activity });
                        console.log('activity', activity);
                        setSelected({ selection: 'activity', edit: true, add: false, popup: true });
                    } else navigate(location.pathname, { replace: true });
                } else if (type === 'Event') {
                    const event = events.find(e => e._id === id);
                    if (event) {
                        setEvent({ ...event });
                        console.log('event', event);
                        setSelected({ selection: 'event', edit: true, add: false, popup: true });
                    } else navigate(location.pathname, { replace: true });
                } // aggiungere task e pomodoro
                await fetchNotifications({ elementId: id });
            }
        }

        openELement();
    }, [location, activities, events]);

    useEffect(() => {
        if (show === 'plans') {
            if (!user.isAdmin) {
                setListNormal([...normalizeData(activities, 'activity'), ...normalizeData(events, 'event'), ...normalizeData(tasks, 'task')]);
            } else {
                setListNormal([...normalizeData(toolEvents, 'event tool')]);
            }
        } else if (show === 'tools') {
            setListNormal([...normalizeData(toolAvailabilities, 'no availability tool')]);
        } else if (show === 'pomodoro') setListNormal([...normalizeData(plannedPomodori, 'pomodoro')]);
        else if (show === 'no availability') {
            if (!user.isAdmin) {
                setListNormal([...normalizeData(availabilities, 'no availability')]);
            } else {
                setListNormal([...normalizeData(toolAvailabilities, 'no availability tool')]);
            }
        }
    }, [activities, events, tasks, availabilities, show, plannedPomodori, rooms, devices, selectedRooms, selectedDevices, user.isAdmin, toolEvents, toolAvailabilities]);

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
        <>
            <PlusLayout clickCall={() => setSelected({ edit:false, add: true, popup: true, selection: '...' })} selected={selected.popup} popUp={<FormCalendar />} isCalendar={true}>

                <SettingsCalendar />

                {!isDesktop && (
                    <div className='d-flex w-100 justify-content-center flex-column'>
                        <div className='btn-group' role='group'>
                            <button type='button' aria-label='availability' className={`btn btn-light border-secondary-subtle m-0 px-3 fs-small ${show === 'no availability' && 'bg-secondary-subtle'}`} onClick={() => setShow('no availability')}>Availability</button>
                            {!user.isAdmin && (
                                <>
                                    <button type='button' aria-label='pomodoros' className={`btn btn-light border-secondary-subtle border-start-0 border-end-0 m-0 px-3 fs-small ${show === 'pomodoro' && 'bg-secondary-subtle'}`} onClick={() => setShow('pomodoro')}>Pomodoros</button>
                                    <button type='button' aria-label='tools' className={`btn btn-light border-secondary-subtle border-end-0 m-0 px-3 fs-small ${show === 'tools' && 'bg-secondary-subtle'}`} onClick={() => setShow('tools')}>Tools</button>
                                </>
                            )}
                            <button type='button' aria-label='plans' className={`btn btn-light border-secondary-subtle m-0 px-3 fs-small ${show === 'plans' && 'bg-secondary-subtle'}`} onClick={() => setShow('plans')}>Plans</button>
                        </div>

                        {(show === 'tools' || user.isAdmin) && (
                            <div className='d-flex w-100 justify-content-center'>
                                <div className='col-6 mt-2'>
                                    <Select
                                    isMulti
                                    menuPlacement='auto'
                                    classNamePrefix='rooms'
                                    options={roomOptions}
                                    value={roomOptions.filter(opt => selectedRooms.includes(opt.value))}
                                    onChange={handleChange('room')}
                                    placeholder={'0 rooms'}
                                    />
                                </div>
                                <div className='col-6 mt-2'>
                                    <Select
                                    isMulti
                                    menuPlacement='auto'
                                    classNamePrefix='rooms'
                                    options={deviceOptions}
                                    value={deviceOptions.filter(opt => selectedDevices.includes(opt.value))}
                                    onChange={handleChange('device')}
                                    placeholder={'0 devices'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                

                <div className='d-flex justify-content-center align-items-center w-100 h-100 pt-3'>
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
                        dayPropGetter={dayPropGetter}
                        view={calendarView}
                        onView={(view) => setCalendarView(view)}
                        date={date}
                        onNavigate={(date) => setDate(date)}
                        resizable
                    />
                </div>

                {isDesktop ? (
                    <div className='d-flex w-100 justify-content-between align-items-center p-3'>
                        <div className='btn-group ms-4' role='group'>
                            <button type='button' aria-label='availability' className={`btn btn-light border-secondary-subtle m-0 px-3 ${show === 'no availability' && 'bg-secondary-subtle'}`} onClick={() => setShow('no availability')}>Availability</button>
                            {!user.isAdmin && (
                                <>
                                    <button type='button' aria-label='pomodoros' className={`btn btn-light border-secondary-subtle border-start-0 border-end-0 m-0 px-3 ${show === 'pomodoro' && 'bg-secondary-subtle'}`} onClick={() => setShow('pomodoro')}>Pomodoros</button>
                                    <button type='button' aria-label='tools' className={`btn btn-light border-secondary-subtle border-end-0 m-0 px-3 ${show === 'tools' && 'bg-secondary-subtle'}`} onClick={() => setShow('tools')}>Tools</button>
                                </>
                            )}
                            <button type='button' aria-label='plans' className={`btn btn-light border-secondary-subtle m-0 px-3 ${show === 'plans' && 'bg-secondary-subtle'}`} onClick={() => setShow('plans')}>Plans</button>
                        </div>

                        {(show === 'tools' || user.isAdmin) && (
                            <div className='d-flex justify-content-center align-items-center w-50'>
                                <div className='col-6'>
                                    <Select
                                    isMulti
                                    menuPlacement='auto'
                                    classNamePrefix='roomsDesktop'
                                    options={roomOptions}
                                    value={roomOptions.filter(opt => selectedRooms.includes(opt.value))}
                                    onChange={handleChange('room')}
                                    placeholder={'0 rooms'}
                                    />
                                </div>
                                <div className='col-6'>
                                    <Select
                                    isMulti
                                    menuPlacement='auto'
                                    classNamePrefix='devicesDesktop'
                                    options={deviceOptions}
                                    value={deviceOptions.filter(opt => selectedDevices.includes(opt.value))}
                                    onChange={handleChange('device')}
                                    placeholder={'0 devices'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <ScrollList CardList={(user.isAdmin || show === 'tools') ? [...rooms, ...devices] : activities} smallView={true} activity={!(user.isAdmin || show === 'tools')} />
                )}
                
            </PlusLayout>

            <DeleteFromCalendar />
        </>
    )
}

export default Planner;