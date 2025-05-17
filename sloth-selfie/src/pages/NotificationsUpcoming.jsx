import React, { useEffect, useState } from 'react';

import { AlertTriangle } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';
import { formatDate } from '../utils/utils';

import { LoadingPageDark } from './LoadingPage';
import { apiService } from '../services/apiService';

const NotificationsUpcoming = ({ loading, setLoading, refreshKey, handleNotificationClick, showHistory }) => {
    const [notifications, setNotifications] = useState([]);

    const handleSnoozeNotif = (index) => async () => {
        console.log('notifications:', notifications);
        console.log('Snooze time:', new Date(notifications[index].triggerAt));
        const snoozeTime = new Date(notifications[index].triggerAt);
        const snoozeInterval = 10;
        snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeInterval);
        
        const response = await apiService(`/notification/snooze/${notifications[index]._id}`, 'PUT', { snoozeInterval });
        if (!response.success) NewSwal.fire({ title: 'Error', icon: 'error', text: response.message});
        else {
            setNotifications(notifications.map((notif, i) => i === index ? { ...notif, triggerAt: snoozeTime.toISOString() } : notif));
            window.location.reload();
        }
    }

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
            console.log('Notifications:', response);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            NewSwal.fire({ title: 'Error', icon: 'error', text: 'Failed to fetch notifications' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [refreshKey, showHistory]);

    return (
        <>
            <div className='mb-4 bg-white p-3 border rounded-2'>
                <h4>UPCOMING NOTIFICATIONS</h4>
                <p className='px-2 fs-6 text-secondary'>* Here you can view the upcoming notifications and snooze them, to modify or to delete them you have to go to the activity or event page.</p>
            </div>
            {notifications.length > 0 ? (
                <div className='d-flex flex-column gap-3 overflow-y-scroll'>
                    {notifications.map((notif, index) => (
                        <div key={index} className='bg-white border shadow-sm p-3 rounded-2'>
                            <div className='d-flex flex-column gap-2'>
                                <p className='cursor-pointer' onClick={() => handleNotificationClick(notif)}>
                                    {notif.elementType === 'Activity' ? '📝 Activity: ' : '📅 Event: '}
                                    <strong>{notif.element.title}</strong>
                                </p>
                                {notif.type === 'repeat' && <p className='text-secondary'>Type: {notif.type} every {notif.before} {notif.variant}</p>}
                                {notif.type === 'default' && <p className='text-secondary'>Type: {notif.before} {notif.variant} before</p>}
                                <p className='text-secondary'>{notif.elementType === 'Activity' ? 'Deadline: ' : 'Date: '}{formatDate(notif.to)}</p>
                                <p>Next notification at: {formatDate(notif.triggerAt)}</p>
                                <div className='d-flex gap-2 mt-1'>
                                    {notif.urgency && <span className='d-flex items-center gap-1'><AlertTriangle size={16} /> Urgente</span>}
                                    {/* permettere all'utente di selezionare il tempo di snooze */}
                                    <button className='btn btn-outline-success' onClick={handleSnoozeNotif(index)}>Postpone 10 minutes</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                loading ? <LoadingPageDark /> : <p className='ps-2'>Nessuna notifica pianificata.</p>
            )}
        </>
    )
}

export default NotificationsUpcoming;