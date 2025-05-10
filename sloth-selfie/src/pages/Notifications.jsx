import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';

import '../styles/Notifications.css';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/apiService';
import { TimeMachineContext } from '../contexts/TimeMachineContext';
import { LoadingPageDark } from './LoadingPage';

const Notifications = () => {
    const { refreshKey } = useContext(TimeMachineContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiService('/notifications/upcoming');
            if (response.success) {
                setNotifications(response.notifications.map(notification => {
                    return {
                        ...notification,
                        triggerAt: new Date(notification.triggerAt).toISOString(),
                    }
                }));
            } else setNotifications([]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            NewSwal.fire({ title: 'Error', icon: 'error', text: 'Failed to fetch notifications' });
        } finally {
            setLoading(false);
        }
    }

    const handleSnoozeNotif = (index) => async () => {
        const snoozeTime = new Date(notifications[index].triggerAt);
        const snoozeInterval = 10;
        snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeInterval);
        
        const response = await apiService(`/notification/snooze/${notifications[index]._id}`, 'PUT', { snoozeInterval });
        if (response.success) {
            setNotifications(notifications.map((notif, i) => i === index ? { ...notif, triggerAt: snoozeTime.toISOString() } : notif));
            window.location.reload();
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message});
    }

    const handleNotificationClick = (notif) => {
        let path = '';
        if (notif.elementType === 'Activity') {
            path = 'https://slothselfie.com/calendar/activity#' + notif.element._id + '#' + notif._id;
        } else if (notif.elementType === 'Event') {
            path = 'https://slothselfie.com/calendar/event#' + notif.element._id + '#' + notif._id;
        }
        navigate(path);
    }

    // TODO: spostare in utils
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('it-IT');

    useEffect(() => {
        fetchNotifications();
    }, [refreshKey]);
    
    return (
        <MainLayout>
            <div className="p-2 notifications-container h-75 d-flex flex-column">
                <div className="mb-4 bg-white p-3 border rounded-2">
                    <h2>Notifications</h2>
                    <p className='px-2 fs-6 text-secondary'>* Here you can view the upcoming notifications and snooze them, to modify or to delete them you have to go to the activity or event page.</p>
                </div>
                {notifications.length > 0 ? (
                    <div className="d-flex flex-column gap-3 overflow-y-scroll">
                        {notifications.map((notif, index) => (
                            <div key={index} className="bg-white border shadow-sm p-3 rounded-2">
                                <div className='d-flex flex-column gap-2'>
                                    <p>
                                        {notif.elementType === 'Activity' ? '📝 Activity: ' : '📅 Event: '}
                                        <strong onClick={() => handleNotificationClick(notif._id)}>{notif.element.title}</strong>
                                    </p>
                                    {notif.type === 'repeat' && <p className='text-secondary'>Type: {notif.type} every {notif.before} {notif.variant}</p>}
                                    {notif.type === 'default' && <p className='text-secondary'>Type: {notif.before} {notif.variant} before</p>}
                                    <p className='text-secondary'>{notif.elementType === 'Activity' ? 'Deadline: ' : 'Date: '}{formatDate(notif.to)}</p>
                                    <p>Next notification at: {formatDate(notif.triggerAt)}</p>
                                    <div className="d-flex gap-2 mt-1">
                                        {notif.urgency && <span className="d-flex items-center gap-1"><AlertTriangle size={16} /> Urgente</span>}
                                        {/* permettere all'utente di selezionare il tempo di snooze */}
                                        <button className='btn btn-outline-success' onClick={handleSnoozeNotif(notif)}>Postpone 10 minutes</button>
                                        {notif.type === 'repeat' && <button className='btn btn-outline-warning'>Skip this one</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    loading ? <LoadingPageDark /> : <p className='ps-2'>Nessuna notifica pianificata.</p>
                )}
            </div>
        </MainLayout>
    )
}

export default Notifications;